import React from "react";
import {Heading, Flex, Menu, MenuButton, MenuList, Button, MenuGroup } from "@chakra-ui/core";
import {NavMenuItem} from "../molecules/navMenuItem"
import {useTranslation} from "react-i18next"
import {useDispatch} from "react-redux"
import { changeLanguage } from "../../redux/dispatchers"


export function Navigation(props){
    let dispatch = useDispatch()
    let [t, i18n ] = useTranslation()
    let languageToggle = () => {
        if(i18n.language === "en"){
            changeLanguage("fr", dispatch)
        }
        else{
            changeLanguage("en", dispatch)
        }
    }
    return (
        <Flex
        as="nav"
        align="center"
        wrap="wrap"
        padding="0.5rem"
        bg="purple.400"
        color="white"
        >
        <Flex align="center" mr={5}>
            <Heading 
                as="h1" 
                size="lg"
                fontSize={[
                    "md",
                    "lg"
                ]}
            >
              {t("GCShare")}
            </Heading>
        </Flex>
        <Menu>     
            <MenuButton
                width={[
                    "95px",
                    "110px",
                ]}
                fontSize={[
                    "sm",
                    "md"
                ]}
                leftIcon= {props.icon}
                bg="gray.700"
                as={Button} 
                rightIcon="chevron-down"
                _hover={{ bg: "gray.600"}}
            >
                {t(props.page)}
            </MenuButton>
            <MenuList
                bg="gray.700"
            >
                <MenuGroup title= "pages" >
                    <NavMenuItem
                    link="/home"
                    icon="home"
                    focusColor="gray.600"
                    >
                        {t("Home")}
                    </NavMenuItem>
                    <NavMenuItem
                    link="/links"
                    icon="link"
                    focusColor="gray.600"
                    > 
                        {t("Links")}
                    </NavMenuItem>
                    <NavMenuItem
                        link="/submit"
                        icon="submit"
                        focusColor="gray.600"
                    >
                        {t("Submit")}
                    </NavMenuItem>
                </MenuGroup>
            </MenuList>
        </Menu>

        <Button 
            ml="1" 
            leftIcon="earth" 
            bg="gray.700"
            fontSize={[
                "sm",
                "md"
            ]}
            onClick={languageToggle}
            _hover = {{
                bg: "gray.600"
            }}
        >
            { i18n.language === "en" ? "FR": "EN"}
        </Button>
        
        </Flex>
    );
};
