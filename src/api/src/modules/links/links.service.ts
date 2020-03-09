import { Injectable, HttpException, HttpStatus} from "@nestjs/common"
import DatabaseService from "../../database/database.service"
import { ReturnedLinkDTO } from "./dto/returned-link.dto"
import { DatabaseError, NoDataFound } from "../../utils/errors"
import { Link } from "src/interfaces/data"

@Injectable()
export class LinksService{
    constructor(private readonly databaseService: DatabaseService){

    }
    
    async getLinkById(id: number): Promise<ReturnedLinkDTO> {
        try{
            let dbResult = await this.databaseService.readLinkById(id)
            let returnedData: ReturnedLinkDTO =  {
                id: dbResult.id,
                language: dbResult.language,
                url: dbResult.url,
                title: dbResult.title,
                ...dbResult,
                createdOn: dbResult.createdOn,
                updatedOn: dbResult.updatedOn
            }

            return returnedData
        }catch(e){
            if ( e instanceof DatabaseError){
                throw new HttpException(
                    "A database error has occured: " + e.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }
            if ( e instanceof NoDataFound ){
                throw new HttpException(
                    "Resource not found: " + e.message,
                    HttpStatus.NOT_FOUND
                )
            }
            throw new HttpException(
                "An unknown error has occured",
                HttpStatus.INTERNAL_SERVER_ERROR 
            )
        }
    }

    async getLinks(options?:{
        order?: string
    }): Promise<ReturnedLinkDTO[]>{
        try{
            let dbResult = await this.databaseService.readLinks(options)
            let returnedData: ReturnedLinkDTO[] = []
            for (let row in dbResult){
                returnedData.push(
                    {
                        id: dbResult[row].id,
                        language: dbResult[row].language,
                        url: dbResult[row].url,
                        title: dbResult[row].title,
                        ...dbResult[row],
                        createdOn: dbResult[row].createdOn,
                        updatedOn: dbResult[row].updatedOn
                    }
                )
            }

            return returnedData
        }catch(e){
            if (e.message === "order must have value of either asc or desc"){
                throw new HttpException(
                    "Bad request: " + e.message,
                    HttpStatus.BAD_REQUEST
                )
            }

            if( e instanceof DatabaseError ){
                throw new HttpException(
                    "A database error has occured: " + e.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }
        }
    } 

      

    getDatabaseService(){
        return this.databaseService
    }
}