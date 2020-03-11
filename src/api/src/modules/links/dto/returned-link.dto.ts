import {ApiProperty } from "@nestjs/swagger"
import { url } from "inspector";
import { format } from "url";
export class ReturnedLinkDTO {
    @ApiProperty()
    id: number;
    @ApiProperty({format: "url", example: "https://lookatthiscoollink.com"})
    url: string;
    @ApiProperty({example: "Awesome Link"})
    title: string;
    @ApiProperty({enum: ["en", "fr"]})
    language: string;
    @ApiProperty({required: false, example: "Look at this awesome link I found cause I'm awesome"})
    description?: string;
    @ApiProperty({format: "url", required: false, example: "https://imagepage.com/thisisapng.png"})
    imageLink?: string;
    @ApiProperty({readOnly: true})
    createdOn: Date;
    @ApiProperty({readOnly: true})
    updatedOn?: Date;
}