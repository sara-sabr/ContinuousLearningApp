import * as link from "./link.interface"

export interface Category{
    id?: number,
    title: string,
    language: string,
    description?: string,
    imageLink?: string,
    createdOn?: Date,
    updatedOn?: Date,
    links? : link.Link[]
}