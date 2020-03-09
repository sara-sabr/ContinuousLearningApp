import { Test } from "@nestjs/testing"
import { LinksController } from  "./links.controller"
import { LinksService } from "./links.service"
import DatabaseService from "../../database/database.service"
import ConfigurationService from "../../configs/config.service"
import { mocked } from "ts-jest/utils"
import { ReturnedLinkDTO } from "./dto/returned-link.dto"
import { DatabaseError, NoDataFound } from "../../utils/errors"
import { HttpException, HttpStatus } from "@nestjs/common"

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

            it("throws HttpException on DatabaseError getLinkById", async () => {
                mockedReadLinkByID.mockImplementationOnce((...args) => {
                    throw new DatabaseError(
                        "an exception occured from the database"
                    )
                })

                try{
                    await linksController.getLinkById(1)
                    throw new Error("an error was not thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.message).toBe(
                        "A database error has occured: an exception occured from the database"
                    )
                    expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
                }
            })

            it("throws HttpException on Error getLinkById", async () => {
                mockedReadLinkByID.mockImplementationOnce((...args) => {
                    throw new Error(
                        "an exception occured in general"
                    )
                })

                try{
                    await linksController.getLinkById(1)
                    throw new Error("an error was not thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.message).toBe(
                        "An unknown error has occured"
                    )
                    expect(e.status).toBe(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                }
            })

            it("throws HttpException on NoDataFound getLinkById", async () => {
                mockedReadLinkByID.mockImplementationOnce(
                    (...args) => { throw new NoDataFound("data could not find link for id 1")}
                )

                try{
                    await linksController.getLinkById(1)
                    throw new Error("an error was not thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.message).toBe(
                        "Resource not found: data could not find link for id 1"
                    )
                    expect(e.status).toBe(
                        HttpStatus.NOT_FOUND
                    )
                }
            })
            afterEach(() => {
                mockedReadLinkByID.mockRestore()
            })
        })

        describe("getLinks", () => {
            let mockedReadLinks: jest.SpyInstance
            beforeEach(() => {
                mockedReadLinks = jest.spyOn(databaseService, "readLinks")
            })

            it("getLinks", async () => {
                let results = await databaseService.readLinks()
                mockedReadLinks.mockImplementationOnce(
                    (...args) => {
                        return results
                    }
                )

                let controllerResults = await linksController.getLinks()
                expect(mockedReadLinks.mock.calls.length).toBe(2)

                for (let row in controllerResults){
                    expect(controllerResults[row].id).toBe(results[row].id)
                    expect(controllerResults[row].url).toBe(results[row].url)
                    expect(controllerResults[row].title).toBe(results[row].title)
                    expect(controllerResults[row].language).toBe(results[row].language)
                    expect(controllerResults[row].createdOn.toISOString()).toBe(
                        results[row].createdOn.toISOString()
                    )
                }
            })

            it("throws HttpException on DatabaseError", async () => {
                mockedReadLinks.mockImplementationOnce((...args) => {
                    throw new DatabaseError("a database error thrown")
                })

                try{
                    await linksController.getLinks()
                    throw new Error("an error was not thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
                    expect(e.message).toBe(
                        "A database error has occured: a database error thrown"
                    )
                }

            })

            it("getLinks with order argument", async () => {

                let controllerResults = await linksController.getLinks(
                    "desc"
                )

                expect(mockedReadLinks.mock.calls.length).toBe(1)
                expect(mockedReadLinks.mock.calls[0][0]).toMatchObject(
                    {
                        order: "desc"
                    }
                )

                expect(controllerResults.length).toBe(20)

            }) 

            it("bad order argument throws HttpException getLinks", async () => {
                try{
                    await linksController.getLinks(
                        "somebadorder"
                    )
                    throw new Error("An error was not thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.BAD_REQUEST)
                    expect(e.message).toBe(
                        "Bad request: order must have value of either asc or desc"
                    )
                }
            })


            afterEach(() => {
                mockedReadLinks.mockRestore()
            })
        })
        
    })


})