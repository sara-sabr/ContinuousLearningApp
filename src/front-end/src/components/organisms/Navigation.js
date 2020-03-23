import React from "react";
import {Heading, Flex, Menu, MenuButton, MenuList, Button, MenuGroup } from "@chakra-ui/core";
import {NavMenuItem} from "../molecules/navMenuItem"
import { ChangeLanguageButton } from "../molecules/changeLanguageButton"
import {useTranslation} from "react-i18next"
import PropTypes from "prop-types"

export function Navigation(props){
    let [t] = useTranslation()
    return (
        <Flex
        as="nav"
        align="center"
        wrap="wrap"
        padding="5px"
        bg="purple.400"
        color="white"
        height="60px"
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
                    "120px",
                    "150px",
                ]}
                fontSize={[
                    "sm",
                    "md"
                ]}
                leftIcon= {props.icon? props.icon : undefined}
                bg="gray.700"
                as={Button} 
                rightIcon="chevron-down"
                _hover={{ bg: "gray.600"}}
            >
                {props.page ? t(props.page): t("Navigation")}
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
        <ChangeLanguageButton
            ml = "1"
            bg = "gray.700"
            fontSize={[
                "sm",
                "md"
            ]}
            hoverColor = "gray.600"
        />
        </Flex>
    );
};


Navigation.propTypes = {
    icon: PropTypes.string,
    page: PropTypes.string.isRequired   
}