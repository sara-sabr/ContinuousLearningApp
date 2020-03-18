import React, { Component } from 'react';

import Keycloak from 'keycloak-js';

class Secured extends Component {
    constructor(props) {
        super(props);
        this.state = { keycloak: null, authenticated: false };
    }

    componentDidMount() {

        let initOptions = {
            url: process.env.REACT_APP_KEYCLOAK_AUTH_URL,
            realm: process.env.REACT_APP_KEYCLOAK_REALM,
            clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
        };

        var keycloak = Keycloak(initOptions);

        keycloak.init({ onLoad: initOptions.onLoad }).success((auth) => {
            this.setState({ keycloak: keycloak, authenticated: auth })
        });
    }

    render() {
        if (this.state.keycloak) {
            if (this.state.authenticated) return (
                <div>
                    {this.props.render(this.state)}
                </div >
            ); else return (
                <div>Access denied</div>
            )
        }
        return (
            // Waiting on keycloak to load.
            <div>...</div>
        );
    }
}

export default Secured;