import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from "@chakra-ui/core"
import * as Keycloak from 'keycloak-js'

// Keycloak configuration
console.log(process.env.REACT_APP_KEYCLOAK_AUTH_URL);
console.log(process.env.REACT_APP_KEYCLOAK_REALM);
console.log(process.env.REACT_APP_KEYCLOAK_CLIENT_ID);
let initOptions = {
    url: process.env.REACT_APP_KEYCLOAK_AUTH_URL,
    realm: process.env.REACT_APP_KEYCLOAK_REALM,
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
    onLoad: 'login-required'
}

let keycloak = Keycloak(initOptions);

keycloak.init({ onLoad: initOptions.onLoad }).success((auth) => {

    if (!auth) {
        window.location.reload();
    } else {
        console.info("Authenticated");
    }

    ReactDOM.render(
        <ThemeProvider>
            <App />
        </ThemeProvider>,
        document.getElementById('root')
    );
    localStorage.setItem("react-token", keycloak.token);
    localStorage.setItem("react-refresh-token", keycloak.refreshToken);

    setTimeout(() => {
        keycloak.updateToken(70).success((refreshed) => {
            if (refreshed) {
                console.debug('Token refreshed' + refreshed);
            } else {
                console.warn('Token not refreshed, valid for '
                    + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
            }
        }).error(() => {
            console.error('Failed to refresh token');
        });
    }, 60000)
}).error(() => {
    console.error("Authenticated Failed");
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
