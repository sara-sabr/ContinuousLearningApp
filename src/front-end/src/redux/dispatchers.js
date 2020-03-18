import "cross-fetch/polyfill";
import * as actions  from "./actions";
import * as variables from "../variables";
import validator from "validator"


export const changeLanguage = function(language, dispatcher){
    let currentLanguage = localStorage.getItem("language")
    if (! currentLanguage){
        if (actions.LANGUAGES[language]){
            localStorage.setItem("language", language)
            dispatcher(
                actions.changeLanguageCreator(language)
            )
        }
        else{
            let message = `ERROR: Invalid language '${language}'. Valid languages are '${Object.keys(actions.LANGUAGES).join(", ")}'.`
            console.error(message)
        }
    }
    else if (currentLanguage !== language){
        if(actions.LANGUAGES[language]){
            localStorage.setItem("language", language)
            dispatcher(
                actions.changeLanguageCreator(language)
            )
        }
        else{
            let message = `ERROR: Invalid language '${language}'. Valid languages are '${Object.keys(actions.LANGUAGES).join(", ")}'.`
            console.error(message)
        }
    }
}

export const changeOrder = function(dispatcher, order, orderBy = undefined){
    if(order !== actions.ORDER.ASC && order !== actions.ORDER.DESC){
        console.error(`ERROR: order is not valid order must be either ${Object.values(actions.ORDER).join(", ")}`)
    }
    else{
        dispatcher(actions.changeLinksOrderCreator(
            orderBy, order
        ))
    }
}


/* LINKS dispatchers */
function shouldFetchLinks(state){
    if (state.isFetching){
        return false 
    }
    return true 
} 

async function fetchLinksData(dispatch, options = {
    limit: undefined,
    offset: undefined,
    order: "asc"
}){
    if (! options){
        options = {
            order: "asc"
        }
    }
    else if (!options.order ){
        options.order = "asc"
    }
    
    // dispatch request action
    dispatch(actions.requestLinksCreator(options))

    // build request url from options 
    let requestUrl = variables.apiURL + `/links?order=${options.order}`
    if( options.limit ){
        requestUrl += `&limit=${options.limit}`
    }
    if (options.offset){
        requestUrl += `&offset=${options.offset}`
    }

    try{
        let results = await fetch(requestUrl)
        if (results.ok){
            let data = await results.json()
            dispatch(
                actions.recieveLinksCreator(
                    data
                )
            )
        }
        else if (results.status >= 500 && results.status < 600){
            const contentType = results.headers.get("content-type")
            let message = undefined
            
            if (contentType && contentType.startsWith("application/json")){
               let responseJSON = await results.json()
               if(responseJSON.message){
                   message = responseJSON.message
               }
            }
            else if (contentType && contentType.startsWith("text/plain")){
                message  = await results.text()
            }
            console.error("SERVER ERROR: " + message)
            dispatch(
                actions.recieveLinksFailedCreator(
                    actions.REQUEST_FAILURE_TYPES.SERVER_ERROR,
                    message
                )
            )

        }
        else if (results.status >= 400 && results.status < 500){
            let responseBody
            let responseMessage
            try{
                responseBody = await results.json()
                responseMessage = responseBody.message
            }catch(e){}
            let message 
            if (responseBody){
                if(typeof responseMessage === "object"){
                    message = JSON.stringify(responseMessage)
                    console.error("BAD REQUEST: " +message)
                }
                else if( typeof responseMessage === "string"){
                    message = responseMessage
                    console.error("BAD REQUEST: " + message)
                }
                else{
                    message = JSON.stringify(responseBody)
                    console.error("BAD REQUEST: " + JSON.stringify(responseBody))
                }       
            }
            else{
                console.error("BAD REQUEST")
            }
            dispatch(
                actions.recieveLinksFailedCreator(
                    actions.REQUEST_FAILURE_TYPES.BAD_REQUEST,
                    message
                )
            )
        }
    }catch(e){
        console.error("NETWORK ERROR: " + e.message)
        dispatch(
            actions.recieveLinksFailedCreator(
                actions.REQUEST_FAILURE_TYPES.NETWORK_ERROR,
                e.message
            )
        )
    }
    
}

export const fetchLinks = function(options = {
    order: "asc",
    limit: undefined,
    offset: undefined
}){
    return (dispatch, getState) =>{
        const { links } = getState()
        let shouldFetch = shouldFetchLinks(links)
        if (shouldFetch){
            return fetchLinksData(dispatch, options)
        }
    }
}


/* submit dispatchers */

async function checkIfLinkIsUnique(link){
    let encodedLink = encodeURIComponent(link)
    let requestUrl = variables.apiURL + `/links/url/${encodedLink}`
    try{
        let result = await fetch(requestUrl)
        if (result.ok){
            return true 
        }
        else if(result.status === 404){
            return false
        }
        else{
            let responseBody = await result.text()
            let error = new Error(
                "Endpoint Error: Recieved bad response from endpoint, could not validate " +
                "status: " + result.status,
                "body: " + responseBody
            )
            error.status = result.status
            
            throw error
        }

    }catch(e){
        throw new Error("Network Error: " + e.message)
    }
}

async function fetchLinkMetadata(dispatch, link){
    let encodedLink = encodeURIComponent(link)
    let requestURL = variables.linkMetadataExtractorAPI + `/url=${encodedLink}`
    dispatch(
        actions.requestLinkMetadataCreator()
    )
    try{
        let result = await fetch(requestURL)
        if (result.ok){
            let data = await result.json()
            dispatch(
                actions.recievedLinkMetadataCreator(
                    data
                )
            )
        }
        else{
            let data = await result.json()
            let message = data.code + ": " + data.message
            if (result.status >= 400 && result.status <500){
                dispatch(
                    actions.requestLinkMetadataFailedCreator(
                        actions.REQUEST_FAILURE_TYPES.BAD_REQUEST,
                        message
                    )
                )
            }
            else{
                let data = await result.json()
                let message = data.code + ": " + data.message
                dispatch(
                    actions.requestLinkMetadataFailedCreator(
                        actions.REQUEST_FAILURE_TYPES.BAD_REQUEST,
                        message
                    )
                )
            }
        }
    }catch(e){
        dispatch(
            actions.requestLinkMetadataFailedCreator(
                actions.REQUEST_FAILURE_TYPES.NETWORK_ERROR,
                e.message
            )
        )   
    }

}

async function createNewLink(dispatch, link){
    dispatch(actions.createNewLinkCreator(link))
    let isValidLink = validator.isURL(
        link,
        {
            require_protocol: true,
            require_valid_protocol: true,
            protocols: ["http", "https"],
            require_host: true,
            require_tld: true
        }
    )
    if (isValidLink){
        let unique = false
        try{
            unique = await checkIfLinkIsUnique(link)
        }catch(e){
            if(e.message.startsWith("Endpoint Error")){
                let status = error.status 
                if (status >= 400 && status < 500){
                    dispatch(
                        actions.submitFailedCreator(
                            actions.REQUEST_FAILURE_TYPES.BAD_REQUEST,
                            e.message
                        )
                    )
                }
                if (status >= 500 && status < 600){
                    dispatch(
                        actions.submitFailedCreator(
                            actions.REQUEST_FAILURE_TYPES.SERVER_ERROR
                        )
                    )
                }   
            }
        }
        if(! unique){
            try{
                let result = await fetch(link)
                if (result.status >= 400 && result.status < 600){
                    dispatch(
                        actions.linkErrorCreator()
                    )
                }
            }catch(e){
                dispatch(
                    actions.linkDoesNotExistCreator()
                )
            }
            dispatch(
                actions.linkValidatedCreator()
            )
            await fetchLinkMetadata(dispatch, link)
        }
        else{
            dispatch(
                actions.linkNotUniqueCreator()
            )
        }
    }
    else{
        dispatch(
            actions.linkBadFormatCreator()
        )
    }
}


export const createNewLinkDispatcher = function(link){
    return (dispatch) => {
        return createNewLink(dispatch, link)
    }
}