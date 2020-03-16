import { combineReducers, bindActionCreators } from "redux"
import {TYPES, RESOURCE_TYPES } from "./actions"
import i18n from "../translations" 
import { act } from "react-dom/test-utils"
import { sortBasedOnKeys, sortBasedOnKey } from "./utils"


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
    order: "asc",
    orderBy: "createdOn",
    data: {},
    sortedData: []
}, action){
    switch (action.type){
        case TYPES.REQUEST:
            switch (action.resourceType){
                case RESOURCE_TYPES.LINKS:
                    return {
                        ...state,
                        isFetching: true,
                        fetchFailed: false,
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
                    let newLinks = {}
                    let sortedData = []

                    action.data.map(
                        (val) => {
                            fetchedLinks[val.id] = val
                        }
                    )

                    if (Object.keys(currentLinks).length >= 1){
                        newLinks = {
                            ...currentLinks,
                            ...fetchedLinks
                        }
                        sortedData = sortBasedOnKey(
                            Object.values(newLinks),
                            state.orderBy,
                            state.order
                        )
                    

                    }
                    else{
                        newLinks = fetchedLinks
                        sortedData =  sortBasedOnKey(
                            Object.values(newLinks),
                            state.orderBy,
                            state.order
                        )
                    }
                
                    let newState = {
                        ...state,
                        isFetching: false,
                        fetchFailed: false,
                        failureReason: undefined,
                        failureMessage: undefined,
                        data: newLinks,
                        sortedData: sortedData
                    }

                    return newState
                    
                    
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
