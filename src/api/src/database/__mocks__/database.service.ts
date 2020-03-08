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
            createdOn: new Date(Date.now() - 1),
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
            createdOn: new Date(Date.now() - 1),
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
                    createdOn: new Date(Date.now() - 1),
                    updatedOn: new Date(Date.now() + 1)
                }
            )
        }

        return links
    }

    async updateLinkById(
        id: number,
        updates : Pick<Partial<Link>, 'title' | 'description' | 'imageLink' | 'language'>
    ): Promise<Link> {
        return {
            id: id,
            title: updates.title || "some title",
            url: "http://someurl.com",
            language: updates.language || "en",
            description: updates.description || "some descriptive description",
            imageLink: "http://someurl.com/thisisanimage.png",
            createdOn: new Date(Date.now() - 1),
            updatedOn: new Date(Date.now() + 1)
        }
    }

    async updateLinkByURL(
        url: string,
        updates : Pick<Partial<Link>, 'title' | 'description' | 'imageLink' | 'language'>
    ): Promise<Link> {
        return {
            id: Math.floor((Math.random() * 10) + 1) ,
            title: updates.title || "some title",
            url: url,
            language: updates.language || "en",
            description: updates.description || "some descriptive description",
            imageLink: "http://someurl.com/thisisanimage.png",
            createdOn: new Date(Date.now() - 1),
            updatedOn: new Date(Date.now() + 1)
        }
    }

    async deleteLinkById(
        id: number
    ){}

    async deleteLinkByURL(
        url: string
    ){}

    async searchLinks(
        searchText: string,
        language: string 
    ):Promise<Link[]> {

        let numberOfItems: number = Math.floor((Math.random() * 5) + 1)
        let langArray = ["en", "fr"]
        let links: Link[] = []
        for (let i = 0; i < numberOfItems; i ++){
            links.push(
                {
                    id: Math.floor((Math.random() * 10) + 1),
                    url: "http://" + Math.random().toString(32).substr(2) + ".com",
                    language: language,
                    title: Math.random().toString(32).substr(2),
                    description: Math.random().toString(32).substr(2) + Math.random().toString(32).substr(2),
                    imageLink: "http://" + Math.random().toString(32).substr(2) + ".com/picture.png",
                    createdOn: new Date(Date.now() - 1),
                    updatedOn: new Date(Date.now() + 1)
                }
            )
        }
        return links
    }

}