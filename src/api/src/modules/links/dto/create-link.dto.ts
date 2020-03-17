import {IsFQDN, IsNotEmpty, Validate, IsOptional, IsUrl} from "class-validator";
import {ValidLanguage} from "./validators/language-validator"
import { ApiProperty , ApiPropertyOptional} from "@nestjs/swagger";


export class CreateLinkDTO{
    
    @ApiProperty({format: "url", example: "https://lookatthiscoollink.com"})
    @IsFQDN({
        require_tld: true,
        allow_underscores: true
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
        require_host: true,
        require_tld: true,
        allow_underscores: true 
    })
    imageLink?: string;
}


export class CreateLinkReturnDTO{
    @ApiProperty()
    id: number
}
