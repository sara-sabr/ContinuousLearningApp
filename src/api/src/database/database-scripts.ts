import { DatabaseOperations } from "./db"
import {ClientConfig} from "pg"
import * as path from "path"


const valid_operations = ["create", "delete"]

let cmd_arguments = process.argv
if (cmd_arguments.length !== 3){
    console.error(
        "Insufficient arguments provided, you must provide a database operation " +
        "either create or delete" 
    )
    process.exit(1)
}
let db_operation = cmd_arguments[2].trim() 
if (valid_operations.indexOf(db_operation) === -1){
    console.error(
        `Operation ${db_operation} is invalid. Operation must be one of ${valid_operations.join(", ")}`
    )
}
let ddl_path = path.join(__dirname.replace(__filename, ""),"ddl")
let db_configs: ClientConfig = {
    user: process.env.API_DATABASE_USER,
    password: process.env.API_DATABASE_PASSWORD,
    host: process.env.API_DATABASE_HOST || "localhost",
    port: parseInt(process.env.API_DATABASE_PORT) || 5432,
    database: process.env.API_DATABASE_NAME || "continuous_learning_app",
}

let db_ops = new DatabaseOperations(db_configs)

if (db_operation === valid_operations[0]){
    console.log("creating database schema")
    let ddl = DatabaseOperations.load_ddl(ddl_path)
    db_ops.createDatabaseSchema(ddl).catch((error) => {
        console.log(error.stack)
        process.exit(1)
    })
    console.log("database schema created successfully")
}
else if (db_operation === valid_operations[1]){
    console.log("wiping database schema and data")
    db_ops.destroyDatabaseSchema().catch((error) => {
        console.log(error.stack)
        process.exit(1)
    })
}




