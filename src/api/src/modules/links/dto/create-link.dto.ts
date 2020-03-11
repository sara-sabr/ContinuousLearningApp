import {IsUrl, IsNotEmpty, Validate, IsOptional} from "class-validator";
import {ValidLanguage} from "./validators/language-validator"


export class CreateLinkDTO{
    @IsUrl()
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
    @IsUrl()
    imageLink?: string;


}
