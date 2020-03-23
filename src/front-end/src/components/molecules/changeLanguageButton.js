import React from "react"
import {useTranslation} from "react-i18next"
import {useDispatch} from "react-redux"
import { changeLanguage } from "../../redux/dispatchers"
import {Button} from "@chakra-ui/core"
import PropTypes from "prop-types"



export function ChangeLanguageButton(props){
    let dispatch = useDispatch()
    let {i18n} = useTranslation()
    let languageToggle = () => {
        if(i18n.language === "en"){
            changeLanguage("fr", dispatch)
        }else{
            changeLanguage("en", dispatch)
        }
    }

    return (
        <Button 
            ml = {props.ml} 
            leftIcon="earth" 
            bg={props.bg}
            fontSize={props.fontSize}
            onClick={languageToggle}
            _hover = {{
                bg: props.hoverColor
            }}
        >
            { i18n.language === "en" ? "FR": "EN"}
        </Button>
    )
}

ChangeLanguageButton.propTypes = {
    ml: PropTypes.string,
    bg: PropTypes.string,
    hoverColor: PropTypes.string,
    fontSize: PropTypes.arrayOf(PropTypes.string)
}

