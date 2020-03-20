import * as variables from "./variables"
import Keycloak from "keycloak-js"


let initOptions = {
    url: variables.keycloakAuthURL,
    realm: variables.keycloakRealm,
    clientId: variables.keycloakClientId,
    onLoad: 'check-sso'
}

const keycloak = new Keycloak(
    initOptions
)

export const keycloakProviderInitConfig = {
    onLoad: initOptions.onLoad
}

export default keycloak