import React, { useState } from "react"
import {Navigation} from "../components/organisms/Navigation"
import {useSelector, useDispatch, shallowEqual} from "react-redux"
import {useTranslation} from "react-i18next"
import { FormControl, FormLabel, Input, Icon, Box, Heading, Text, Button, InputLeftElement, InputGroup, FormHelperText} from "@chakra-ui/core"
import validator from "validator"



export function Submit(props){
    const [t] = useTranslation()
    const dispatcher = useDispatch()
    const validLink = useSelector(state => state.submit.validLink)
    const link = useSelector(state => state.submit.link)
    const [isValidFormat, setIsValidFormat] = useState(validLink)
    const [linkValue, setLinkValue] = useState(link)
    const linkData = useSelector(state => state.submit.linkData, shallowEqual)
    const isFetchingMetadata = useSelector(state => state.submit.isFetchingMetadata)
    const fetchMetadataFailed = useSelector(state => state.submit.fetchMetadataFailed)


    let linkOnChangeHandler = function(e){
        let value = e.target.value
        setIsValidFormat(
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

    return (
        <div className="container">
            <Navigation icon="submit" page="Submit"/>
            <Box display="flex" 
                 width="100%" 
                 height="100%"
                 flexDirection="column" 
                 justifyContent="center"
                 alignItems="center" 
                 mt="-65px"
            >
                    <Heading as="h2">
                        {t("Add a link 🎉")}
                    </Heading>
                    <Text width={[
                        "100%",
                        "80%",
                        "70%",
                        "50%"
                        ]}
                        mt="10px"
                        mb="10px"
                        fontSize={
                            [
                                "sm",
                                "md",
                                "lg",
                                "xl"
                            ]
                        }
                        p={[
                            2,
                            0
                        ]}
                    >
                        {t("link explanation")}
                    </Text>
                <FormControl 
                    width={[
                        "100%",
                        "80%",
                        "70%",
                        "50%"
                    ]}
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
                            children={<Icon name = "link"></Icon>}
                        />
                        <Input
                            isRequired={true}
                            isInvalid={linkValue === "" ? false : !isValidFormat} 
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
                        isValidFormat? 
                        undefined
                        :
                        <FormHelperText id="link-helper-text">
                            {t("link help")}
                        </FormHelperText>
                    }
                    <Box
                        mt ="5px"
                        display={[
                            "flex",
                            "flex",
                            "block",
                            "block"
                        ]}
                        justifyContent={
                            [
                                "flex-end",
                                "flex-end",
                                undefined,
                                undefined
                            ]
                        } 
                    >
                        <Button
                            isDisabled={!isValidFormat} 
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
                    </Box>
                    
                </FormControl>
            </Box>
            
        </div>
    )
}