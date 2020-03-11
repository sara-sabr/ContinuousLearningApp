import { Injectable, HttpException, HttpStatus} from "@nestjs/common"
import DatabaseService from "../../database/database.service"
import { ReturnedLinkDTO } from "./dto/returned-link.dto"
import { CreateLinkDTO } from "./dto/create-link.dto"
import { Link } from "../../interfaces/data"
import { DatabaseError, NoDataFound } from "../../utils/errors"


@Injectable()
export class LinksService{
    constructor(private readonly databaseService: DatabaseService){

    }
    
    async getLinkById(id: string): Promise<ReturnedLinkDTO> {
        let parsedId = parseInt(id)
        if (isNaN(parsedId) || parsedId < 1){
            throw new HttpException(
                "Bad request: id must be a number 1 or greater",
                HttpStatus.BAD_REQUEST
            )
        }

        try{
            let dbResult = await this.databaseService.readLinkById(parsedId)
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
        order?: string,
        offset?: string,
        limit?: string
    }): Promise<ReturnedLinkDTO[]>{
        // we recieve all arguments as string 
        // make sure that offset and limit are numbers
        let parsedOptions: {
            order? : string,
            offset?: number,
            limit?: number
        } = {}
        if (options && options["order"]){
            parsedOptions.order = options.order
        }
        
        if (options && options["offset"]){
            let parsedOffset = parseInt(options.offset) 
            if (isNaN(parsedOffset) || parsedOffset < 0){
                throw new HttpException(
                    "Bad request: offset should be a number 0 or greater",
                    HttpStatus.BAD_REQUEST
                )
            }
            parsedOptions.offset = parsedOffset
        }

        if(options && options["limit"]){
            let parsedLimit = parseInt(options.limit)
            if(isNaN(parsedLimit) || parsedLimit < 0){
                throw new HttpException(
                    "Bad request: limit should be a number 0 or greater",
                    HttpStatus.BAD_REQUEST
                )
            }
            parsedOptions.limit = parsedLimit
        }

        try{
            let dbResult = await this.databaseService.readLinks(parsedOptions)
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

            throw new HttpException(
                "An unknown error has occured",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
    
    
    async createLink(createLinkDTO: CreateLinkDTO){
        try {
            let link = {
                ...createLinkDTO
            }
            return {
                id: await this.databaseService.createLink(link)
            }
        }catch(e){
            if (e instanceof DatabaseError){
                throw new HttpException(
                    "A database error has occured: " + e.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }

            throw new HttpException(
                "An unknown error has occured",
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

      

    getDatabaseService(){
        return this.databaseService
    }
}