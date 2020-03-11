import {IsUrl, IsNotEmpty, Validate, IsOptional} from "class-validator";
import {ValidLanguage} from "./validators/language-validator"


export class CreateLinkDTO{
    @IsUrl({
        require_protocol: true,
        require_valid_protocol: true,
        require_host: true,
        require_tld: true
    })
    @IsNotEmpty()
    url: string;
    
    @IsNotEmpty()
    title: string;
    
    @Validate(ValidLanguage)
    @IsNotEmpty()
    language: string;
    
    @IsOptional()
    @IsNotEmpty()
    description?: string;

    @IsOptional()
    @IsUrl({
        require_valid_protocol: true,
        require_host: true,
        require_tld: true
    })
    imageLink?: string;


}
