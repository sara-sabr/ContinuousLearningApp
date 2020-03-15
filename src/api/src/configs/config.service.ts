import { Injectable, Optional } from "@nestjs/common";
import * as fs from "fs"
import * as path from "path"
import {ConfigurationsInterface} from "../interfaces/configurations.interface"


@Injectable()
export default class ConfigurationService {
    private configs: ConfigurationsInterface
    private environment: string
    private pathToDevelopmentJSON: string
    private pathToProductionJSON: string
    private configurationFile: object 
    private environmentConfigurations: object

    public static readonly configurationMap = {
        API_DATABASE_NAME : {
           name: "databaseName",
           type: "string",
           default: {
               development: "continuous_learning_app"
           }
        },
        API_DATABASE_HOST: {
            name: "databaseHost",
            type: "string",
            default: {
                development: "localhost"
            }
        },
        API_DATABASE_PORT: {
            name: "databasePort",
            type: "number",
            default: 5432
        },
        API_DATABASE_USER: {
            name: "databaseUser",
            type: "string",
            default: {
                development: "postgres"
            }
        },
        API_DATABASE_PASSWORD: {
            name: "databasePassword",
            type: "string",
            default: {
                development: "postgres"
            }
        },
        API_APPLICATION_URL: {
            name: "applicationURL",
            type: "string",
            default: "http://localhost"
        },
        API_APPLICATION_GLOBAL_PREFIX: {
            name: "applicationPrefix",
            type: "string",
            default: "api"
        },
        API_APPLICATION_PORT: {
            name: "applicationPort",
            type: "number",
            default: 4000
        }
    }

    constructor(
       @Optional() environment:string = process.env.NODE_ENV,
       @Optional() pathToDevelopmentJSON:string = path.join(__dirname.replace(__filename, ""), "config.development.json"),
       @Optional() pathToProductionJSON:string = path.join(__dirname.replace(__filename, ""), "config.production.json")
    ){
        environment = environment || "production"
        this.environment = environment
        this.pathToDevelopmentJSON = pathToDevelopmentJSON
        this.pathToProductionJSON = pathToProductionJSON

        if (environment === "development"){
            if (fs.existsSync(this.pathToDevelopmentJSON)){
                try{
                    this.configurationFile = JSON.parse(
                        fs.readFileSync(
                            pathToDevelopmentJSON,
                            {
                                encoding: "utf8"
                            }
                        )
                    )
                }
                catch(e){
                    this.configurationFile = {}
                }
            }
        }

        else if (environment === "production"){
            if (fs.existsSync(this.pathToProductionJSON)){
                try{
                    this.configurationFile = JSON.parse(
                        fs.readFileSync(
                            pathToProductionJSON,
                            {
                                encoding: "utf8"
                            }
                        )
                    ) 
                }
                catch(e){
                    console.error("failed to parse production configuration file")
                    throw e
                }
                
            }
        }

        this.environmentConfigurations = this.extractEnvironmentVariables()
        this.configs = ConfigurationService.parseIntoApplicationConfigs(
            this.environment,
            this.configurationFile,
            this.environmentConfigurations
        )    
    }

    getFileConfig():object {
        return this.configurationFile
    }

    getEnvConfig():object {
        return this.environmentConfigurations 
    }

    getApplicationConfigs(): ConfigurationsInterface{
        return this.configs
    }

    getEnvironmentName(): string {
        return this.environment
    }

    private extractEnvironmentVariables(): object{
        let environmentVars = {}
        for ( const key in process.env){
            if(key.startsWith("API")){
                environmentVars[key] = process.env[key]
            }
        }
        return environmentVars
    }

    public static parseIntoApplicationConfigs(
        environment: string,
        fileConfig: object, 
        envConfig: object
    ): ConfigurationsInterface{
        const configMap = ConfigurationService.configurationMap
        let appConfigs: ConfigurationsInterface = {} 
        for (let application_key in configMap){
            let variableName = configMap[application_key]["name"]
            if (variableName) {
                let variableType = configMap[application_key]["type"]
                if(! variableType){
                    throw new Error(
                        `${application_key} does not have a type in the configuration map`
                    )
                }
                
                let fileValue = fileConfig[application_key]
                let envValue = envConfig[application_key]
                let defaultValue = configMap[application_key].default

                if ( typeof defaultValue === "object" ){
                    if ( defaultValue[environment] ) {
                        defaultValue = defaultValue[environment]
                    }
                    else {
                        defaultValue = undefined
                    }
                }

                if (envValue){
                    if (variableType === "number"){
                        let parsedNumber = parseInt(envValue)
                        if(isNaN(parsedNumber)){
                            throw new Error(
                                `Could not parse number value from ${application_key}`
                            )
                        }
                        appConfigs[variableName] = parsedNumber
                    }
                    else{
                        appConfigs[variableName] = envValue
                    }
                }
                else if (fileValue){
                    if ( variableType === "number"){
                        if (typeof fileValue !== "number"){
                            throw new Error(
                                `Type must be number for ${application_key}`
                            )
                        }
                        appConfigs[variableName] = fileValue
                    }
                    else {
                        if (typeof fileValue !== "string"){
                            throw new Error(
                                `Type must be string for ${application_key}`
                            )
                        }
                        appConfigs[variableName] = fileValue
                    }
                }

                else if (defaultValue) {
                    appConfigs[variableName] = defaultValue
                }
                else {
                    throw new Error(
                        `Could not find value for variable ${application_key}` 
                    )
                }

            }
        }
        return appConfigs
    }
}