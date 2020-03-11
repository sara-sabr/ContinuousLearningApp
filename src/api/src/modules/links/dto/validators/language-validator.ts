import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments
} from "class-validator" 


@ValidatorConstraint({name: "validLanguage", async: false})
export class ValidLanguage implements ValidatorConstraintInterface{
    validate(text: string, args: ValidationArguments){
        return text === "en" || text === "fr"
    }

    defaultMessage(args: ValidationArguments){
        return "language ($value) is not valid. " +
        "language must have a value of 'en' or 'fr'"
    }
}