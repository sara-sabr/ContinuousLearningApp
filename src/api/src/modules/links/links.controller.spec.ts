import { Test } from "@nestjs/testing"
import { LinksController } from  "./links.controller"
import { LinksService } from "./links.service"
import DatabaseService from "../../database/database.service"
import ConfigurationService from "../../configs/config.service"
import { mocked } from "ts-jest/utils"
import { ReturnedLinkDTO } from "./dto/returned-link.dto"

jest.mock("../../database/database.service")
jest.mock("../../configs/config.service")

const mockedDatabaseService = mocked(DatabaseService, true)
const mockedConfigurationService = mocked(ConfigurationService, true)

describe( "LinksController", () => {
    let linksController: LinksController;
    let linksService: LinksService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [LinksController],
            providers: [LinksService, DatabaseService, ConfigurationService]
        }).compile()

        linksController = moduleRef.get<LinksController>(LinksController)
        linksService = moduleRef.get<LinksService>(LinksService)
    })

    it("linksService gets injected with DatabaseService", () => {
        expect(linksService.getDatabaseService()).toBeInstanceOf(DatabaseService)
    })

    describe("controller methods", () => {
        let databaseService: DatabaseService
        beforeEach(() => {
            databaseService = linksService.getDatabaseService()

        })

        describe("getLinkById", () => {
            let mockedReadLinkByID: jest.SpyInstance
            beforeEach(() => {
                mockedReadLinkByID = jest.spyOn(databaseService, "readLinkById")
            })
            it("getLinkById", async () => {
                let results =  await linksController.getLinkById(1)
    
                expect(mockedReadLinkByID.mock.calls.length).toBe(1)
                expect(mockedReadLinkByID.mock.calls[0][0]).toBe(1)
    
                let dbRow = await databaseService.readLinkById(1)
    
                expect(results.id).toBe(dbRow.id)
                expect(results.url).toBe(dbRow.url)
                expect(results.title).toBe(dbRow.title)
                expect(results.language).toBe(dbRow.language)
                expect(results.imageLink).toBe(dbRow.imageLink)
                expect(results.createdOn).toBeInstanceOf(Date)
                expect(results.updatedOn).toBeInstanceOf(Date)
            
            })
            afterEach(() => {
                mockedReadLinkByID.mockRestore()
            })
        })
        
    })


})