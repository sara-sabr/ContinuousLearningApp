
import { Injectable, NotImplementedException } from "@nestjs/common";
import ConfigurationService from "../configs/config.service"
import { DatabaseOperations } from "./db";
import {ClientConfig } from "pg";
import {Link, Category, Action, Log } from "../interfaces/data"



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

    async createLink(link: Link): Promise<number>{
        let results = await this.db.query(
            "INSERT INTO links " + 
            "(url, language, title, description, image_link) " +
            "VALUES" +
            "($1::text, $2::text, $3::text, $4::text, $5::text) " + 
            "RETURNING id"
            ,
            [
                link.url,
                link.language,
                link.title,
                link.description,
                link.imageLink
            ]
        )

        return results.rows[0]["id"]
    }

    async readLinkById(filter: {
        id: number,
        limit?: number,
        offset?: number,
        orderBy?: string 
    }){
     throw new NotImplementedException()   
    }

}