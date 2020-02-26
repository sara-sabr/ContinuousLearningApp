import { DatabaseOperations } from "./db";
import { ClientConfig, Client } from "pg"
import * as path from "path"
import { async } from "rxjs/internal/scheduler/async";

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

            expect(results.rows.length).toBe(1)

            let rowResults = results.rows[0]
            
            expect(rowResults["url"]).toBe("https://test.com")
            expect(rowResults["language"]).toBe("en")
            expect(rowResults["title"]).toBe("test")
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
        
    })
})