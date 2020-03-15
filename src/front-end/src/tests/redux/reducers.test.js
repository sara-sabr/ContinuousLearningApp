import * as reducers from "../../redux/reducers"
import * as action from "../../redux/actions"
import i18n from "../../translations"

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

})