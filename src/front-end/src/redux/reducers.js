import { combineReducers} from "redux"
import {TYPES, RESOURCE_TYPES } from "./actions"
import i18n from "../translations" 
import { sortBasedOnKey } from "./utils"


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
                            return fetchedLinks[val.id] = val
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
        case TYPES.CHANGE_ORDER:
            switch(action.resourceType){
                case RESOURCE_TYPES.LINKS:
                    if ( action.order === state.order && ( !action.orderBy || action.orderBy === state.orderBy )){
                        return state
                    }
                    else{
                        let sortedData = sortBasedOnKey(
                            Object.values(state.data),
                            action.orderBy ? action.orderBy: state.orderBy,
                            action.order
                        )
                        return {
                            ...state,
                            order: action.order,
                            orderBy: action.orderBy ? action.orderBy: state.orderBy,
                            sortedData: sortedData
                        }
                    }
                default:
                    return state
            }
        default:
            return state
    }
}

export const submit = function(
    state= {
        isSubmitting: false,
        submitFailed: false,
        validLink: false,
        isFetchingMetadata: false,
        fetchMetadataFailed: false,
        linkData:{
            url: "",
            title: "",
            description: "",
            imageLink: "",
            language: ""
        },
        link: ""

    }, action
){
    switch (action.type){
        case TYPES.CREATE_NEW_LINK:
            let newState = {
                isSubmitting: false,
                submitFailed: false,
                validLink: false,
                isFetchingMetadata: false,
                fetchMetadataFailed: false,
                linkData:{
                    url: "",
                    title: "",
                    description: "",
                    imageLink: "",
                    language: ""
                },
                link: action.link
            }

            return newState
        case TYPES.REQUEST:
            switch(action.resourceType){
                case RESOURCE_TYPES.LINK_METADATA:
                    return {
                        ...state,
                        isFetchingMetadata: true,
                        fetchMetadataFailed: false,
                        fetchMetadataFailureReason: undefined,
                        fetchMetatdataFailureMessage: undefined
                    }
                default:
                    return state
            }
        case TYPES.REQUEST_FAILED:
            switch(action.resourceType){
                case RESOURCE_TYPES.LINK_METADATA:
                    return {
                        ...state,
                        isFetchingMetadata: false,
                        fetchMetadataFailed: true,
                        fetchMetadataFailureReason: action.failureReason,
                        fetchMetatdataFailureMessage: action.message

                    }
                default:
                    return state
            }
        case TYPES.INVALID_LINK:
            return {
                ...state,
                validLink: false,
                invalidLinkReason: action.invalidLinkType
            }
        case TYPES.LINK_VALIDATED:
            return {
                ...state,
                validLink: true,
                invalidLinkReason: undefined
            }
        case TYPES.RECIEVE:
            switch(action.resourceType){
                case RESOURCE_TYPES.LINK_METADATA:
                    let rawData = action.data.data
                    let linkData = {
                        url: rawData["url"],
                        title: rawData["title"],
                        description: rawData["description"],
                        language: rawData["lang"]
                    }
                    if(rawData.image){
                        linkData["imageLink"] = rawData.image.url
                    }

                    return {
                        ...state,
                        isFetchingMetadata: false,
                        linkData
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
        submit, 
        links,
        language
    }
)


export default rootReducer
