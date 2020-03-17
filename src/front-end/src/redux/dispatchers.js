import "cross-fetch/polyfill";
import * as actions  from "./actions";
import * as variables from "../variables";
import { act } from "react-dom/test-utils";


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