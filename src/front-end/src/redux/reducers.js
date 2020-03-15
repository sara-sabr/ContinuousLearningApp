import { combineReducers } from "redux"
import {TYPES, LANGUAGES } from "./actions"
import i18n from "../translations" 


export const language = function(state = i18n.language, action){
    switch (action.type){
        case TYPES.CHANGE_LANGUAGE:
            return action.language
        default:
            return state
    }
}


const rootReducer = combineReducers(
    {
        language
    }
)


export default rootReducer
