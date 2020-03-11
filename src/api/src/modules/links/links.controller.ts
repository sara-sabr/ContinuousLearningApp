import { Controller, Get, Param, Query, ValidationPipe, UsePipes, Post, Body} from "@nestjs/common"
import {
    ApiQuery, 
    ApiResponse, 
    ApiBadRequestResponse, 
    ApiInternalServerErrorResponse,
    ApiOperation,
    ApiParam,
    ApiNotFoundResponse
    
} from "@nestjs/swagger"
import {ReturnedLinkDTO} from "./dto/returned-link.dto"
import {CreateLinkDTO} from "./dto/create-link.dto"
import { LinksService } from "./links.service"
import { type } from "os"

@Controller("links")
export class LinksController{
    constructor(private readonly linksService: LinksService){}
    
    @Get(':id')
    @ApiOperation({
        tags: ["links"],
        description: "Only want one link and want to grab it by its id ? "+
        "Tomato your wish is some good potato ( potato being the resource ) 🧞‍♂️"
    })
    @ApiParam({
        name: "id",
        type: "number",
        required: true,
        allowEmptyValue: false,
        description: "The id of dat link you want to grab",
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: "How does it feel to win? Well you didn't win the lottery " +
        "but, who knows, you just recieved a link that could change your life!",
        type: ReturnedLinkDTO
    })
    @ApiBadRequestResponse({
        status: 400,
        description: "Wanna check your id to make sure its a number one more time? " +
        "You should, cause you're not getting a single link until you do and thats a fact!"
    })
    @ApiNotFoundResponse({
        status: 404,
        description: "They say seek and ye shall find. Not this time. Why you ask ? " +
        "Simple, it doesn't exist !"
    })
    @ApiInternalServerErrorResponse({
        status: 500,
        description: "I TOLD YOU TO CHECK... wait... what do you mean this is our fault" +
        ".... one second please .... john this can't be our fault its a pretty simple route... " +
        "check the status code ? ..... oh.... well this is akward. Sorry about that, " +
        "we messed up here, totally not your fault... john we're gonna edit this in POST right ? "
    })
    async getLinkById(@Param('id') id){
        return this.linksService.getLinkById(id)
    }

    @Get()
    @ApiOperation({
        description: "A route for you to get all the links 🔥!",
        tags: ["links"]
    })
    @ApiQuery({
        name: "limit", 
        type: "number", 
        required: false,
        description: "limit the ammount the rows to return. " +
        "Must be a number greater or equal to 0 (although what is the point of 0 rows)",
        example: 5 
    })
    @ApiQuery({
        name: "offset", 
        type: "number", 
        required: false,
        description: "Where do you want to start returning from. " +
        "For example if you set an offset of 5, you will recieve " +
        "rows from the 5th row and onwards",
        example: 5
    })
    @ApiQuery({
        name: "order", 
        type: "string", 
        required: false,
        enum: ["desc", "asc"],
        description: "The order in which you want to return the rows based " +
        "on the createdOn data field. Note the calculation of the order comes " +
        "before the calculation of the limit and offset"
    })
    @ApiResponse({
        status: 200, 
        description: "You have successfully made the request! Hurray you 🎉", 
        type: ReturnedLinkDTO
    })
    @ApiBadRequestResponse({
        description: "Gah 😨. You have sent bad query! Check your GET query parameters maybe ?"
    })
    @ApiInternalServerErrorResponse({
        description: "We have failed you 😔. We're so sorry about that"
    })
    async getLinks(@Query("order") order?, @Query("offset") offset?, @Query("limit") limit?){
        return this.linksService.getLinks({
            order: order,
            offset: offset,
            limit: limit
        })
    }

    @Post()
    @UsePipes( new ValidationPipe())
    async createLink(@Body() createLinkDTO: CreateLinkDTO){
        return await this.linksService.createLink(createLinkDTO)
    }
}