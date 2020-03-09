import { Module } from "@nestjs/common"
import { LinksController } from "./links.controller"
import { LinksService } from "./links.service"

@Module({
    providers: [LinksService],
    controllers: [LinksController]
})
export class LinksModule{}