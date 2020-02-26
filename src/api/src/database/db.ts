import { Client, ClientConfig } from "pg";
import * as fs from "fs";
import * as path from "path" 


export class DatabaseOperations{
    private client: Client
    private configs: ClientConfig
    constructor( configs: ClientConfig){
        this.configs = configs
        this.client = new Client(
            configs
        )
    }

    /**
     * Construct ddl script from ddl sql files 
     * @param path_to_ddl_folder the path to the folder containing the sql files
     * @param ddl_order  optional string array containing the order of how the files should be concatinated,
     files present in the ddl folder but not in this array will just be concatinated at the end 
     */
    public static load_ddl(
        path_to_ddl_folder: string, 
        ddl_order: string[] = [
            "full_text_search",
            "functions",
            "tables",
            "triggers",
            "indexes"
        ]
    ): string {
        const filesAtPath: string[] = fs.readdirSync(
            path_to_ddl_folder
        )
        let extractedFiles  = {}
        let ddl = ""
        for (let file in filesAtPath){
            let fileName = filesAtPath[file]
            if ( fileName.endsWith(".sql")){
                extractedFiles[fileName.replace(".sql", "")] = fs.readFileSync(
                    path.join(path_to_ddl_folder, fileName),
                    {
                        encoding: "utf8"
                    }
                )
            }
        }

        for ( let order in ddl_order ){
            let data = extractedFiles[ddl_order[order]]
            if (typeof data === "string"){
                ddl += data + "\n"
            }
            else{
                throw new Error(
                    "Could not find file: " + ddl_order[order] 
                )
            }
        }

        return ddl
    }

    async createDatabaseSchema(ddl_string: string){
        await this.client.connect()
        try {
            await this.client.query({
                text: ddl_string
            })
            await this.endClient()
        }
        catch(err){
            console.error("Failed to create schema with the following ddl \n " + ddl_string)
            throw err
        }
    }

    async destroyDatabaseSchema(){
        await this.client.connect()

        try {
            await this.client.query({
                text: `
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                `
            })
            await this.endClient()
        }
        catch(err){
            await this.client.end()
            throw err
        }
    }

    getClient(): Client{
        return this.client
    }

    async endClient(){
        await this.client.end()
        this.client = new Client(this.configs)
    }

}