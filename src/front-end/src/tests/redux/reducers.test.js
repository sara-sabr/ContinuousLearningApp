import * as reducers from "../../redux/reducers"
import * as action from "../../redux/actions"

import i18n from "../../translations"
import { shuffleArray } from "../utils"

describe("reducer tests", () => {
    describe("language", () => {
        it("default is i18n language", () => {
            let returnedValue = reducers.language(undefined, {})
            expect(returnedValue).toBe(
                i18n.language
            )
        })

        it("overides default with language of action", () => {
            let returnedValue = reducers.language(undefined, action.changeLanguageCreator("fr"))
            expect(returnedValue).toBe(
                "fr"
            )
        })
    })
    describe("links", () => {
        let sortedData 
        beforeEach(() => {
            sortedData = [
                {
                  "id": 1,
                  "language": "en",
                  "url": "https://test.com",
                  "title": "testing your applications",
                  "description": "A site to find how you can test your applications across many different frameworks",
                  "imageLink": null,
                  "createdOn": "2020-03-06T19:51:56.443Z",
                  "updatedOn": null
                },
                {
                  "id": 2,
                  "language": "fr",
                  "url": "https://test3.com",
                  "title": "test3",
                  "description": "This is a testing site",
                  "imageLink": "https://test3.com/png",
                  "createdOn": "2020-03-11T02:32:21.597Z",
                  "updatedOn": null
                },
                {
                  "id": 3,
                  "language": "fr",
                  "url": "https://test2.com",
                  "title": "test2",
                  "description": "This is a testing site",
                  "imageLink": "https://test2.com/png",
                  "createdOn": "2020-03-11T02:32:38.326Z",
                  "updatedOn": null
                },
                {
                  "id": 4,
                  "language": "fr",
                  "url": "https://test1.com",
                  "title": "test1",
                  "description": "This is a testing site",
                  "imageLink": "https://test1.com/png",
                  "createdOn": "2020-03-11T02:32:59.941Z",
                  "updatedOn": null
                },
                {
                  "id": 5,
                  "language": "en",
                  "url": "https://helloworld.com",
                  "title": "This is a title",
                  "description": "a description",
                  "imageLink": "https://helloworld.com/thisisapng.png",
                  "createdOn": "2020-03-11T20:21:01.648Z",
                  "updatedOn": null
                }
            ]
        })
        it("has default state", () => {
            let returnedValue = reducers.links(undefined, {})
            expect(returnedValue).toEqual(
                {
                    isFetching: false,
                    fetchFailed: false,
                    order: "asc",
                    orderBy: "createdOn",
                    data: {},
                    sortedData: []
                }
            )
        })
        it("it registers request action for LINKS resourceType", () => {
            let returnedValue = reducers.links(undefined, action.requestLinksCreator(
                {
                    limit: 2,
                    offset: 2
                }
            ))

            expect(returnedValue).toEqual(
                {
                    isFetching: true,
                    fetchFailed: false,
                    order: "asc",
                    orderBy: "createdOn",
                    previousQueryParams: {
                        order: "asc",
                        limit: 2,
                        offset: 2
                    },
                    data: {},
                    sortedData: [] 
                }
            )
        })

        it("returns default state when resource type is not LINKS", () => {
            let returnedValue = reducers.links(undefined, {
                type: action.TYPES.REQUEST,
                resourceType: "SOMETHING_ELSE"
            })

            expect(returnedValue).toEqual(
                {
                    isFetching: false,
                    fetchFailed: false,
                    order: "asc",
                    orderBy: "createdOn",
                    data: {},
                    sortedData: []
                }
            )
        })

        it("adds recieved data to data field and sortedData", () => {
            let dataMap = {}


            sortedData.map(
                (value) => {
                    dataMap[value.id] = value
                }
            )

            let returnedValue = reducers.links(undefined, action.recieveLinksCreator(
                sortedData
            ))

            expect(returnedValue.data).toEqual(dataMap)
            expect(returnedValue.sortedData).toEqual(sortedData)
        })

        it("adds recieved data to data field and sorts when order is different", () => {
            let state = {
                isFetching: false,
                fetchFailed: false,
                order: "asc",
                orderBy: "createdOn",
                previousQueryParams: {
                    order: "desc",
                    limit: undefined,
                    offset: undefined
                },
                data: {},
                sortedData: []
            }
            let descSortedData = Object.assign([], sortedData).reverse()

            let recievedResults = reducers.links(
                state, action.recieveLinksCreator(descSortedData)
            )

            expect(recievedResults.sortedData).toEqual(sortedData)
           
        })

        it("correctly adds recieved data to existing data", () => {
            let state = {
                isFetching: false,
                fetchFailed: false,
                order: "asc",
                orderBy: "createdOn",
                data: {
                    1: sortedData[0],
                    2: sortedData[1],
                    3: sortedData[2],
                },
                sortedData: sortedData.slice(0,3)
            }

            let returnedResult = reducers.links(
                state, action.recieveLinksCreator(
                    [sortedData[3], sortedData[4]]
                )
            )
            expect(returnedResult.data).toEqual(
                {
                    1: sortedData[0],
                    2: sortedData[1],
                    3: sortedData[2],
                    4: sortedData[3],
                    5: sortedData[4]
                }
            )

            expect(returnedResult.sortedData).toEqual(
                sortedData
            )
        })

        it("it handles request failure action", () => {
            let returnedResult = reducers.links(
                undefined, action.recieveLinksFailedCreator(
                    action.REQUEST_FAILURE_TYPES.BAD_REQUEST,
                    "something bad happened"
                )
            )

            expect(
                returnedResult
            ).toEqual(
                {
                    isFetching: false,
                    fetchFailed: true,
                    order: "asc",
                    orderBy: "createdOn",
                    failureReason: action.REQUEST_FAILURE_TYPES.BAD_REQUEST,
                    failureMessage: "something bad happened",
                    data: {},
                    sortedData: []
                }
            )
        })

        it("handles CHANGE_ORDER action with change in order", () => {
            let state = {
                isFetching: false,
                fetchFailed: false,
                order: "asc",
                orderBy: "createdOn",
                data: {
                    1: sortedData[0],
                    2: sortedData[1],
                    3: sortedData[2],
                    4: sortedData[3],
                    5: sortedData[4]
                },
                sortedData: sortedData
            }

            let returnedResult = reducers.links(
                state,
                action.changeLinksOrderCreator(
                    undefined, action.ORDER.DESC
                )
            )

            let expectedArray = Object.assign([], sortedData).reverse()
            expect(returnedResult.sortedData).toEqual(
                expectedArray
            )
        })
        it("handles CHANGE_ORDER action with order and orderBy", () => {
            let state = {
                isFetching: false,
                fetchFailed: false,
                order: "asc",
                orderBy: "createdOn",
                data: {
                    1: sortedData[0],
                    2: sortedData[1],
                    3: sortedData[2],
                    4: sortedData[3],
                    5: sortedData[4]
                },
                sortedData: sortedData
            }

            let expectedArray = [
                sortedData[0], sortedData[4],
                sortedData[1], sortedData[2],
                sortedData[3]
            ]

            let recievedResults = reducers.links(
                state,
                action.changeLinksOrderCreator(
                    "language",
                    action.ORDER.ASC
                )
            )

            expect(recievedResults.sortedData).toEqual(
                expectedArray
            )
        })

        it("returns state if order and orderedBy does not change", () => {
            let state = {
                isFetching: false,
                fetchFailed: false,
                order: "asc",
                orderBy: "createdOn",
                data: {
                    1: sortedData[0],
                    2: sortedData[1],
                    3: sortedData[2],
                    4: sortedData[3],
                    5: sortedData[4]
                },
                sortedData: sortedData
            }

            let recievedResults = reducers.links(
                state,
                action.changeLinksOrderCreator(
                    "createdOn",
                    action.ORDER.ASC
                )
            )

            expect(recievedResults.sortedData).toEqual(
                sortedData
            )
            expect(recievedResults.order).toEqual("asc")
            expect(recievedResults.orderBy).toEqual("createdOn")

            recievedResults = reducers.links(
                state,
                action.changeLinksOrderCreator(
                    undefined,
                    action.ORDER.ASC
                )
            )

            expect(recievedResults.sortedData).toEqual(
                sortedData
            )
            expect(recievedResults.order).toEqual("asc")
            expect(recievedResults.orderBy).toEqual("createdOn")
        })
    })

    describe("submit", () => {
        let rawLinkMetadata
        beforeEach(() => {
            rawLinkMetadata = {
                status:"success",
                data:{
                    title:"Google", 
                    description:"Search the world’s information, including webpages, images, videos and more. Google has many special features to help you find exactly what you’re looking for.",
                    lang:"en",
                    author:null,
                    publisher:"google.ca",
                    image:{
                        url:"https://www.google.ca/images/branding/googleg/1x/googleg_standard_color_128dp.png",
                        type:"png",
                        size:3428,
                        height:128,
                        width:128,
                        size_pretty:"3.43 kB"
                    },
                    url:"https://www.google.ca",
                    date:"2020-03-18T00:54:30.000Z",
                    logo:{
                        url:"https://www.google.ca/favicon.ico",
                        type:"ico",
                        size:1494,
                        height:16,
                        width:16,
                        size_pretty:"1.49 kB"
                    }
                }
            }
        })

        it("default state", () => {
            let expectedState = reducers.submit(
                undefined, {}
            )
            expect(expectedState).toEqual(
                {
                    isSubmitting: false,
                    submitFailed: false,
                    validLink: false,
                    isFetchingMetadata: false,
                    fetchMetadataFailed: false,
                    linkData: {
                        title: "",
                        description: "",
                        imageLink: "",
                        language: ""
                    },
                    link: ""
                }
            )
        })

        it("handles REQUEST for LINK_METADATA action", () => {
            let expectedState = reducers.submit(
                {
                    isSubmitting: false,
                    submitFailed: false,
                    validLink: false,
                    isFetchingMetadata: false,
                    fetchMetadataFailed: true,
                    linkData: {
                        title: "",
                        description: "",
                        imageLink: "",
                        language: ""
                    },
                    link: ""
                }, action.requestLinkMetadataCreator()
            )

            expect(expectedState.isFetchingMetadata).toBe(true)
            expect(expectedState.fetchMetadataFailed).toBe(false)
        })

        it("returns default state for REQUEST for all other types", () => {
            let expectedState = reducers.submit(
                {
                    isSubmitting: false,
                    submitFailed: false,
                    validLink: false,
                    isFetchingMetadata: false,
                    fetchMetadataFailed: true,
                    linkData: {
                        title: "",
                        description: "",
                        imageLink: "",
                        language: ""
                    },
                    link: ""
                }, {
                    type: action.TYPES.REQUEST,
                    resourceType: "SOME_OTHER_RESOURCE_TYPE"
                }
            )
            expect(expectedState.isFetchingMetadata).toBe(false)
            expect(expectedState.fetchMetadataFailed).toBe(true)
        })

        it("handles REQUEST_FAILED for LINK_METADATA action", () => {
            let expectedState = reducers.submit(
                {
                    isSubmitting: false,
                    submitFailed: false,
                    validLink: false,
                    isFetchingMetadata: true,
                    fetchMetadataFailed: false,
                    linkData: {
                        title: "",
                        description: "",
                        imageLink: "",
                        language: ""
                    },
                    link: ""
                } , action.requestLinkMetadataFailedCreator(
                    "someReason", "someMessage"
                )
            )

            expect(expectedState.fetchMetadataFailed).toBe(true)
            expect(expectedState.isFetchingMetadata).toBe(false)
            expect(expectedState.fetchMetadataFailureReason).toBe(
                "someReason"
            )
            expect(expectedState.fetchMetatdataFailureMessage).toBe(
                "someMessage"
            )
        })

        it("returns default state for REQUEST_FAILED for all other types", () => {
            let expectedState = reducers.submit(
                {
                    isSubmitting: false,
                    submitFailed: false,
                    validLink: false,
                    isFetchingMetadata: true,
                    fetchMetadataFailed: false,
                    linkData: {
                        title: "",
                        description: "",
                        imageLink: "",
                        language: ""
                    },
                    link: ""
                } , {
                    type: action.TYPES.REQUEST_FAILED,
                    resourceType: "SOME_OTHER_TYPE"
                }
            )

            expect(expectedState.isFetchingMetadata).toBe(true)
            expect(expectedState.fetchMetadataFailed).toBe(false)
        })

    })

})