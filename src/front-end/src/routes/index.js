import React from "react"
import { SecuredRoute } from "./utils"
import {BrowserRouter, Route, Redirect} from "react-router-dom"
import { useKeycloak } from "@react-keycloak/web"
import Home from "../pages/Home";
import About from "../pages/About";
import Dashboard  from "../pages/Dashboard"
import Login from "../pages/Login"

export function AppRouter(props){
    const [,initialized] = useKeycloak()

    if(!initialized){
        return <div>Loading...</div>
    }

    return(
        <BrowserRouter>
            <Redirect from = "/" to = "/home"></Redirect>
            <Route exact path="/home" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/login" component={Login}/>
            <SecuredRoute path="/dashboard" component={Dashboard} />
            {props.children}
        </BrowserRouter>
    )
}

