import React from "react"
import { theme as defaultTheme} from "@chakra-ui/core"

const customIcons = {
    home:{
        path: <path fill="currentColor" d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z"/>,
        viewBox: "0 0 32 32"
    },
    link:{
        path: (
            <g fill="currentColor">
                <path d="M13.757 19.868a1.62 1.62 0 0 1-1.149-.476c-2.973-2.973-2.973-7.81 0-10.783l6-6C20.048 1.169 21.963.376 24 .376s3.951.793 5.392 2.233c2.973 2.973 2.973 7.81 0 10.783l-2.743 2.743a1.624 1.624 0 1 1-2.298-2.298l2.743-2.743a4.38 4.38 0 0 0 0-6.187c-.826-.826-1.925-1.281-3.094-1.281s-2.267.455-3.094 1.281l-6 6a4.38 4.38 0 0 0 0 6.187 1.624 1.624 0 0 1-1.149 2.774z"/>
                <path d="M8 31.625a7.575 7.575 0 0 1-5.392-2.233c-2.973-2.973-2.973-7.81 0-10.783l2.743-2.743a1.624 1.624 0 1 1 2.298 2.298l-2.743 2.743a4.38 4.38 0 0 0 0 6.187c.826.826 1.925 1.281 3.094 1.281s2.267-.455 3.094-1.281l6-6a4.38 4.38 0 0 0 0-6.187 1.624 1.624 0 1 1 2.298-2.298c2.973 2.973 2.973 7.81 0 10.783l-6 6A7.575 7.575 0 0 1 8 31.625z"/>
            </g>
        ),
        viewBox: "0 0 32 32"
    },
    submit:{
        path: (
            <g fill="currentColor">
                <path d="M14 18h4v-8h6l-8-8-8 8h6zm6-4.5v3.085L29.158 20 16 24.907 2.842 20 12 16.585V13.5L0 18v8l16 6 16-6v-8z"/>
            </g>
        ),
        viewBox: "0 0 32 32"
    },

    earth:{
        path:<path fill= "currentColor" 
        d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 30c-1.967 0-3.84-.407-5.538-1.139l7.286-8.197a.998.998 0 00.253-.664v-3a1 1 0 00-1-1c-3.531 0-7.256-3.671-7.293-3.707A1 1 0 009.001 12h-4a1 1 0 00-1 1v6c0 .379.214.725.553.894l3.447 1.724v5.871c-3.627-2.53-6-6.732-6-11.489 0-2.147.484-4.181 1.348-6h3.652c.265 0 .52-.105.707-.293l4-4A1 1 0 0012.001 5V2.581a14.013 14.013 0 014-.581c2.2 0 4.281.508 6.134 1.412A5.961 5.961 0 0020.002 8c0 1.603.624 3.109 1.757 4.243a5.985 5.985 0 004.536 1.751c.432 1.619 1.211 5.833-.263 11.635a.936.936 0 00-.026.163A13.956 13.956 0 0116.002 30z"
        />,
        viewBox: "0 0 32 32"
    }

}


export const theme = {
    ...defaultTheme,
    icons:{
        ...defaultTheme.icons,
        ...customIcons
    }
}

