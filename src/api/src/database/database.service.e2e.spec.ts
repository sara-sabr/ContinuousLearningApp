import { mocked } from "ts-jest/utils"
import { Test } from "@nestjs/testing"
import DatabaseService from "./database.service"
import { DatabaseOperations } from "./db"
import ConfigurationService from "../configs/config.service"
import * as path from "path"
import { ClientConfig } from "pg"
import * as dotenv from "dotenv"

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
        beforeEach(async () => {
            if ( ! process.env.API_TEST_DATABASE_USER  || ! process.env.API_TEST_DATABASE_PASSWORD){
                throw new Error(
                    "username and password for test database must be provided in environment variable " +
                    "API_TEST_DATABASE_USER and API_TEST_DATABASE_PASSWORD respectively"
                )
            }
            db = databaseService.getDb()
            await db.destroyDatabaseSchema()

            try{
                await db.createDatabaseSchema(ddl)
            }
            catch(error){
                console.log("Failed to initiate test: Could not create schema")
                throw error
            }

        })

        it("dummy test", () => {true})

        afterEach(async () => {
            await db.destroyDatabaseSchema()
            await db.endPool()
        })

    })
    
})