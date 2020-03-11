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
            it("validate serialization", async () => {
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

            it("throws HttpException on DatabaseError", async () => {
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

            it("throws HttpException on Error", async () => {
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

            it("throws HttpException on NoDataFound", async () => {
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

            it("throws HttpException for invalid id argument", async () => {
                try {
                    await linksController.getLinkById("unparsable string")
                    throw new Error("an error was not thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.BAD_REQUEST)
                    expect(e.message).toBe(
                        "Bad request: id must be a number 1 or greater"
                    ) 
                }
                try{
                    await linksController.getLinkById("0")
                    throw new Error("an error was not thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.BAD_REQUEST)
                    expect(e.message).toBe(
                        "Bad request: id must be a number 1 or greater"
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

            it("validate serialization", async () => {
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

            it("throws HttpException on Error", async () => {
                mockedReadLinks.mockImplementationOnce((...args) => {
                    throw new Error("an error has occured")
                })

                try{
                    await linksController.getLinks()
                    throw new Error("an error was not thrown")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.message).toBe("An unknown error has occured")
                    expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
                }
            })

            it("getLinks with order argument", async () => {

                await linksController.getLinks(
                    "desc"
                )

                expect(mockedReadLinks.mock.calls.length).toBe(1)
                expect(mockedReadLinks.mock.calls[0][0]).toMatchObject(
                    {
                        order: "desc"
                    }
                )
            }) 

            it("bad order argument throws HttpException", async () => {
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

            it("getLinks with offset argument", async () => {
                await linksController.getLinks(
                    undefined , 2
                )

                // make sure that the readLinks in dbserv is called with offset arg
                expect(mockedReadLinks.mock.calls.length).toBe(1)
                expect(mockedReadLinks.mock.calls[0][0]).toMatchObject(
                    {
                        offset: 2
                    }
                )

            })

            it("throws HttpException for invalid offset argument", async () => {
                try{
                    await linksController.getLinks(
                        undefined, "should not be able to parse"
                    )
                    throw new Error("did not throw error")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.BAD_REQUEST)
                    expect(e.message).toBe(
                        "Bad request: offset should be a number 0 or greater"
                    )
                }

                try{
                    await linksController.getLinks(
                        undefined, "-1"
                    )
                    throw new Error("did not throw error")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.BAD_REQUEST)
                    expect(e.message).toBe(
                        "Bad request: offset should be a number 0 or greater"
                    )
                }
                
            })

            it("getLinks with limit argument", async() => {
                await linksController.getLinks(
                    undefined , undefined, 2
                )

                expect(mockedReadLinks.mock.calls.length).toBe(1)
                expect(mockedReadLinks.mock.calls[0][0]).toMatchObject(
                    {
                        limit: 2
                    }
                )
            })

            it("throws HttpException for invalid limit argument", async () => {
                try{
                    await linksController.getLinks(
                        undefined, undefined, "unparsable string"
                    )
                    throw new Error("did not throw an error")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.BAD_REQUEST)
                    expect(e.message).toBe("Bad request: limit should be a number 0 or greater")
                }

                try{
                    await linksController.getLinks(
                        undefined, undefined, "-1"
                    )
                    throw new Error("did not throw an error")
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.BAD_REQUEST)
                    expect(e.message).toBe("Bad request: limit should be a number 0 or greater")
                }
            })

            afterEach(() => {
                mockedReadLinks.mockRestore()
            })
        })

        describe("createLink", () => {
            let mockedCreateLink: jest.SpyInstance
            beforeEach(() => {
                mockedCreateLink = jest.spyOn(
                    databaseService, "createLink"
                )
            })

            it("returns number on valid data", async () => {
               let result = await linksController.createLink(
                   {
                       url: "hello.com",
                       language: "en",
                       title: "this is a site",
                       description: "this is a description",
                       imageLink: "hello.com/linkToImage.png"
                   }
               )
               expect(mockedCreateLink.mock.calls.length).toBe(1)
               expect(mockedCreateLink.mock.calls[0][0]).toMatchObject(
                   {
                       url: "hello.com",
                       language: "en",
                       title: "this is a site",
                       description: "this is a description",
                       imageLink: "hello.com/linkToImage.png"
                   }
               )

               expect(result.id).toEqual(expect.any(Number))

            })

            it("throws HttpException for DatabaseError", async () => {
                mockedCreateLink.mockImplementationOnce((...args) => {
                    throw new DatabaseError("a db error has occured")
                })

                try{
                    await linksController.createLink(
                        {
                            url: "hello.com",
                            language: "en",
                            title: "this is a site",
                            description: "this is a description",
                            imageLink: "hello.com/linkToImage.png"
                        }
                    )
                    throw new Error(
                        "did not throw error"
                    )
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
                    expect(e.message).toBe(
                        "A database error has occured: a db error has occured" 
                    )
                }
            })

            it("throws HttpException for Error", async () => {
                mockedCreateLink.mockImplementationOnce(
                    (...args) => {
                        throw new Error("an error has occured")
                    }
                )

                try{
                    await linksController.createLink(
                        {
                            url: "hello.com",
                            language: "en",
                            title: "this is a site",
                            description: "this is a description",
                            imageLink: "hello.com/linkToImage.png"
                        }
                    )
                    throw new Error(
                        "did not throw error"
                    )
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
                    expect(e.message).toBe(
                        "An unknown error has occured" 
                    )
                }  
            })

            it("throws HttpException for non unique url DatabaseError", async () => {
                mockedCreateLink.mockImplementationOnce(
                    (...args) => {
                        throw new DatabaseError('duplicate key value violates unique constraint "links_url_key"')
                    }
                )
                try{
                    await linksController.createLink(
                        {
                            url: "hello.com",
                            language: "en",
                            title: "this is a site",
                            description: "this is a description",
                            imageLink: "hello.com/linkToImage.png"
                        }
                    )
                    throw new Error(
                        "did not throw error"
                    )
                    
                }catch(e){
                    expect(e).toBeInstanceOf(HttpException)
                    expect(e.status).toBe(400)
                    expect(e.message).toBe(
                        "Bad request: url 'hello.com' already exists"
                    )

                }
            })
            
            afterEach(() => {
                mockedCreateLink.mockRestore()
            })
        })
        
    })


})