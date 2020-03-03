import { mocked } from "ts-jest/utils"
import { Test } from "@nestjs/testing"
import DatabaseService from "./database.service"
import { DatabaseOperations } from "./db"
import ConfigurationService from "../configs/config.service"
import * as path from "path"
import { ClientConfig } from "pg"
import * as dotenv from "dotenv"
import {Action, Log, Link, Category } from "../interfaces/data"
import { DatabaseError, NoDataFound } from "../utils/errors"


dotenv.config()
jest.mock("../configs/config.service")

const mockedConfigurationService = mocked(ConfigurationService, true)

describe("database service tests", () => {
    let databaseService: DatabaseService
    let configurationService : ConfigurationService
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
             providers: [ConfigurationService, DatabaseService]
           }
        ).compile()

        databaseService = moduleRef.get<DatabaseService>(DatabaseService)
        configurationService = moduleRef.get<ConfigurationService>(ConfigurationService)
    })
    it("gets ConfigurationService injected", () => {
        expect(databaseService.getConfigService()).toBe(
            configurationService
        )
    })

    it("initializes DatabaseOperations class", () => {
        let db = databaseService.getDb()
        expect(db).toBeInstanceOf(
            DatabaseOperations
        )
        let expectedConfigs: ClientConfig = {
            user: process.env.API_TEST_DATABASE_USER,
            password: process.env.API_TEST_DATABASE_PASSWORD,
            port: parseInt(process.env.API_TEST_DATABASE_PORT) || 5432,
            host: process.env.API_TEST_DATABASE_HOST || "localhost",
            database: process.env.API_TEST_DATABASE_NAME || "continuous_learning_app_test_db"
        }
        expect(db.getConfigs()).toMatchObject(
            expectedConfigs
        )

        expect(db.usingPool()).toBe(true)
        
    })

    describe("data functions", () => {
        let db: DatabaseOperations
        const ddl_path = path.join(__dirname.replace(__filename, ""), "ddl")
        const ddl = DatabaseOperations.load_ddl(ddl_path)
        let spiedOnQuery: jest.SpyInstance
        beforeEach(async () => {
            if ( ! process.env.API_TEST_DATABASE_USER  || ! process.env.API_TEST_DATABASE_PASSWORD){
                throw new Error(
                    "username and password for test database must be provided in environment variable " +
                    "API_TEST_DATABASE_USER and API_TEST_DATABASE_PASSWORD respectively"
                )
            }
            db = databaseService.getDb()
            spiedOnQuery = jest.spyOn(db, "query")
            await db.destroyDatabaseSchema()

            try{
                await db.createDatabaseSchema(ddl)
            }
            catch(error){
                console.log("Failed to initiate test: Could not create schema")
                throw error
            }

        })

        describe ("link CRUD tests", () => {
            it("creates link from data with all fields", async() => {
                let linkData: Link = {
                    url: "http://test.com",
                    title: "This is a test link",
                    language: "en",
                    imageLink: "http://test.com/image",
                    description: "This is a test link with a description"
                }
    
                let id = await databaseService.createLink(linkData)
    
                expect(spiedOnQuery.mock.calls.length).toBe(1)
    
                let data = await db.query("SELECT * FROM links")
                
                expect(data.rowCount).toBe(1)
    
                let returnedLinkData = data.rows[0]
    
                expect(returnedLinkData["url"]).toBe(linkData.url)
                expect(returnedLinkData["title"]).toBe(linkData.title)
                expect(returnedLinkData["language"]).toBe(linkData.language)
                expect(returnedLinkData["description"]).toBe(linkData.description)
                expect(returnedLinkData["image_link"]).toBe(linkData.imageLink)
                expect(returnedLinkData["id"]).toBe(id)
            })
    
            it("creates link data with only core fields", async () => {
                let linkData: Link = {
                    url: "http://test.com",
                    title: "This is a test link",
                    language: "en"
                }
    
                let id = await databaseService.createLink(linkData)
    
                expect(spiedOnQuery.mock.calls.length).toBe(1)
    
                let data = await db.query("SELECT * FROM links")
                expect(data.rowCount).toBe(1)
    
                let returnedLinkData = data.rows[0]
    
                expect(returnedLinkData["url"]).toBe(linkData.url)
                expect(returnedLinkData["title"]).toBe(linkData.title)
                expect(returnedLinkData["language"]).toBe(linkData.language)
                expect(returnedLinkData["id"]).toBe(id)
                expect(returnedLinkData["image_link"]).toBe(null)
                expect(returnedLinkData["description"]).toBe(null)
            })

            it("throws error on bad insert", async () => {
                let linkData: Link = {
                    url: "https://test.com",
                    title: "This is a test link",
                    language: "some invalid language"
                }
                try{
                    await databaseService.createLink(linkData)
                    throw new Error("error should have been thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(DatabaseError)
                    expect(e.message.length).toBeGreaterThan(0)
                }
            })

            it("read link by id ", async () => {
                let result = await db.query(
                    `
                    INSERT INTO links ( url, title, language )  VALUES ( 'http://test1.com', 'test site 1', 'en' ) RETURNING created_on;
                    `
                )

                await db.query(
                    `
                    INSERT INTO links ( url, title, language )  VALUES ( 'http://test2.com', 'test site 2', 'en' );
                    `
                )


                let results = await databaseService.readLinkById(1)
        
                expect(results.id).toBe(1)
                expect(results.url).toBe("http://test1.com")
                expect(results.title).toBe("test site 1")
                expect(results.language).toBe("en")
                expect(results.createdOn.toISOString()).toBe(result.rows[0]["created_on"].toISOString())
                
            } )

            it("throws DatabaseError on read error in read link by id", async () => {
                spiedOnQuery.mockImplementationOnce( (...args ) => {
                    throw new Error("Some database error that occured")
                })

                try{
                    await databaseService.readLinkById(1)
                    throw new Error("error should have been thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(DatabaseError)
                    expect(e.message).toBe("Some database error that occured")
                }
            } )

            it("throws NoDataFound when there is no rows for read link by id", async () => {
                try{
                    await databaseService.readLinkById(1)
                }catch(e){
                    expect(e).toBeInstanceOf(NoDataFound)
                    expect(e.message).toBe("No links found for id 1")
                }
            })

            it("read links by url ", async () => {
                let result = await db.query(
                    `INSERT INTO LINKS (url, language, title) VALUES ('https://testing.com', 'en', 'this is a title') RETURNING id, created_on;
                    `
                )

                await db.query(
                    `INSERT INTO LINKS (url, language, title ) VALUES ('https://testing1.com', 'en', 'this is a title 2')`
                )

                let id = result.rows[0]["id"]
                let created_on: Date = result.rows[0]["created_on"]

                let serviceResults = await databaseService.readLinkByURL("https://testing.com")

                expect(serviceResults.id).toBe(id)
                expect(serviceResults.url).toBe("https://testing.com")
                expect(serviceResults.createdOn.toISOString()).toBe(created_on.toISOString())

            })

            it("throws DatabaseError on read error in read link by url", async () => {
                spiedOnQuery.mockImplementationOnce( (...args ) => {
                    throw new Error("Some database error that occured")
                })

                try {
                    await databaseService.readLinkByURL("https://someurl.com")
                    throw new Error("error should have been thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(DatabaseError)
                    expect(e.message.length).toBeGreaterThan(0)
                }
            })

            it("throws NoDataFound when there is no rows for read link by url", async () => {
                try {
                    await databaseService.readLinkByURL("https://thisurldoesnotexist.com")
                    throw new Error("error should have been thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(NoDataFound)
                    expect(e.message).toBe("No links found for url https://thisurldoesnotexist.com")
                }
            })

            it("read links ordered by created_on ascending by default", async () => {
                
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test1.com', 'en', 'test site 1');"
                    
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test2.com', 'en', 'test site 2');"
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test3.com', 'en', 'test site 3');"
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test4.com', 'en', 'test site 4');"
                )

                let dbRows = await db.query(
                    "SELECT * FROM links ORDER BY created_on ASC"
                )

                expect(dbRows.rowCount).toBe(4)

                let results = await databaseService.readLinks()

                for (let row in results){
                    expect(results[row].id).toBe(
                        dbRows.rows[row]["id"]
                    )
                    expect(results[row].url).toBe(
                        dbRows.rows[row]["url"]
                    )
                    expect(results[row].createdOn.toISOString()).toBe(
                        dbRows.rows[row]["created_on"].toISOString()
                    )
                }

            })

            it("read links orderd by created_on descending if specified", async () => {
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test1.com', 'en', 'test site 1');"
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test2.com', 'en', 'test site 2');"
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test3.com', 'en', 'test site 3');"
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test4.com', 'en', 'test site 4');"
                )


                let dbRows = await db.query(
                    "SELECT * FROM links ORDER BY created_on DESC"
                )

                expect(dbRows.rowCount).toBe(4)
                
                let results = await databaseService.readLinks({
                    order: "desc"
                })

                for (let row in results){
                    expect(results[row].id).toBe(
                        dbRows.rows[row]["id"]
                    )
                    expect(results[row].url).toBe(
                        dbRows.rows[row]["url"]
                    )
                    expect(results[row].createdOn.toISOString()).toBe(
                        dbRows.rows[row]["created_on"].toISOString()
                    )
                }

            })

            it("throws error for invalid order option in read links", async () => {
                try{
                    await databaseService.readLinks({
                        order: "bad order"
                    })
                    throw new Error("it didn't throw an error")
                }catch(e){
                    expect(e.message).toBe("order must have value of either asc or desc")
                }
            })

            it("allows limits and offsets in read links", async () => {
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test1.com', 'en', 'test site 1');"
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test2.com', 'en', 'test site 2');"
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test3.com', 'en', 'test site 3');"
                )
                await db.query(
                    "INSERT INTO links ( url, language, title ) VALUES ('https://test4.com', 'en', 'test site 4');"
                )

                let dbRows = await db.query(
                    "SELECT * FROM links ORDER BY created_on ASC LIMIT 2"
                )

                let results =  await databaseService.readLinks({
                    limit: 2
                })

                for (let row in results){
                    expect(results[row].id).toBe(
                       dbRows.rows[row]["id"]
                    )
                    expect(results[row].url).toBe(
                        dbRows.rows[row]["url"]
                    )
                    expect(results[row].createdOn.toISOString()).toBe(
                        dbRows.rows[row]["created_on"].toISOString()
                    )
                }
                
            })


        })
        afterEach(async () => {
            await db.destroyDatabaseSchema()
            await db.endPool()
            spiedOnQuery.mockRestore()
        })

    })
    
})