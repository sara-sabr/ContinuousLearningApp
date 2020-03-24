import React, { useState } from "react"
import {useTranslation} from "react-i18next"
import { FormControl, FormLabel, Input, Icon, Box, Button, InputLeftElement, InputGroup, FormHelperText} from "@chakra-ui/core"
import validator from "validator"
import PropTypes from "prop-types"
import {INVALID_LINK_TYPES } from "../../redux/actions"



export function LinkForm(props){
    const [t] = useTranslation()
    const [linkValue, setLinkValue] = useState(props.link)
    const [isValid, setIsValid] = useState(props.isValid)
    let linkOnChangeHandler = function(e){
        let value = e.target.value
        setIsValid(
            validator.isURL(
                value,
                {
                    require_protocol: true,
                    require_valid_protocol: true,
                    protocols: ["http", "https"],
                    require_host: true,
                    require_tld: true
                }
            )
        )
        setLinkValue(value)
    }

    let helperText
    
    if(!isValid){
        if(props.invalidLinkReason && props.invalidLinkReason !== INVALID_LINK_TYPES.BAD_FORMAT){
            if(props.invalidLinkReason === INVALID_LINK_TYPES.DOES_NOT_EXIST){
                helperText = <FormHelperText 
                color="gray.700"
                id="link-helper-text">
                    {t("link does not exist")}
                </FormHelperText>
            }
            else if (props.invalidLinkReason === INVALID_LINK_TYPES.LINK_ERROR){
                helperText = <FormHelperText 
                color="gray.700"
                id="link-helper-text">
                    {t("link error")}
                </FormHelperText>
            }
        }
        else{
            helperText = <FormHelperText 
                color="gray.700"
                id="link-helper-text">
                {t("link help")}
            </FormHelperText>
        }
    }

    return (
        <FormControl 
                    width={props.width}
                    p = {
                       [
                           2,
                           0
                       ]
                   }
                >
                    <FormLabel htmlFor="link">{t("Link")}</FormLabel>
                    <InputGroup>
                        <InputLeftElement 
                            bg= "gray.700" 
                            color= "white"
                            borderRadius="4px 0px 0px 4px" 
                            children={<Icon name = "link" alt="link icon"></Icon>}
                        />
                        <Input
                            isRequired={true}
                            isInvalid={linkValue === "" ? false : !isValid} 
                            onChange={linkOnChangeHandler}
                            value={linkValue} 
                            type="url"
                            placeholder={t("yourawesomelink")} 
                            id = "link" 
                            aria-label = {t("insert your link here")}
                        >
                        </Input>
                    </InputGroup>
                    {
                        helperText
                    }
                    { isValid ? 
                        <Box
                            mt ="5px"
                            display={
                                props.switchButtonOnMobile ?
                                [
                                    "flex",
                                    "flex",
                                    "block",
                                    "block"
                                ]
                                :
                                "block" 
                            }
                            justifyContent={
                                props.switchButtonOnMobile ?
                                [
                                    "flex-end",
                                    "flex-end",
                                    undefined,
                                    undefined
                                ]:
                                undefined
                            } 
                        >
                            <Button
                                width="100px"
                                bg="gray.700"
                                leftIcon="add"
                                _hover={{
                                    bg: "gray.600"
                                }}
                                color="white"
                            >
                                {t("Next")}
                            </Button>
                        </Box>:
                        undefined
                    }
                    
                    
                </FormControl>
    )


}


LinkForm.defaultProps = {
    isValid: false,
    link: "",
    switchButtonOnMobile: false
}

LinkForm.propTypes= {
    link: PropTypes.string,
    isValid: PropTypes.bool,
    width: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
    ]),
    switchButtonOnMobile: PropTypes.bool,
    invalidLinkReason: PropTypes.string
}

