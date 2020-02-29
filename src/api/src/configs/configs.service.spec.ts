
import * as path from "path";
import * as fs from "fs"
import ConfigurationService, {ConfigurationsInterface} from "./config.service"



describe( "ConfigurationService unit tests", () => {
    let configurationDevelopment = {
        "API_DATABASE_NAME": "development db name",
        "API_DATABASE_HOST": "development db host",
        "API_DATABASE_PORT": 5432,
        "API_DATABASE_USER": "postgres",
        "API_DATABASE_PASSWORD": "postgres",
    }
    let configurationProduction = {
        "API_DATABASE_NAME": "production db name",
        "API_DATABASE_HOST": "production db host",
        "API_DATABASE_PORT": 5432,
        "API_DATABASE_USER": "production user",
        "API_DATABASE_PASSWORD": "production password"
    }
    const MOCK_FILE_INFO = {}
    MOCK_FILE_INFO[
        path.join(__dirname.replace(__filename, ""), 
        "config.development.json")] = configurationDevelopment.toString()
    MOCK_FILE_INFO[
        path.join(__dirname.replace(__filename, ""), 
        "config.production.json")
    ] = configurationProduction.toString()
    
    let fileSystemSpy: jest.SpyInstance
    let fileCheckerSpy: jest.SpyInstance

    beforeEach(() => {
        
        fileSystemSpy = jest.spyOn(fs, "readFileSync")
        fileCheckerSpy = jest.spyOn(fs, "existsSync")
        fileCheckerSpy.mockImplementation(
            (path: string) => {
                return path.includes("config.production.json") || path.includes("config.development.json")
            }
        )
        fileSystemSpy.mockImplementation(
            (path: string, options?:{
                encoding?: null;
                flag?: string;
            }) => {
                if (path.includes("config.production.json")){
                    return JSON.stringify(configurationProduction)
                }
                else if (path.includes("config.development.json")){
                    return JSON.stringify(configurationDevelopment)
                }
                return ""
            }
        ) 
    })
    describe("development environment", () => {
        beforeAll(() => {
            process.env.NODE_ENV = "development"
        })
        describe("constructor tests", () => {
            let parseFunction: jest.SpyInstance
            beforeAll(() => {
                parseFunction = jest.spyOn(ConfigurationService, "parseIntoApplicationConfigs")
                parseFunction.mockImplementation(
                    (fileConfig: object, envConfig: object) => {
                        return {
                            databaseHost: "hello",
                            databaseName: "hello",
                            databasePassword: "hello",
                            databasePort: 5432,
                            databaseUser: "hi",
                            applicationURL: "hello",
                            applicationPort: 7000
                        }
                    }
                )
            })
    
            it("reads development configuration", () => {
                new ConfigurationService()
                expect(fileCheckerSpy.mock.calls.length).toBe(1)
                expect(fileSystemSpy.mock.calls.length).toBe(1)
                expect(fileSystemSpy.mock.results[0]["value"]).toBe(JSON.stringify(
                    configurationDevelopment
                ))
            })
    
            it("assigns development config to configurationFile variable", () => {
                let config_service = new ConfigurationService()
                expect(JSON.stringify(
                    config_service.getFileConfig()
                )).toBe(JSON.stringify(configurationDevelopment))
            })

            it("assigns NODE_ENV to environment variable", () => {
                let configService = new ConfigurationService()
                expect(configService.getEnvironmentName()).toBe(
                    process.env.NODE_ENV
                )
            })
            
            it("assigns parsed configs to configs variable", () => {
                parseFunction.mockRestore()

                let configService = new ConfigurationService()
                let expectedAppConfigs: ConfigurationsInterface = {
                    applicationURL: "http://localhost",
                    applicationPort: 3000,
                    databaseHost: configurationDevelopment.API_DATABASE_HOST,
                    databasePort: configurationDevelopment.API_DATABASE_PORT,
                    databaseName: configurationDevelopment.API_DATABASE_NAME,
                    databasePassword: configurationDevelopment.API_DATABASE_PASSWORD,
                    databaseUser: configurationDevelopment.API_DATABASE_USER
                }
                expect(configService.getApplicationConfigs()).toMatchObject(
                    expectedAppConfigs
                )
            })
    
            afterAll(() => {
                parseFunction.mockRestore()
            })
        })

        it("parses file configurations into application variables", () => {
            let appConfigs = ConfigurationService.parseIntoApplicationConfigs(
                process.env.NODE_ENV,
                configurationDevelopment,
                {}
            )
            let expectedApplicationConfigs: ConfigurationsInterface = {
                applicationURL: "http://localhost",
                applicationPort: 3000,
                databaseName: configurationDevelopment.API_DATABASE_NAME,
                databaseHost: configurationDevelopment.API_DATABASE_HOST,
                databasePort: configurationDevelopment.API_DATABASE_PORT,
                databasePassword: configurationDevelopment.API_DATABASE_PASSWORD,
                databaseUser: configurationDevelopment.API_DATABASE_USER
            }
            expect(appConfigs).toMatchObject(expectedApplicationConfigs)
            
        })

        it("parses environment configurations into application variables", () => {
            let appConfigs = ConfigurationService.parseIntoApplicationConfigs(
                process.env.NODE_ENV,
                {},
                configurationDevelopment
            )
            let expectedApplicationConfigs: ConfigurationsInterface = {
                applicationURL: "http://localhost",
                applicationPort: 3000,
                databaseName: configurationDevelopment.API_DATABASE_NAME,
                databaseHost: configurationDevelopment.API_DATABASE_HOST,
                databasePort: configurationDevelopment.API_DATABASE_PORT,
                databasePassword: configurationDevelopment.API_DATABASE_PASSWORD,
                databaseUser: configurationDevelopment.API_DATABASE_USER
            }

            expect(appConfigs).toMatchObject(expectedApplicationConfigs)
        })

        it("overrides file configurations with environment configurations", () => {
           let configurationDevelopmentDif = {
               ...configurationDevelopment,
               API_DATABASE_NAME: "overridden value"
           }
           let appConfigs = ConfigurationService.parseIntoApplicationConfigs(
               process.env.NODE_ENV,
               configurationDevelopment,
               configurationDevelopmentDif
           )

           let expectedApplicationConfigs: ConfigurationsInterface = {
               applicationURL: "http://localhost",
               applicationPort: 3000,
               databaseName: configurationDevelopmentDif.API_DATABASE_NAME,
               databaseHost: configurationDevelopment.API_DATABASE_HOST,
               databasePort: configurationDevelopment.API_DATABASE_PORT,
               databasePassword: configurationDevelopment.API_DATABASE_PASSWORD,
               databaseUser: configurationDevelopment.API_DATABASE_USER
           }

           expect(appConfigs).toMatchObject(expectedApplicationConfigs)

        })
        it("throws error on incorrect type in file configurations", () => {
            let configurationDevelopmentBadConfig = {
                ...configurationDevelopment,
                API_DATABASE_PORT: "5432"
            }

            expect(() => {ConfigurationService.parseIntoApplicationConfigs(
                process.env.NODE_ENV,
                configurationDevelopmentBadConfig,
                {}
            )}).toThrow("Type must be number for API_DATABASE_PORT")
        })

        it("tries to cast string into number for environment variable", () => {
            let configurationDevelopmentString = {
                ...configurationDevelopment,
                API_DATABASE_PORT: "5432"
            }

            let appConfigs = ConfigurationService.parseIntoApplicationConfigs(
                process.env.NODE_ENV,
                {},
                configurationDevelopmentString,
                
            )

            expect(appConfigs.databasePort).toBe(5432)

        })
        it("uses defaults for development environment", () => {
            let expectedAppConfigs: ConfigurationsInterface = {
                databaseName: "continuous_learning_app",
                databaseHost: "localhost",
                databasePort: 5432,
                databaseUser: "postgres",
                databasePassword: "postgres",
                applicationURL: "http://localhost",
                applicationPort: 3000
            }

            let appConfigs = ConfigurationService.parseIntoApplicationConfigs(
                process.env.NODE_ENV,
                {},
                {}
            )

            expect(appConfigs).toMatchObject(expectedAppConfigs)
        })

        afterAll(() => {
            delete process.env.NODE_ENV
        })
        
    })

    describe("production environment", () => {
        beforeAll(() => {
            process.env.NODE_ENV  = "production"
        })
        describe("constructor tests", () => {
            let parseFunction: jest.SpyInstance
            beforeAll(() => {
                parseFunction = jest.spyOn(ConfigurationService, "parseIntoApplicationConfigs")
                parseFunction.mockImplementation(
                    (environment: string, fileConfig: object, envConfig: object) => {
                        return {
                            databaseHost: "hello",
                            databaseName: "hello",
                            databasePassword: "hello",
                            databasePort: 5432,
                            databaseUser: "hi",
                            applicationURL: "hello",
                            applicationPort: 7000
                        }
                    }
                )
            })

            it("reads production configuration", () => {
                new ConfigurationService()
                expect(fileCheckerSpy.mock.calls.length).toBe(1)
                expect(fileSystemSpy.mock.calls.length).toBe(1)
                expect(fileSystemSpy.mock.results[0]["value"]).toBe(JSON.stringify(
                    configurationProduction
                ))
            })

            it("assigns production config to configurationFile variable", () => {
                let config_service = new ConfigurationService()
                expect(JSON.stringify(
                    config_service.getFileConfig()
                )).toBe(JSON.stringify(configurationProduction))
            })

            it("assigns NODE_ENV to environment variable", () => {
                let configService = new ConfigurationService()
                expect(configService.getEnvironmentName()).toBe(
                    process.env.NODE_ENV
                )
            })
            
            it("assigns parsed configs to configs variable", () => {
                parseFunction.mockRestore()

                let configService = new ConfigurationService()
                let expectedAppConfigs: ConfigurationsInterface = {
                    applicationURL: "http://localhost",
                    applicationPort: 3000,
                    databaseHost: configurationProduction.API_DATABASE_HOST,
                    databasePort: configurationProduction.API_DATABASE_PORT,
                    databaseName: configurationProduction.API_DATABASE_NAME,
                    databasePassword: configurationProduction.API_DATABASE_PASSWORD,
                    databaseUser: configurationProduction.API_DATABASE_USER
                }
                expect(configService.getApplicationConfigs()).toMatchObject(
                    expectedAppConfigs
                )
            })

            

            afterAll(() => {
                parseFunction.mockRestore()
            })
        })
        it("obtains environment variables and assigns to env variables", () => {
            const env_dict = {}
            let key_count = 0
            for (const key in process.env){
                if (key.startsWith("API")){
                    env_dict[key] = process.env[key]
                    key_count ++ 
                }
            }
    
            if (key_count === 0 ){
                process.env.API_SOME_KEY_1 = "some value"
                env_dict["API_SOME_KEY_1"] = "some value"
            }
    
            let config_service = new ConfigurationService()
    
            expect(
                JSON.stringify(
                    config_service.getEnvConfig()
                )
                ).toBe(JSON.stringify(
                    env_dict
                ))
    
        })

        it("fails to parse configuration on API_DATABASE_NAME not included", () =>{
            let configurationNoDatabaseName = {
                ...configurationProduction
            }
            delete configurationNoDatabaseName["API_DATABASE_NAME"]
    
            expect(
                () => {
                    ConfigurationService.parseIntoApplicationConfigs(
                        process.env.NODE_ENV,
                        configurationNoDatabaseName,
                        {}
                    )
                }
            ).toThrow("Could not find value for variable API_DATABASE_NAME")
        })
    
        it("fails to parse configuration on API_DATABASE_HOST not included", () => {
            let configurationNoDatabaseHost = {
                ...configurationProduction
            }
            delete configurationNoDatabaseHost["API_DATABASE_HOST"]
    
            expect (
                () => {
                    ConfigurationService.parseIntoApplicationConfigs(
                        process.env.NODE_ENV,
                        configurationNoDatabaseHost,
                        {}
                    )
                }
            ).toThrow("Could not find value for variable API_DATABASE_HOST")
        })
    
        it("has default value for API_DATABASE_PORT", () => {
            let configurationNoDatabasePort = {
                ...configurationProduction
            }
            delete configurationProduction["API_DATABASE_PORT"]
            
            let appConfigs = ConfigurationService.parseIntoApplicationConfigs(
                process.env.NODE_ENV,
                configurationNoDatabasePort,
                {}
            )
    
            expect(appConfigs.databasePort).toBe(5432)
        })

        it("fails to parse configuration on API_DATABASE_USER not included ", () => {
            let configurtaionNoDatabaseUser = {
                ...configurationProduction
            }
            delete configurtaionNoDatabaseUser["API_DATABASE_USER"]

            expect(
                () => {
                    ConfigurationService.parseIntoApplicationConfigs(
                        process.env.NODE_ENV,
                        configurtaionNoDatabaseUser,
                        {}
                    )
                }
            ).toThrow("Could not find value for variable API_DATABASE_USER")
        })

        it("fails to parse configuration on API_DATABASE_PASSWORD not included", () => {
            let  configurationNoDatabasePassword = {
                ...configurationProduction
            }

            delete configurationNoDatabasePassword["API_DATABASE_PASSWORD"]

            expect(
                () => {
                    ConfigurationService.parseIntoApplicationConfigs(
                        process.env.NODE_ENV,
                        configurationNoDatabasePassword,
                        {}
                    )
                }
            ).toThrow("Could not find value for variable API_DATABASE_PASSWORD")
        })
        
        afterAll(() => {
            delete process.env.NODE_ENV
        })
    })
    afterEach(() => {
        fileSystemSpy.mockRestore()
        fileCheckerSpy.mockRestore()
    })
})