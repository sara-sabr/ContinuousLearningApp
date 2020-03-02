import * as category from "./category.interface"

export interface Link{
    id?: number,
    url: string,
    language: string,
    title: string,
    imageLink?: string,
    description?: string,
    createdOn?: Date,
    updatedOn?: Date,
    categories?: category.Category[]
}