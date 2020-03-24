import React, {useState} from "react"
import PropTypes from "prop-types"
import {useTranslation} from "react-i18next"
import {FormControl, InputGroup, InputLeftElement, Input, Icon, FormLabel, Stack, Box, MenuButton, Menu, MenuList, MenuItem, Button} from "@chakra-ui/core"

export function LinkMetadataForm(props){
    const [url, setUrl ] = useState(props.data.url)
    const [title, setTitle] = useState(props.data.title)
    const [description, setDescription] = useState(props.data.description)
    const [language, setLanguage] = useState(props.data.language)
    const [imageLink, setImageLink ] = useState(props.data.imageLink)
    
    const [t] = useTranslation()
    return(
        <Stack 
            spacing={2} 
            width= {
            [
                "100%",
                "80%",
                "70%",
                "50%"
            ]
        }>
        <FormControl>
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
                type="url"
                id="link"
                value={url}
                aria-label = {t("insert your link here")}
            ></Input>
            </InputGroup>
        </FormControl >
        <FormControl>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Box display="flex">
                <Input 
                    id ="title" 
                    isRequired={true}
                    value={title}
                    aria-label = "insert the title of the link here"
                ></Input>
                 <Menu id = "language" >
                    <MenuButton
                        bg="gray.700"
                        color="white"
                        leftIcon="earth"
                        as = {Button}
                        rightIcon="chevron-down"
                        ml = "5px"
                        _hover={{
                            bg: "gray.600"
                        }}
                        fontSize={
                            [
                                "sm",
                                "md"
                            ]
                        }
                        width = {
                            [
                                "150px",
                                "200px"
                            ]
                        } 
                    >
                        Language
                    </MenuButton>
                    <MenuList>
                        <MenuItem>
                            English
                        </MenuItem>
                        <MenuItem>
                            French
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </FormControl>
       
        </Stack>
    )
}


LinkMetadataForm.propTypes = {
    data: PropTypes.objectOf(PropTypes.string).isRequired
}


