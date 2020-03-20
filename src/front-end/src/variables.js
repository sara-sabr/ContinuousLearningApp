export let apiURL
export const environment = process.env.NODE_ENV

if(environment === "development"){
    apiURL = process.env.REACT_APP_API_URL || "http://localhost:4000/api"
}
else{
    apiURL = process.env.REACT_APP_API_URL || "/api"
}
export const linkMetadataExtractorAPI = process.env.REACT_APP_LINK_METADATA_EXTRACTOR || "https://api.microlink.io"
export const webSiteName = process.env.REACT_APP_WEBSITE_NAME 
export const keycloakAuthURL = process.env.REACT_APP_KEYCLOAK_AUTH_URL
export const keycloakRealm  = process.env.REACT_APP_KEYCLOAK_REALM
export const keycloakClientId = process.env.REACT_APP_KEYCLOAK_CLIENT_ID