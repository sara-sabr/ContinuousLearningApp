import * as actions from "../../redux/actions";
import { initReactI18next } from "react-i18next";



describe("actions", () => {
    it("changeLanguageCreator", () => {
        let expectedAction = {
            type: actions.TYPES.CHANGE_LANGUAGE,
            language: "en"
        }

        let resultedAction = actions.changeLanguageCreator("en")
        expect(resultedAction).toMatchObject(
            expectedAction
        )

        expectedAction["language"] = "fr"

        resultedAction = actions.changeLanguageCreator("fr")
        expect(
            resultedAction
        ).toMatchObject(
            expectedAction
        )
    })
    describe("requestLinksCreator", () => {
        it("creates an action with order asc", () => {
            let expectedAction = actions.requestLinksCreator()

            expect(expectedAction).toMatchObject(
                {
                    type: actions.TYPES.REQUEST,
                    resourceType: actions.RESOURCE_TYPES.LINKS,
                    order: "asc"
                }
            )
        })

        it("accepts offset argument", () => {
            let expectedAction = actions.requestLinksCreator({
                offset: 2
            })
            expect(expectedAction).toMatchObject(
                {
                    type: actions.TYPES.REQUEST,
                    resourceType: actions.RESOURCE_TYPES.LINKS,
                    offset: 2,
                    order: "asc"
                }
            )
        })

        it("accepts limit argument", () =>{
            let expectedAction = actions.requestLinksCreator({
                limit: 2
            })

            expect(expectedAction).toMatchObject(
                {
                    type: actions.TYPES.REQUEST,
                    resourceType: actions.RESOURCE_TYPES.LINKS,
                    limit: 2,
                    order: "asc"
                }
            )
        })

        it("accepts limit and offset arguments", () => {
            let expectedAction = actions.requestLinksCreator(
                {
                    limit: 2,
                    offset: 2
                }
            )

            expect(expectedAction).toMatchObject(
                {
                    type: actions.TYPES.REQUEST,
                    resourceType: actions.RESOURCE_TYPES.LINKS,
                    limit: 2,
                    offset: 2,
                    order: "asc"
                }
            )
        })
    })

    it("recieveLinksCreator", () => {
        let expectedAction = actions.recieveLinksCreator(
            [{id: 1, url: "https://test.com"}]
        )
        expect(expectedAction).toMatchObject(
            {
                type: actions.TYPES.RECIEVE,
                resourceType: actions.RESOURCE_TYPES.LINKS,
                data: [{id: 1, url: "https://test.com"}]
            } 
        )
    })

    it("recieveLinksFailedCreator", () => {
        let expectedAction = actions.recieveLinksFailedCreator(
            "some reason"
        )
        expect(expectedAction).toMatchObject(
            {
                type: actions.TYPES.REQUEST_FAILED,
                resourceType: actions.RESOURCE_TYPES.LINKS,
                failureReason: "some reason"
            }
        )
    })
})