
import { Injectable } from "@nestjs/common";
import ConfigurationService from "../configs/config.service"
import { DatabaseOperations } from "./db";
import {ClientConfig, QueryResult, QueryResultRow } from "pg";
import { Link } from "../interfaces/data"
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
        
        return this.updateLinkByField(
            "id", id, "integer", updates
        )
    }

    async updateLinkByURL(
        url: string,
        updates: Pick<Partial<Link>, 'title' | 'description' | 'imageLink' | 'language'>
    ): Promise<Link> {
        return this.updateLinkByField(
            "url", url, "text", updates
        )
    }

    async deleteLinkById(
        id: number
    ){
        try{
            await this.db.query(
                "DELETE FROM links WHERE id = $1::integer",
                [
                    id
                ]
            )
        }catch(e){
            throw new DatabaseError(e.message)
        }
    }

    async deleteLinkByURL(
        url: string
    ){
        try {
            await this.db.query(
                "DELETE FROM links WHERE url = $1::text",
                [
                    url
                ]
            )
        }catch(e){
            throw new DatabaseError(e.message)
        }
    }

    async searchLinks(
        searchText: string,
        language: string
    ): Promise<Link[]> {
        if (language !== "en" && language !== "fr"){
            throw new Error(
                `Invalid language '${language}', language must be either 'en' or 'fr'`
            )
        }
        try{

            let result = await this.db.query(
                "SELECT * FROM links WHERE language = $1::text AND " +
                "ftx_data @@ websearch_to_tsquery($1::regconfig, $2::text)",
                [
                    language,
                    searchText
                ]
            )
    
            let resultsToReturn: Link[] = []
            for (let row in result.rows){
                resultsToReturn.push(
                    this.parseRowIntoLink(
                        result.rows[row]
                    )
                )
            }
            return resultsToReturn

        }catch(e){
            throw new DatabaseError(e.message)
        }
        
    }


    private async updateLinkByField(
        field: string,
        fieldValue: any, 
        type: string, 
        updates: Pick<Partial<Link>, 'title' | 'description' | 'imageLink' | 'language'>
    ): Promise<Link> {
        let result: QueryResult
        try {
            let query = "UPDATE links SET "
            let prevExists = false
            if (updates.title){
                query += `title = '${updates.title}'::text`
                prevExists = true
            }
            if(updates.description){
                if (prevExists) {
                    query += ", "
                }
                query += `description = '${updates.description}'::text`
                prevExists = true
            }
            if (updates.imageLink){
                if (prevExists){
                    query += ", "
                }
                query += `image_link = '${updates.imageLink}'::text`
                prevExists = true
            } 
            if (updates.language){
                if (prevExists){
                    query += ", "
                }
                query += `language = '${updates.language}'::text`
                prevExists = true
            }

            query += ` WHERE  ${field}= $1::${type} RETURNING *`
            result = await this.db.query(
                query,
                [
                    fieldValue
                ]
            )
        }catch(e){
            throw new DatabaseError(e.message)
            
        }
        if (!result || result.rowCount === 0 ){
            throw new NoDataFound(
                `link cannot be found for ${field} ${fieldValue}`
            )
        }
        return this.parseRowIntoLink(
            result.rows[0]
        )

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