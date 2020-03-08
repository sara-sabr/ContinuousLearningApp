import { Injectable, HttpException, HttpStatus} from "@nestjs/common"
import DatabaseService from "../../database/database.service"
import { ReturnedLinkDTO } from "./dto/returned-link.dto"

@Injectable()
export class LinksService{
    constructor(private readonly databaseService: DatabaseService){

    }

    async getLinkById(id: number): Promise<ReturnedLinkDTO> {
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
    }

      

    getDatabaseService(){
        return this.databaseService
    }
}