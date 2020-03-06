import { Injectable } from "@nestjs/common";
import ConfigurationService from "../../configs/config.service"
import { Link } from "../../interfaces/data"
import { link } from "fs";

@Injectable()
export default class DatabaseService {
    constructor(private readonly configService: ConfigurationService){
        let config = configService.getApplicationConfigs()
    }

    async createLink(link: Link): Promise<number> {
        return Math.floor((Math.random() * 10) + 1)
    }

    async readLinkById(id: number): Promise<Link>{
        return {
            id: id,
            url: "https://testing.com",
            language: "en",
            title: "a testing site",
            description: "This site has lots of testing examples",
            imageLink: "https://testing.com/thisismyimage.png",
            createdOn: new Date(Date.now()),
            updatedOn: new Date(Date.now() + 1)
        }
    }

    async readLinkByURL(url: string): Promise<Link> {
        return {
            id: Math.floor((Math.random() * 10) + 1),
            url: url,
            language: "en",
            title: "some title",
            description: "some excellent description",
            imageLink: url + "/apicture.png",
            createdOn: new Date(Date.now()),
            updatedOn: new Date(Date.now() + 1)
        }
    }

    async readLinks(options?:  {
        order?: string;
        limit?: number;
        offset?: number;
    }): Promise<Link[]>{
        if (options && options["order"] && options["order"] !== "desc" && options["order"] !== "asc"){
            throw new Error(
                "order must have value of either asc or desc"
            )
        }
        let numberOfItems: number = 20
        if (options && options["limit"]){
            numberOfItems = options["limit"]
        }
        let langArray = ["en", "fr"]
        let links: Link[] = []
        for (let i = 0; i < numberOfItems; i ++){
            links.push(
                {
                    id: Math.floor((Math.random() * 10) + 1),
                    url: "http://" + Math.random().toString(32).substr(2) + ".com",
                    language: langArray[Math.round(Math.random() * 2)],
                    title: Math.random().toString(32).substr(2),
                    description: Math.random().toString(32).substr(2) + Math.random().toString(32).substr(2),
                    imageLink: "http://" + Math.random().toString(32).substr(2) + ".com/picture.png",
                    createdOn: new Date(Date.now()),
                    updatedOn: new Date(Date.now() + 1)
                }
            )
        }

        return links

    }
}