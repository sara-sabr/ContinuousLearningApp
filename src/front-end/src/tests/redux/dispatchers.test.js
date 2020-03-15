import * as dispatchers from "../../redux/dispatchers";
import * as action from "../../redux/actions";
import * as variables from "../../variables";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import fetchMock from "fetch-mock";
import { Response } from "cross-fetch/dist/node-ponyfill";

const middlewares = [thunk]


describe("dispatcher tests", () => {
    let spiedOnLocalStorageGet
    let spiedOnLocalStorageSet
    let mockedDispatchFunc
    let mockStore
    beforeEach(() =>{
        spiedOnLocalStorageSet = jest.spyOn(Storage.prototype, "setItem")
        spiedOnLocalStorageGet = jest.spyOn(Storage.prototype, "getItem")
        mockStore = configureMockStore(middlewares)
        mockedDispatchFunc = jest.fn()
    })
    describe("changeLanguage", () => {
        let consoleErrorMock
        beforeEach(() => {
            mockedDispatchFunc.mockImplementationOnce(
                (...args) => {}
            )
            consoleErrorMock = jest.spyOn(console, "error")
            consoleErrorMock.mockImplementation(
                (...args) =>{}
            )
        })
        it("dispatches valid language action", () => {
            
            spiedOnLocalStorageGet.mockImplementationOnce((...args) => {})
            spiedOnLocalStorageSet.mockImplementationOnce((...args) => {})

            dispatchers.changeLanguage("en", mockedDispatchFunc)
            
            expect(spiedOnLocalStorageGet.mock.calls.length).toBe(1)
            expect(spiedOnLocalStorageSet.mock.calls.length).toBe(1)

            expect(spiedOnLocalStorageGet.mock.calls[0][0]).toBe("language")
            expect(spiedOnLocalStorageSet.mock.calls[0]).toMatchObject(
                ["language", "en"]
            )
            expect(mockedDispatchFunc.mock.calls.length).toBe(1)
            expect(mockedDispatchFunc.mock.calls[0][0]).toMatchObject(
                action.changeLanguageCreator("en")
            )
        })

        it("does not dispatch if invalid language", () => {
            spiedOnLocalStorageGet.mockImplementationOnce((...args) => {})
            spiedOnLocalStorageSet.mockImplementationOnce((...args) => {})

            dispatchers.changeLanguage("invalid language", mockedDispatchFunc)

            expect(mockedDispatchFunc.mock.calls.length).toBe(0)
            expect(consoleErrorMock.mock.calls.length).toBe(1)
            expect(consoleErrorMock.mock.calls[0][0]).toBe(
                "ERROR: Invalid language 'invalid language'. Valid languages are 'en, fr'."
            )
        })

        it("does not dispatch if localStorage value is same as language", () => {
            spiedOnLocalStorageGet.mockImplementationOnce((...args) => {
                return "en"    
            })

            dispatchers.changeLanguage("en", mockedDispatchFunc)

            expect(mockedDispatchFunc.mock.calls.length).toBe(0)
        })

        it("does dispatch if locatStorage value is not the same language", () =>{
            spiedOnLocalStorageGet.mockImplementationOnce((...args) => {
                return "fr"
            })

            dispatchers.changeLanguage("en", mockedDispatchFunc)
            expect(mockedDispatchFunc.mock.calls.length).toBe(1)
            expect(mockedDispatchFunc.mock.calls[0][0]).toMatchObject(
                action.changeLanguageCreator("en")
            )
        })

        it("does not dispatch if localStorage value is not the same as language and language is invalid ", () =>{
            spiedOnLocalStorageGet.mockImplementationOnce((...args) => {
                return "en"
            })

            dispatchers.changeLanguage("invalid language", mockedDispatchFunc)
            expect(mockedDispatchFunc.mock.calls.length).toBe(0)
            expect(consoleErrorMock.mock.calls.length).toBe(1)
            expect(consoleErrorMock.mock.calls[0][0]).toBe(
                "ERROR: Invalid language 'invalid language'. Valid languages are 'en, fr'."
            )
        })

        afterEach(() => {
            consoleErrorMock.mockRestore()
        })
    })
    describe("fetchLinks", () =>{
        let store
        let apiURL = variables.apiURL
        let consoleErrorMock 
        beforeEach(() => {
            store = mockStore({
                links:{
                    isFetching: false,
                    fetchFailed: false,
                    data: []
                }
            })

            consoleErrorMock = jest.spyOn(console, "error")
            consoleErrorMock.mockImplementation(
                (...args) => {}
            )  
            variables.apiURL = "/api"
        })
        it("fetches links and creates action", () => {
            let data = [
                {
                    id: 1,
                    url: "https://someurl.com",
                    title: "this is a title",
                    createdOn: "2020-03-06T19:51:56.443Z"
                },
                {
                    id: 2,
                    url: "https://someurl2.com",
                    title: "this is a title 2",
                    createdOn: "2020-03-06T20:51:56.443Z"
                },
                {
                    id: 3,
                    url: "https://someurl3.com",
                    title: "this is a title 3",
                    createdOn: "2020-03-07T20:51:56.443Z"
                }
            ]
            fetchMock.getOnce("/api/links?order=asc", {
                body: data,
                headers: {
                    "content-type": "application/json"
                }
            })
            
            const expectedActions = [
                action.requestLinksCreator(),
                action.recieveLinksCreator(data)
            ]


            return store.dispatch(dispatchers.fetchLinks()).then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })

        })

        it("fetches links with limit and offset arguments", () => {
            let data = [
                {
                    id: 1,
                    url: "https://someurl.com",
                    title: "this is a title",
                    createdOn: "2020-03-06T19:51:56.443Z"
                },
                {
                    id: 2,
                    url: "https://someurl2.com",
                    title: "this is a title 2",
                    createdOn: "2020-03-06T20:51:56.443Z"
                },
                {
                    id: 3,
                    url: "https://someurl3.com",
                    title: "this is a title 3",
                    createdOn: "2020-03-07T20:51:56.443Z"
                }
            ]

            fetchMock.getOnce(
                "/api/links?order=asc&limit=2&offset=2",{
                    body: data,
                    headers: {"content-type": "application/json"}
                }
            )

            const expectedActions = [
                action.requestLinksCreator({
                    limit: 2,
                    offset: 2
                }),
                action.recieveLinksCreator(data)
            ]

            return store.dispatch(dispatchers.fetchLinks({
                limit: 2,
                offset: 2
            })).then(
                () => {
                    expect(store.getActions()).toEqual(
                        expectedActions
                    )
                }
            )
        })

        it("dispatches request failure action on INTERNAL ERROR", () => {
            fetchMock.getOnce(
                "/api/links?order=asc",
                {
                    body: {
                        status: 500,
                        message: "An internal error occured"
                    },
                    headers: {
                        "content-type": "application/json"
                    },
                    status: 500

                }
            )

            let expectedActions =[
                action.requestLinksCreator(),
                action.recieveLinksFailedCreator(
                    action.REQUEST_FAILURE_TYPES.SERVER_ERROR,
                    "An internal error occured"
                )
            ]

            return store.dispatch(
                dispatchers.fetchLinks()
            ).then(
                () => {
                    expect(consoleErrorMock.mock.calls.length).toBe(1)
                    expect(store.getActions()).toEqual(
                        expectedActions
                    )
                }
            )
        })

        afterEach(() => {
            variables.apiURL = apiURL
            consoleErrorMock.mockRestore()
        })
        
    }) 
    afterEach(() => {
      spiedOnLocalStorageSet.mockRestore()
      spiedOnLocalStorageGet.mockRestore()
      mockedDispatchFunc.mockRestore()
      fetchMock.restore()
    })
})