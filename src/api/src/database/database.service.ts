
import { Injectable, NotImplementedException } from "@nestjs/common";
import ConfigurationService from "../configs/config.service"
import { DatabaseOperations } from "./db";
import {ClientConfig, QueryResult } from "pg";
import {Link, Category, Action, Log } from "../interfaces/data"
import {DatabaseError, NoDataFound} from "../utils/errors"



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
        try {
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
        catch(e){
            throw new DatabaseError(e.message)
        }
    }

    async readLinkById(id: number ): Promise<Link>{
        let result: QueryResult
        try {
            result = await this.db.query(
                "SELECT * FROM LINKS WHERE id = $1::integer",
                [
                    id
                ]
            )

        }
        catch(e){
            throw new DatabaseError(e.message)
        }

        if (result.rowCount === 0){
            throw new NoDataFound(
                `No links found for id ${id}`
            )
        }

        return {
            id: result.rows[0]["id"],
            url: result.rows[0]["url"],
            language: result.rows[0]["language"],
            title: result.rows[0]["title"],
            description: result.rows[0]["description"],
            imageLink: result.rows[0]["image_link"],
            createdOn: result.rows[0]["created_on"],
            updatedOn: result.rows[0]["updated_on"]
        }
        

    }

}