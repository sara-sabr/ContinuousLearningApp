

export class DatabaseError extends Error {
    constructor(...args){
        super(...args)
        Error.captureStackTrace(this, DatabaseError)
    }
}


export class NoDataFound extends Error {
    constructor(...args){
        super(...args)
        Error.captureStackTrace(this, NoDataFound)
    }
}