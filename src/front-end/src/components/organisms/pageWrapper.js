import React from "react"
import {FullPage} from "../atoms/fullPage"
import {Navigation} from "../organisms/Navigation"
import {Box} from "@chakra-ui/core"
import PropTypes from "prop-types"


export function PageWrapper(props){
    return (
        <FullPage>
            <Navigation icon={props.icon} page={props.page} />
            {props.centered ?
                <Box 
                    display="flex" 
                    width="100%" 
                    height="100%"
                    flexDirection="column" 
                    justifyContent="center"
                    alignItems="center" 
                    mt="-65px"
                >
                    {props.children}
                </Box>:
                props.children
            }
        </FullPage>
    )
}

PageWrapper.defaultProps={
    centered: false
}

PageWrapper.propTypes={
    icon: PropTypes.string,
    page: PropTypes.string,
    children: PropTypes.node,
    centered: PropTypes.bool
}