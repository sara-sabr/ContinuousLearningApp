import React from "react"
import {BrowserRouter, Route, Redirect, Switch} from "react-router-dom"
import { useKeycloak } from "@react-keycloak/web"
import { Home  }  from "../pages/Home";
import { Links } from "../pages/Links"
import { Link } from "../pages/Link"
import { Submit } from "../pages/Submit";

export function AppRouter(props){
    const [,initialized] = useKeycloak()

    if(!initialized){
        return <div>Loading...</div>
    }

    return(
        <BrowserRouter>
            <Switch>
                <Route exact path="/home" component={Home} />
                <Route exact path="/links" component={Links}/>
                <Route exact path="/submit" component={Submit}/>
                <Route path="/links/:id" component={Link}/>
                <Redirect from = "/" to = "/home"></Redirect>
            </Switch>
        </BrowserRouter>
    )
}

