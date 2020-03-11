import {ApiProperty } from "@nestjs/swagger"
export class ReturnedLinkDTO {
    @ApiProperty()
    id: number;
    @ApiProperty()
    url: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    language: string;
    @ApiProperty()
    description?: string;
    @ApiProperty()
    imageLink?: string;
    @ApiProperty()
    createdOn: Date;
    @ApiProperty()
    updatedOn?: Date;
}