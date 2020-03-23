import React from 'react';
import {Navigation} from "../components/organisms/Navigation"

export function Home(props){
    return (
        <div className= "container">
            <Navigation page = "Home" icon="home"/>
            <h2>Home</h2>
            Welcome to the home page, please login.
        </div>
    )
}