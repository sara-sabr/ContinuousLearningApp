import { DatabaseOperations } from "./db";
import { ClientConfig, Client, PoolClient } from "pg"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config()


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
    let client: Client | PoolClient
    
    beforeEach(async () => {
        await db_ops.destroyDatabaseSchema()
        
        try{
            await db_ops.createDatabaseSchema(ddl)
            client = await db_ops.getClient()
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
    describe("actions table tests", () => {
        it ("has default actions on db creation", async () =>{
            let results = await client.query(
                "SELECT * FROM actions"
            )

            expect(results.rowCount).toBe(8)
            let actions_array = results.rows.map((row, index) => {
                return row["action_name"]
            })

            let actions = [
                "CREATE_LINK",
                "UPDATE_LINK",
                "DELETE_LINK",
                "READ_LINK",
                "CREATE_CATEGORY",
                "UPDATE_CATEGORY",
                "DELETE_CATEGORY",
                "READ_CATEGORY"
            ]

            for (let i in actions ) {
                expect(actions_array.indexOf(actions[i])).toBeGreaterThan(-1)
            }
        })
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
            it('image_link field exists', async () => {
                await client.query(
                    "INSERT INTO links ( url, title, language, image_link ) VALUES ('https://test1.com', 'test', 'en', 'an image link' ) "
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

    describe("categories table tests" , () => {
        describe("fields table tests", () => {
            it ("should insert valid data with title and language", async () => {
                await client.query(
                    "INSERT INTO categories ( title, language ) VALUES ( 'test category', 'en' )"
                )

                let results =  await client.query(
                    "SELECT * FROM categories"
                )

                expect(results.rowCount).toBe(1)
                expect(results.rows[0]["title"]).toBe("test category")
                expect(results.rows[0]["language"]).toBe("en")
            })

            it("has a self incrementing primary key", async () => {
                await client.query(
                    `
                    INSERT INTO categories (title, language) VALUES ('test1', 'en');
                    INSERT INTO categories (title, language) VALUES ('test2', 'en');
                    INSERT INTO categories (title, language) VALUES ('test3', 'en');
                    `
                )

                let results = await client.query(
                    "SELECT * FROM categories "
                )

                expect(results.rowCount).toBe(3)

                for (let i in results.rows){
                    expect(results.rows[i]["id"]).toBe(parseInt(i) + 1)
                }
            })
            it("should fail on not including language in insert", async () => {
                let errorMessage:string = ""
                try {
                    await client.query(
                        `INSERT INTO categories (title) VALUES ('test')`
                    )
                }
                catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: null value in column "language" violates not-null constraint/)
            })
            it("should fail on not including title in insert", async () => {
                let errorMessage:string = ""
                try {
                    await client.query(
                        `INSERT INTO categories (language) VALUES ('en')`
                    )
                }
                catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: null value in column "title" violates not-null constraint/)
                
            })
            it('should allow "en" and "fr" values for language column', async () => {
                await client.query(
                    `INSERT INTO categories (title, language ) VALUES ( 'test-en', 'en' );
                     INSERT INTO categories (title, language ) VALUES ( 'test-fr', 'fr' );
                    `
                )
            })
    
            it ('should allow no other values for language column', async () => {
                let randValue = Math.random().toString(36).slice(7)
                let errorMessage:string = ""
                try {
                    await client.query(
                        " INSERT INTO categories (title, language) VALUES ('test', $1::text ) ",
                        [
                            randValue
                        ]
                    )
                }catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: new row for relation "categories" violates check constraint "language_english_or_french"/)
            })

            it ("title field should be unique", async () => {
                let errorMessage:string = ""
                try {
                    await client.query(
                        `
                        INSERT INTO categories ( title, language ) VALUES ('test', 'en');
                        INSERT INTO categories ( title, language ) VALUES ('test', 'en');
                        `
                    )
                }
                catch(e){
                    errorMessage = e.stack
                }
                expect(errorMessage).toMatch(/error: duplicate key value violates unique constraint "categories_title_key"/)
            })
            it ("description field exists", async () => {
                await client.query(
                    "INSERT INTO categories ( title, language, description ) VALUES ('test', 'en', 'an entry for a test')"
                )
            })

            it("image_link fiels exists", async () => {
                await client.query(
                    "INSERT INTO categories ( title, language, image_link ) VALUES ('test', 'en', 'link_to_image') "
                )
            })
        })
        describe("trigger tests", () => {
            it("creates a row in the logs table on insert", async () => {
                await client.query(
                    "INSERT INTO categories (language, title ) VALUES ( 'en', 'test' )"
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
                expect(action.rows[0]["action_name"]).toBe("CREATE_CATEGORY")
                expect(results.rows[0]["category"]).toBe("test")
            })

            it("creates a row in the logs table on update", async () => {
                await client.query(
                    "INSERT INTO categories (language, title ) VALUES ('en', 'test')"
                )
                await client.query(
                    "UPDATE categories SET title = 'test_updated' WHERE id = 1"
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
                expect(action.rows[0]["action_name"]).toBe("UPDATE_CATEGORY")
                expect(results.rows[0]["category"]).toBe("test")
                expect(results.rows[1]["category"]).toBe("test_updated")
            })
            it("creates a row in the logs table on delete", async () => {
                await client.query(
                    "INSERT INTO categories (language, title ) VALUES ('en', 'test')"
                )
                await client.query(
                    "DELETE FROM categories WHERE id = 1"
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
                expect(action.rows[0]["action_name"]).toBe("DELETE_CATEGORY")
                expect(results.rows[0]["category"]).toBe("test")
                expect(results.rows[1]["category"]).toBe("test")
            })

            it("processes english text from title and description row on insert", async () => {
                await client.query(
                    "INSERT INTO categories (language, title, description) VALUES('en', 'test', 'this is a good site on testing' )"
                )

                let results = await client.query(
                    "SELECT * FROM categories"
                )
                let manual_results = await client.query(
                    "SELECT * FROM to_tsvector('en', 'test this is a good site on testing')"
                )
                
                expect(results.rows[0]["ftx_data"]).toBe(manual_results.rows[0]["to_tsvector"])
            })

            it("processes english text from only title on row insert", async () => {
                await client.query(
                    "INSERT INTO categories (language, title ) VALUES ('en', 'this is an awesome test')"
                )

                let results = await client.query(
                    "SELECT * FROM categories"
                )
                let manual_results = await client.query(
                    "SELECT * FROM to_tsvector('en', 'this is an awesome test')"
                )

                expect(results.rows[0]["ftx_data"]).toBe(manual_results.rows[0]["to_tsvector"])
            })

            it("processes french text from title and description", async () => {
                await client.query(
                    "INSERT INTO categories (language, title, description) VALUES ('fr', 'bon site de test', 'c''est un site de test génial')"
                )

                let results = await client.query(
                    "SELECT * FROM categories"
                )
                let manual_results = await client.query(
                    "SELECT * FROM to_tsvector('fr', 'bon site de test c''est un site de test génial')"
                )

                expect(results.rows[0]["ftx_data"]).toBe(manual_results.rows[0]["to_tsvector"])
            })

            it("processes french text from only title on row insert", async () => {
                await client.query(
                    "INSERT INTO categories ( language, title ) VALUES ('fr', 'bon site de test')"
                )

                let results = await client.query(
                    "SELECT * FROM categories"
                )
                let manual_results = await client.query(
                    "SELECT * FROM to_tsvector('fr', 'bon site de test')"
                )

                expect(results.rows[0]["ftx_data"]).toBe(manual_results.rows[0]["to_tsvector"])
            })
        })
    })

    describe("many to many relationship between links and categories", () => {
        it("create a relationship through links_categories_mapper", async () => {
            await client.query(
                `INSERT INTO links ( url, title, language ) VALUES ( 'https://testlink.com', 'test link' ,'en' );
                 INSERT INTO categories ( title, language ) VALUES ( 'test category', 'en' );
                 INSERT INTO links_categories_mapper ( link_id, category_id ) VALUES ( 1, 1 );
                `
            )
        })

        it("deletes a relationship when link is deleted", async () => {
            await client.query(
                `INSERT INTO links ( url, title, language ) VALUES ( 'https://testlink.com', 'test link' ,'en' );
                 INSERT INTO categories ( title, language ) VALUES ( 'test category', 'en' );
                 INSERT INTO links_categories_mapper ( link_id, category_id ) VALUES ( 1, 1 );
                `
            )

            let relationship_results = await client.query(
                "SELECT * FROM links_categories_mapper"
            )
            expect(relationship_results.rowCount).toBe(1)

            await client.query(
                "DELETE FROM links WHERE id = 1"
            )

            relationship_results = await client.query(
                "SELECT * FROM links_categories_mapper"
            )
            expect(relationship_results.rowCount).toBe(0)
        })
    })
})