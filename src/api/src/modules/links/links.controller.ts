import { Controller, Get, Param } from "@nestjs/common"
import { LinksService } from "./links.service"

@Controller("links")
export class LinksController{
    constructor(private readonly linksService: LinksService){}
    @Get(':id')
    async getLinkById(@Param('id') id){
        let idNum = parseInt(id)
        return this.linksService.getLinkById(idNum)
    }
}