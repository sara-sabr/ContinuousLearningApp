import React from "react";
import { useLocation} from "react-router-dom"
import {Heading, Flex, Menu, MenuButton, MenuList, MenuItem, Button} from "@chakra-ui/core";



export function Navigation(props){
    let location = useLocation()
    console.log(location)
    return (
        <Flex
        as="nav"
        align="center"
        wrap="wrap"
        padding="0.5rem"
        bg="purple.400"
        color="white"
        {...props}
        >
        <Flex align="center" mr={5}>
            <Heading as="h1" size="lg">
            GCShare
            </Heading>
        </Flex>
        <Menu>     
            <MenuButton
                width={[
                    "90px",
                    "100px",
                ]}
                fontSize={[
                    "sm",
                    "md"
                ]}
                bg="gray.700" 
                leftIcon="drag-handle"
                as={Button} 
                rightIcon="chevron-down"
                _hover={{ bg: "gray.600"}}
            >
                {props.page}
            </MenuButton>
            <MenuList
                bg="gray.700"
            >
                <MenuItem
                    _focus={{
                        bg: "gray.600"
                    }}   
                >
                    Download
                </MenuItem>
                <MenuItem
                    _focus={{
                        bg: "gray.600"
                    }} 
                    onClick={() => alert("Kagebunshin")}>
                        Create a Copy
                </MenuItem>
            </MenuList>
        </Menu>
        
        </Flex>
    );
};
