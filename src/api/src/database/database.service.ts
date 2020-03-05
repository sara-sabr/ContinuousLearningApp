
import { Injectable, NotImplementedException } from "@nestjs/common";
import ConfigurationService from "../configs/config.service"
import { DatabaseOperations } from "./db";
import {ClientConfig, QueryResult, QueryResultRow } from "pg";
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

        return this.parseRowIntoLink(result.rows[0])
        

    }

    async readLinkByURL(url: string): Promise<Link>{
        let result: QueryResult
        try{
            result = await this.db.query(
                "SELECT * FROM links WHERE url = $1::text",
                [
                    url
                ]
            )
        }catch(e){
            throw new DatabaseError(e.message)
        }

        if (result.rowCount === 0){
            throw new NoDataFound(
                `No links found for url ${url}`
            )
        }

        return this.parseRowIntoLink(result.rows[0])
    }

    async readLinks(options?: {
        order?: string;
        limit?: number;
        offset?: number
    }): Promise<Link[]>{

        if (options && options["order"] && options["order"] !== "desc" && options["order"] !== "asc"){
            throw new Error(
                "order must have value of either asc or desc"
            )
        }

        let result: QueryResult
        let links: Link[] = []
        try{
            let query: string
            if (options && options["order"] && options["order"] === "desc"){
                query = "SELECT * FROM links ORDER BY created_on DESC"
            }
            else{
                query = "SELECT * FROM links ORDER BY created_on ASC"  
            }

            if (options && options["limit"]){
                query += ` LIMIT ${options["limit"]}::integer`
            }

            if (options && options["offset"]){
                query += ` OFFSET ${options["offset"]}::integer`
            }

            result = await this.db.query( query )
        }catch(e){
            throw new DatabaseError(e.message)
        }

        if (result.rowCount > 0){
            for (let row in result.rows){
                let link = this.parseRowIntoLink(result.rows[row])
                links.push(link)
            }

        }
        return links
    }

    async updateLinkById(
        id: number, 
        updates : Pick<Partial<Link>, 'title' | 'description' | 'imageLink' | 'language'>
    ): Promise<Link>{
        try {
            let query = "UPDATE links SET "
            
            if (updates.title){
                query += `title = '${updates.title}'::text, `
            }
            if(updates.description){
                query += `description = '${updates.description}'::text, `
            }
            if (updates.imageLink){
                query += `image_link = '${updates.imageLink}'::text, `
            } 
            if (updates.language){
                query += `language = '${updates.language}'::text `
            }

            query += "WHERE id = $1::integer RETURNING *"

            let result = await this.db.query(
                query,
                [
                    id
                ]
            )
            
            if (result.rowCount > 0 ){
                return this.parseRowIntoLink(
                    result.rows[0]
                )
            }
        }catch(e){
            
        }
    }

    private parseRowIntoLink(data:QueryResultRow): Link {
        return{
            id: data["id"],
            url: data["url"],
            language: data["language"],
            title: data["title"],
            description: data["description"],
            imageLink: data["image_link"],
            createdOn: data["created_on"],
            updatedOn: data["updated_on"]
        }
    }

}