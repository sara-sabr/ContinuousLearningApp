import * as action from "./action.interface"

export interface Log {
    id?: number,
    link?: string,
    category?: string,
    createdOn?: Date,
    action?: action.Action
}