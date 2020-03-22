import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider, CSSReset } from "@chakra-ui/core"
import store from "./redux/store"
import { Provider } from "react-redux"
import keycloak, {keycloakProviderInitConfig} from "./keycloak"
import { KeycloakProvider } from "@react-keycloak/web"
import {theme} from "./theme"

ReactDOM.render(
    <KeycloakProvider 
        keycloak={keycloak}
        initConfig={keycloakProviderInitConfig}
    >
        <Provider store = {store}>
            <ThemeProvider theme={theme}>
                <CSSReset/>
                <App />
            </ThemeProvider>
        </Provider>
    </KeycloakProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
