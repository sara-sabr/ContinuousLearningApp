export const TYPES = {
    CHANGE_LANGUAGE: "CHANGE_LANGUAGE",
    REQUEST: "REQUEST",
    RECIEVE: "RECIEVED",
    REQUEST_FAILED: "REQUEST_FAILED",
    CHANGE_ORDER: "CHANGE_ORDER",
    CREATE_NEW_LINK: "CREATE_NEW_LINK",
    SUBMIT: "SUMBIT",
    INVALID_LINK: "INVALID_LINK",
    SUBMIT_FAILED: "SUBMIT_FAILED"
}

export const LANGUAGES = {
    en: "en",
    fr: "fr"
}

export const RESOURCE_TYPES = {
    LINKS: "LINKS",
    LINK: "LINK",
    LINK_METADATA: "LINK_METADATA"
}

export const INVALID_LINK_TYPES = {
    NOT_UNIQUE: "NOT_UNIQUE",
    BAD_FORMAT: "BAD_FORMAT"
}

export const REQUEST_FAILURE_TYPES = {
    NETWORK_ERROR: "NETWORK_ERROR",
    SERVER_ERROR: "SERVER_ERROR",
    BAD_REQUEST: "BAD_REQUEST"
}

export const ORDER = {
    ASC: "asc",
    DESC: "desc"
}

export const changeLanguageCreator = function(language){
    return {
        type: TYPES.CHANGE_LANGUAGE,
        language: language
    }
}


/* LINKS ACTIONS */
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

export const changeLinksOrderCreator = function(orderBy=undefined, order){
    return {
        type: TYPES.CHANGE_ORDER,
        resourceType: RESOURCE_TYPES.LINKS,
        orderBy,
        order
    }
}

/* SUBMIT ACTIONS */

export const createNewLinkCreator = function(link){
    return {
        type: TYPES.CREATE_NEW_LINK,
        link: link
    }
}

export const linkNotUniqueCreator = function(){
    return {
        type: TYPES.INVALID_LINK,
        invalidLinkType: INVALID_LINK_TYPES.NOT_UNIQUE
    }
}

export const linkBadFormatCreator = function(){
    return {
        type: TYPES.INVALID_LINK,
        invalidLinkType: INVALID_LINK_TYPES.BAD_FORMAT
    }
}

export const submitFailedCreator = function(failureReason, message){
    return {
        type: TYPES.SUBMIT_FAILED,
        resourceType: RESOURCE_TYPES.LINK,
        failureReason: failureReason,
        message: message
    }
}

export const requestLinkMetadataCreator = function(){
    return {
        type: TYPES.REQUEST,
        resourceType: RESOURCE_TYPES.LINK_METADATA
    }
}

export const requestLinkMetadataFailedCreator = function(failureReason, message){
    return {
        type: TYPES.REQUEST_FAILED,
        resourceType: RESOURCE_TYPES.LINK_METADATA,
        failureReason: failureReason,
        message: message
    }
}

export const recievedLinkMetadataCreator = function(data){
    return {
        type: TYPES.RECIEVE,
        resourceType: RESOURCE_TYPES.LINK_METADATA,
        data
    }
}
