import React from "react"
import {PageWrapper} from "../components/organisms/pageWrapper"
import {LinkMetadataForm} from "../components/organisms/LinkMetadataForm"
import {LinkForm} from "../components/organisms/LinkForm"
import {useSelector, shallowEqual} from "react-redux"
import {useTranslation} from "react-i18next"
import { Heading, Text, Spinner } from "@chakra-ui/core"
import {INVALID_LINK_TYPES } from "../redux/actions"

export function Submit(props){
    const [t] = useTranslation()
    const validLink = useSelector(state => state.submit.validLink)
    const invalidLinkReason = useSelector(state => state.submit.invalidLinkReason)
    const link = useSelector(state => state.submit.link)
    const linkData = useSelector(state => state.submit.linkData, shallowEqual)
    const isFetchingMetadata = useSelector(state => state.submit.isFetchingMetadata)
    const fetchMetadataFailed = useSelector(state => state.submit.fetchMetadataFailed)
    
    if (isFetchingMetadata){
        return (
            <PageWrapper icon= "submit" page="Submit" centered={true}>
                <Heading
                    as="h2"
                    p="10px"
                    textAlign={[
                        "center",
                        "start"
                    ]}
                    fontSize={
                        [
                            "lg",
                            "lg",
                            "2xl",
                            "3xl"
                        ]
                    }
                >
                   {t("fetching metadata")}
                </Heading>
                <Spinner 
                    mt="15px"
                    size = "40"
                    thickness="5px"
                >

                </Spinner>
            </PageWrapper>         
        )
    }

    else if (fetchMetadataFailed || linkData.url !== ""){
        return(
            <PageWrapper icon ="submit" page="Submit" centered={true}>
                <LinkMetadataForm data={linkData} />
            </PageWrapper>
        )
    }

    else if(( link === "" )|| 
        ( !validLink && 
            ( 
                !invalidLinkReason ||
                invalidLinkReason 
                === 
                INVALID_LINK_TYPES.BAD_FORMAT ||
                invalidLinkReason
                ===
                INVALID_LINK_TYPES.LINK_ERROR ||
                invalidLinkReason
                ===
                INVALID_LINK_TYPES.DOES_NOT_EXIST     
            )
        )
    ){
        return (
            <PageWrapper icon= "submit" page="Submit" centered={true}>
                <Heading as="h2">
                    {t("Add a link 🎉")}
                </Heading>
                <Text width={
                        [
                            "100%",
                            "80%",
                            "70%",
                            "50%"
                        ]
                    }
                    mt="5px"
                    mb="5px"
                    fontSize={
                        [
                            "sm",
                            "md",
                            "lg",
                            "xl"
                        ]
                    }
                    p={
                        [
                            2,
                            0
                        ]
                    }
                >
                    {t("link explanation")}
                </Text>
                <LinkForm 
                    link = {link} 
                    isValid={validLink}
                    invalidLinkReason={invalidLinkReason}
                    width={[
                        "100%",
                        "80%",
                        "70%",
                        "50%"
                    ]}
                    switchButtonOnMobile={true}
                />
            </PageWrapper>
                
        )
    }
}