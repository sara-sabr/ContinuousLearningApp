import { DatabaseOperations } from "./db";
import { ClientConfig, Client } from "pg"
import * as path from "path"
import { async } from "rxjs/internal/scheduler/async";
import { AssertionError } from "assert";

describe("Database Schema Tests", () => {
    const testDatabaseName = process.env.API_TEST_DATABASE_NAME || "continuous_learning_app_test_db"
    const testDatabaseHost = process.env.API_TEST_DATABASE_HOST || "localhost"
    const testDatabasePort = parseInt(process.env.API_TEST_DATABASE_PORT) || 5432
    const testDatabaseUser = process.env.API_TEST_DATABASE_USER
    const testDatabasePassword = process.env.API_TEST_DATABASE_PASSWORD
    const testDatabaseConfiguration: ClientConfig = {
        host: testDatabaseHost,
        port: testDatabasePort,
        database: testDatabaseName,
        user: testDatabaseUser,
        password: testDatabasePassword,
    }
    const db_ops: DatabaseOperations = new DatabaseOperations(testDatabaseConfiguration)
    const ddl_path = path.join(__dirname.replace(__filename, ""), "ddl")
    const ddl = DatabaseOperations.load_ddl(ddl_path)
    let client: Client
    
    beforeEach(async () => {
        await db_ops.destroyDatabaseSchema()
        
        try{
            await db_ops.createDatabaseSchema(ddl)
            client = db_ops.getClient()
        }
        catch(error){
            console.log("Failed to initiate test: Could not create schema")
            throw error
        }

        await client.connect()
    })
    afterEach(async () => {
        await db_ops.endClient()
        await db_ops.destroyDatabaseSchema()
    })
    
    describe("links table tests", () => {
        describe("fields tests", () => {
            it('should insert valid data with url, language and title', async () => {
                await client.query(
                    'INSERT INTO links (url,language, title) VALUES ($1::text, $2::text, $3::text)',
                    [
                        "https://test.com",
                        "en",
                        "test"
                    ]
                )
    
                let results = await client.query(
                    'SELECT url, language, title FROM links WHERE id = 1'
                )
    
                expect(results.rowCount).toBe(1)
    
                let rowResults = results.rows[0]
                
                expect(rowResults["url"]).toBe("https://test.com")
                expect(rowResults["language"]).toBe("en")
                expect(rowResults["title"]).toBe("test")
            })
    
            it('has a self incrementing primary key', async () => {
                await client.query(
                    `
                    INSERT INTO links (url, language, title ) VALUES ('https://test-1.com', 'en', 'title1');
                    INSERT INTO links (url, language, title ) VALUES ('https://test-2.com', 'en', 'title2');
                    `
                )
                let results = await client.query(
                    "SELECT * FROM links"
                )
    
                expect(results.rowCount).toBe(2)
    
                for (let row in results.rows){
                    expect(results.rows[row]["id"]).toBe(parseInt(row) + 1)
                }
            })
            
            it('should fail on not including language in insert', async () =>{
                let errorMessage:string = ""
                try {
                    await client.query(
                        'INSERT INTO links (url, title ) VALUES ($1::text, $2::text)',
                        [
                            "https://test.com",
                            "test"
                        ]
                    )
                    throw new Error(
                        "row successfully inserted when it was supposed to throw an error due to no language column"
                    )
                }
                catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: null value in column "language" violates not-null constraint/)
                
            }
            )
    
            it('should fail on not including url in insert', async () => {
                let errorMessage:string = ""
                try{
                    await client.query(
                        "INSERT INTO links(title, language ) VALUES ($1::text, $2::text)",
                        [
                            "test",
                            "en"
                        ]
                    )
                }
                catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: null value in column "url" violates not-null constraint/)
            })
    
            it('should fail on not including title in insert', async () => {
                let errorMessage:string = ""
                try{
                    await client.query(
                        "INSERT INTO links(url, language ) VALUES ($1::text, $2::text)",
                        [
                            "https://test.com",
                            "en"
                        ]
                    )
                }
                catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: null value in column "title" violates not-null constraint/)
            })
    
            it('should allow "en" and "fr" values for language column', async () => {
                await client.query(
                    `INSERT INTO links(url, title, language ) VALUES ( 'https://test-en.com', 'test-en', 'en' );
                     INSERT INTO links(url, title, language ) VALUES ( 'https://test-fr.com', 'test-fr', 'fr' );
                    `
                )
            })
    
            it ('should allow no other values for language column', async () => {
                let randValue = Math.random().toString(36).slice(7)
                let errorMessage:string = ""
                try {
                    await client.query(
                        " INSERT INTO links(url, title, language) VALUES ( 'https://test.com', 'test', $1::text ) ",
                        [
                            randValue
                        ]
                    )
                }catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: new row for relation "links" violates check constraint "language_english_or_french"/)
            })
    
            it('url field should be unique', async () => {
                let errorMessage:string = ""
                try {
                    await client.query(
                        `
                        INSERT INTO links (url, title, language ) VALUES ( 'https://same-url.com', 'same-url1', 'en');
                        INSERT INTO links (url, title, language ) VALUES ( 'https://same-url.com', 'same-url2', 'en');
                        `
                    )
                }catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: duplicate key value violates unique constraint "links_url_key"/)
            })
    
            it('title field should be unique', async () => {
                let errorMessage:string = ""
                try {
                    await client.query(
                        `
                        INSERT INTO links ( url, title, language ) VALUES ('https://test1.com', 'test', 'en');
                        INSERT INTO links ( url, title, language ) VALUES ('https://test2.com', 'test', 'en');
                        `
                    )
                }
                catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: duplicate key value violates unique constraint "links_title_key"/)
            })
    
            it('description field exists', async () => {
                await client.query(
                    "INSERT INTO links ( url, title, language, description ) VALUES ('https://test1.com', 'test', 'en', 'an entry for a test')"
                )
            })
        })
        

        describe("trigger tests", () => {
            it("creates a row in the logs table on insert", async () => {
                await client.query(
                    "INSERT INTO links (url, language, title ) VALUES ( 'https://test.com', 'en', 'test' )"
                )
                

                let results = await client.query(
                    "SELECT * FROM logs"
                )

                expect(results.rowCount).toBe(1)
                
                let action = await client.query(
                    'SELECT action_name FROM actions WHERE id = $1::integer ',
                    [
                        results.rows[0]["action_id"]
                    ]
                )

                expect(action.rowCount).toBe(1)
                expect(action.rows[0]["action_name"]).toBe("CREATE_LINK")
                expect(results.rows[0]["link"]).toBe("https://test.com")
            })

            it("creates a row in the logs table on update", async () => {
                await client.query(
                    "INSERT INTO links (url, language, title ) VALUES ('https://test.com', 'en', 'test')"
                )
                await client.query(
                    "UPDATE links SET url = 'https://test2.com' WHERE id = 1"
                )

                let results = await client.query(
                    "SELECT * FROM logs ORDER BY created_on ASC"
                )

                expect(results.rowCount).toBe(2)

                let action = await client.query(
                    'SELECT action_name FROM actions WHERE id = $1::integer',
                    [
                        results.rows[1]["action_id"]
                    ]
                )
                expect(action.rowCount).toBe(1)
                expect(action.rows[0]["action_name"]).toBe("UPDATE_LINK")
                expect(results.rows[0]["link"]).toBe("https://test.com")
                expect(results.rows[1]["link"]).toBe("https://test2.com")
            })
            it("creates a row in the logs table on delete", async () => {
                await client.query(
                    "INSERT INTO links (url, language, title ) VALUES ('https://test.com', 'en', 'test')"
                )
                await client.query(
                    "DELETE FROM links WHERE id = 1"
                )

                let results = await client.query(
                    "SELECT * FROM logs ORDER BY created_on ASC"
                )

                expect(results.rowCount).toBe(2)

                let action = await client.query(
                    'SELECT action_name FROM actions WHERE id = $1::integer',
                    [
                        results.rows[1]["action_id"]
                    ]
                )

                expect(action.rowCount).toBe(1)
                expect(action.rows[0]["action_name"]).toBe("DELETE_LINK")
                expect(results.rows[0]["link"]).toBe("https://test.com")
                expect(results.rows[1]["link"]).toBe("https://test.com")
            })

            it("processes english text from title and description row on insert", async () => {
                await client.query(
                    "INSERT INTO links (url, language, title, description) VALUES('https://test.com', 'en', 'test', 'this is a good site on testing' )"
                )

                let results = await client.query(
                    "SELECT * FROM links"
                )
                let manual_results = await client.query(
                    "SELECT * FROM to_tsvector('en', 'test this is a good site on testing')"
                )
                
                expect(results.rows[0]["ftx_data"]).toBe(manual_results.rows[0]["to_tsvector"])
            })

            it("processes english text from only title on row insert", async () => {
                await client.query(
                    "INSERT INTO links (url, language, title ) VALUES ('https://test.com', 'en', 'this is an awesome test')"
                )

                let results = await client.query(
                    "SELECT * FROM links"
                )
                let manual_results = await client.query(
                    "SELECT * FROM to_tsvector('en', 'this is an awesome test')"
                )

                expect(results.rows[0]["ftx_data"]).toBe(manual_results.rows[0]["to_tsvector"])
            })

            it("processes french text from title and description", async () => {
                await client.query(
                    "INSERT INTO links (url, language, title, description) VALUES ('https://examine.ca', 'fr', 'bon site de test', 'c''est un site de test génial')"
                )

                let results = await client.query(
                    "SELECT * FROM links"
                )
                let manual_results = await client.query(
                    "SELECT * FROM to_tsvector('fr', 'bon site de test c''est un site de test génial')"
                )

                expect(results.rows[0]["ftx_data"]).toBe(manual_results.rows[0]["to_tsvector"])
            })

            it("processes french text from only title on row insert", async () => {
                await client.query(
                    "INSERT INTO links (url, language, title ) VALUES ('https://examine.ca', 'fr', 'bon site de test')"
                )

                let results = await client.query(
                    "SELECT * FROM links"
                )
                let manual_results = await client.query(
                    "SELECT * FROM to_tsvector('fr', 'bon site de test')"
                )

                expect(results.rows[0]["ftx_data"]).toBe(manual_results.rows[0]["to_tsvector"])
            })

        })
        
    })
})