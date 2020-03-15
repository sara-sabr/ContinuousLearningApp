export const TYPES = {
    CHANGE_LANGUAGE: "CHANGE_LANGUAGE",
    REQUEST: "REQUEST",
    RECIEVE: "RECIEVED",
    REQUEST_FAILED: "REQUEST_FAILED"
}

export const LANGUAGES = {
    en: "en",
    fr: "fr"
}

export const RESOURCE_TYPES = {
    LINKS: "LINKS",
    LINK: "LINK"
}

export const REQUEST_FAILURE_TYPES = {
    NETWORK_ERROR: "NETWORK_ERROR",
    SERVER_ERROR: "SERVER_ERROR",
    BAD_REQUEST: "BAD_REQUEST"
}

export const changeLanguageCreator = function(language){
    return {
        type: TYPES.CHANGE_LANGUAGE,
        language: language
    }
}

export const requestLinksCreator = function(options = {
    limit: undefined,
    offset: undefined,
    order: "asc"
}){
    if (! options){
        options = {
            order: "asc"
        }
    }
    else if(!options.order){
        options.order = "asc"
    }
    return {
        type: TYPES.REQUEST,
        resourceType: RESOURCE_TYPES.LINKS,
        ...options
    }
}

export const recieveLinksCreator = function(data){
    return {
        type: TYPES.RECIEVE,
        resourceType: RESOURCE_TYPES.LINKS,
        data
    }
}

export const recieveLinksFailedCreator = function(failureReason, message){
    return{
        type: TYPES.REQUEST_FAILED,
        resourceType: RESOURCE_TYPES.LINKS,
        failureReason: failureReason,
        message
    }
}