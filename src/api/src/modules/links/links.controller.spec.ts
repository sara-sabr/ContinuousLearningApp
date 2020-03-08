import { Test } from "@nestjs/testing"
import { LinksController } from  "./links.controller"
import { LinksService } from "./links.service"
import DatabaseService from "../../database/database.service"
import { mocked } from "ts-jest/utils"

jest.mock("../../database/database.service")

const mockedDatabaseService = mocked(DatabaseService, true)

describe( "LinksController", () => {
    let linksController: LinksController;
    let LinksService: LinksService;
})