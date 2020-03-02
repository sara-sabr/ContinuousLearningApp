import * as log from "./log.interface"

export interface Action {
    id?: number,
    actionName: string,
    description: string,
    createdOn?: Date,
    updatedOn?: Date,
    logs?: log.Log[]
}