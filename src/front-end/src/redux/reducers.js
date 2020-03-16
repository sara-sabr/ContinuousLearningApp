import { combineReducers, bindActionCreators } from "redux"
import {TYPES, RESOURCE_TYPES } from "./actions"
import i18n from "../translations" 
import { act } from "react-dom/test-utils"


export const language = function(state = i18n.language, action){
    switch (action.type){
        case TYPES.CHANGE_LANGUAGE:
            return action.language
        default:
            return state
    }
}

export const links = function(state = {
    isFetching: false,
    fetchFailed: false,
    data: {}
}, action){
    switch (action.type){
        case TYPES.REQUEST:
            switch (action.resourceType){
                case RESOURCE_TYPES.LINKS:
                    return {
                        ...state,
                        isFetching: true,
                        previousQueryParams: {
                            order: action.order,
                            limit: action.limit,
                            offset: action.offset
                        }
                    }
                default:
                    return state
            }
        case TYPES.RECIEVE:
            switch (action.resourceType){
                case RESOURCE_TYPES.LINKS:
                    let currentLinks = Object.assign({}, state.data)
                    let fetchedLinks = {}
                    action.data.map(
                        (val) => {
                            fetchedLinks[val.id] = val
                        }
                    )

                    if (Object.keys(currentLinks).length >= 1){
                        fetchedLinks = {
                            ...currentLinks,
                            ...fetchedLinks
                        }
                    }
                    else{
                        let newState = {
                            ...state,
                            isFetching: false,
                            fetchFailed: false,
                            failureReason: undefined,
                            failureMessage: undefined,
                            data: fetchedLinks
                        }

                        return newState
                    }
                    
                default:
                    return state
            }
        case TYPES.REQUEST_FAILED:
            switch(action.resourceType){
                case RESOURCE_TYPES.LINKS:
                    return {
                        ...state,
                        isFetching: false,
                        fetchFailed: true,
                        failureReason: action.failureReason,
                        failureMessage: action.message
                    }
                default:
                    return state
            }
        default:
            return state
    }
} 
const rootReducer = combineReducers(
    {
        links,
        language
    }
)


export default rootReducer
