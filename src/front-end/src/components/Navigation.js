import React from "react"
import {Link} from "react-router-dom"

export function Navigation(){
    return (
        <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/dashboard">Dashbord</Link></li>
        </ul>
    )
}