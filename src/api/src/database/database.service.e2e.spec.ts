import { mocked } from "ts-jest/utils"
import { Test } from "@nestjs/testing"
import DatabaseService from "./database.service"
import { DatabaseOperations } from "./db"
import ConfigurationService from "../configs/config.service"
import * as path from "path"
import { ClientConfig } from "pg"
import * as dotenv from "dotenv"
import {Action, Log, Link, Category } from "../interfaces/data"
import { link } from "fs"
import { async } from "rxjs/internal/scheduler/async"

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

        describe ("link creation tests", () => {
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
                let errorMessage:string = ""
                try{
                    await databaseService.createLink(linkData)
                }catch(e){
                    errorMessage = e.message
                }

                expect(errorMessage.length).toBeGreaterThan(0)
            })

        })
        afterEach(async () => {
            await db.destroyDatabaseSchema()
            await db.endPool()
            spiedOnQuery.mockRestore()
        })

    })
    
})