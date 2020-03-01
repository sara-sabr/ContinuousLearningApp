
import { Injectable } from "@nestjs/common";
import ConfigurationService from "../configs/config.service"
import { DatabaseOperations } from "./db";
import {ClientConfig } from "pg";



@Injectable()
export default class DatabaseService{
    private db: DatabaseOperations
    constructor(private readonly configService: ConfigurationService) {
        let configs = configService.getApplicationConfigs()
        let dbConfigs: ClientConfig = {
            database: configs.databaseName,
            host: configs.databaseHost,
            password: configs.databasePassword,
            user: configs.databaseUser,
            port: configs.databasePort
        }
        this.db = new DatabaseOperations(
            dbConfigs,
            true
        )
    }

    getDb():DatabaseOperations{
        return this.db
    }

    getConfigService():ConfigurationService{
        return this.configService
    }
}