import { Controller, Get, Param, Query } from "@nestjs/common"
import { LinksService } from "./links.service"

@Controller("links")
export class LinksController{
    constructor(private readonly linksService: LinksService){}
    
    @Get(':id')
    async getLinkById(@Param('id') id){
        return this.linksService.getLinkById(id)
    }

    @Get()
    async getLinks(@Query("order") order?, @Query("offset") offset?, @Query("limit") limit?){
        return this.linksService.getLinks({
            order: order,
            offset: offset,
            limit: limit
        })
    }
}