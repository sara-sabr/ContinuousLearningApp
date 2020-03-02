import { Pool, Client, ClientConfig, PoolConfig, PoolClient, QueryResult } from "pg";
import * as fs from "fs";
import * as path from "path" 


export class DatabaseOperations{
    private client: Client 
    private pool: Pool
    private configs: ClientConfig
    private poolConfigs: PoolConfig
    private usePool: boolean
    constructor( configs: ClientConfig, usePool: boolean = false){
        this.configs = configs
        this.usePool = usePool
        if (usePool){
            this.poolConfigs = this.configs
            this.poolConfigs["max"] = 20
            this.poolConfigs["min"] = 4
            this.poolConfigs["idleTimeoutMillis"] = 10000
            this.poolConfigs["connectionTimeoutMillis"] = 0
            this.pool = new Pool(
                this.poolConfigs
            )

            // attempt to connect to db 
            this.getClient().then(
                (client) => {
                    this.endClient(client as PoolClient).then(
                        () => {
                            this.endPool().then(
                                () => {
                                    this.createPool()
                                }
                            )
                        }
                    )
                }
            )
        
        }
        else {
            this.client = new Client(
                configs
            )

            //attempt to connect to db
            this.client.connect().then(
                () => {
                    this.endClient()
                }
            )
        }
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
        let client = await this.getClient()
        if ( ! this.usePool){
            await client.connect()
        }
        try {
            await client.query({
                text: ddl_string
            })
            if ( ! this.usePool){
                await this.endClient()
            }
            else {
                await this.endClient(client as PoolClient)
            }
        }
        catch(err){
            console.error("Failed to create schema with the following ddl \n " + ddl_string)
            throw err
        }
    }

    async destroyDatabaseSchema(){
        let client = await this.getClient()
        if ( ! this.usePool){
            await client.connect()
        }
        try {
            await client.query({
                text: `
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                `
            })
            if ( ! this.usePool){
                await this.endClient()
            }
            else {
                await this.endClient(client as PoolClient)
            }
        }
        catch(err){
            if ( ! this.usePool){
                await this.endClient()
            }
            else {
                await this.endClient(client as PoolClient)
            }
            throw err
        }
    }

    async query(query: string, data?: Array<any> ): Promise<QueryResult<any>>{
        let  client = await this.getClient()
        if ( ! this.usePool ){
            await client.connect()
        }
        try{
            let results: QueryResult<any>
            if (data){
                results = await client.query(
                    query,
                    data
                )
            }
            else{
                results = await client.query(
                    query
                )
            }

            if( ! this.usePool ){
                await this.endClient()
            }
            else {
                await this.endClient(client as PoolClient)
            }
            return results
        }catch(err){
            if( ! this.usePool ){
                await this.endClient()
            }
            else {
                await this.endClient(client as PoolClient)
            }
            throw err
        }
    }

    async getClient(): Promise<Client | PoolClient>{
        if (this.usePool){
            let connectedClient = await this.pool.connect()
            return connectedClient
        }
        return this.client
    }

    async endClient(client?: PoolClient ){
        if (this.usePool){
            client.release()
        }
        else{
            await this.client.end()
            this.client = new Client(this.configs)
        }
    }

    async endPool(){
        await this.pool.end() 
    }

    createPool(){
        this.pool = new Pool(
            this.poolConfigs
        )
    }

    getConfigs():ClientConfig{
        return this.configs
    }

    usingPool():boolean{
        return this.usePool
    }

}