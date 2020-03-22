import React from "react"
import {Link as ReachLink, useLocation} from "react-router-dom"
import {MenuItem, Icon} from "@chakra-ui/core"
import PropTypes from "prop-types"



export function NavMenuItem(props){
    let location = useLocation()
    
    // make nav item able to be clicked by keyboard for accessibility 
    let keyboardEnterHandler = (event) => {
        if(event.which === 13){
            event.target.click()
        }
    }
    return (
        <MenuItem
            _focus= {{
                bg: props.focusColor ? props.focusColor : undefined
            }}
            display = {
                props.link === location.pathname ? "none": "flex"
            }
            onKeyDown = {keyboardEnterHandler}           
            fontSize="3"
            as= {ReachLink}
            to={props.link}
        >
            
        {
            props.icon ? <Icon
                size="3"
                name ={props.icon} mr="2"></Icon>: undefined
        }
        {props.children}
            
        </MenuItem>
    )
}

NavMenuItem.propTypes = {
    link: PropTypes.string.isRequired,
    focusColor: PropTypes.string,
    icon: PropTypes.string
}






