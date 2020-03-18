import {IsNotEmpty, Validate, IsOptional, IsUrl} from "class-validator";
import {ValidLanguage} from "./validators/language-validator"
import { ApiProperty , ApiPropertyOptional} from "@nestjs/swagger";


export class CreateLinkDTO{
    
    @ApiProperty({format: "url", example: "https://lookatthiscoollink.com"})
    @IsUrl({
        require_protocol: true,
        require_host: true,
        require_tld: true,
        protocols: ["https", "http"]
    })
    @IsNotEmpty()
    url: string;
    
    @ApiProperty({example: "Awesome Link"})
    @IsNotEmpty()
    title: string;
    
    @ApiProperty({enum: ["en", "fr"]})
    @Validate(ValidLanguage)
    @IsNotEmpty()
    language: string;
    
    @ApiPropertyOptional({example: "Look at this awesome link I found cause I'm awesome"})
    @IsOptional()
    @IsNotEmpty()
    description?: string;

    @ApiPropertyOptional({format: "url", example: "https://imagepage.com/thisisapng.png"})
    @IsOptional()
    @IsUrl({
        require_protocol: true,
        require_valid_protocol: true,
        require_host: true,
        require_tld: true,
        protocols: ["https", "http"]
    })
    imageLink?: string;
}


export class CreateLinkReturnDTO{
    @ApiProperty()
    id: number
}
