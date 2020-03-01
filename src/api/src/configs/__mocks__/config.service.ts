import { Injectable, Optional } from "@nestjs/common";
import { ConfigurationsInterface } from "../../interfaces/configurations.interface"

@Injectable()
export default class ConfigurationService{
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
        API_APPLICATION_PORT: {
            name: "applicationPort",
            type: "number",
            default: 3000
        }
    }

    constructor(
        @Optional() environment:string = "production",
        @Optional() pathToDevelopmentJSON:string = "config.development.json",
        @Optional() pathToProductionJSON:string = "config.production.json"
    ){
        this.environment = environment
        this.pathToDevelopmentJSON = pathToDevelopmentJSON
        this.pathToProductionJSON = pathToProductionJSON
        let dbPort = parseInt(process.env.API_DATABASE_PORT) || 5432
        this.configurationFile = {
            "API_DATABASE_NAME": process.env.API_TEST_DATABASE_NAME || "continuous_learning_app_test_db",
            "API_DATABASE_HOST": process.env.API_DATABASE_HOST || "localhost",
            "API_DATABASE_PASSWORD": process.env.API_DATABASE_PASSWORD,
            "API_DATABASE_PORT": parseInt(process.env.API_DATABASE_PORT) || 5432,
            "API_DATABASE_USER": process.env.API_DATABASE_USER,
            "API_APPLICATION_URL": "http://localhost",
            "API_APPLICATION_PORT": 3000
        }

        this.environmentConfigurations = {
            ...this.configurationFile,
            "API_APPLICATION_PORT": "3000",
            "API_DATABASE_PORT": `${dbPort}`

            
        }

        this.configs = ConfigurationService.parseIntoApplicationConfigs(
            "production",
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
        return this.environmentConfigurations
    }

    public static parseIntoApplicationConfigs(
        environment: string,
        fileConfig: object, 
        envConfig: object
    ): ConfigurationsInterface {
        return {
            databaseHost: fileConfig["API_DATABASE_HOST"],
            databaseUser: fileConfig["API_DATABASE_USER"],
            databasePassword: fileConfig["API_DATABASE_PASSWORD"],
            databasePort: fileConfig["API_DATABASE_PORT"],
            databaseName: fileConfig["API_DATABASE_NAME"],
            applicationPort: fileConfig["API_APPLICATION_PORT"],
            applicationURL: fileConfig["API_APPLICATION_URL"]
        }
    }

}