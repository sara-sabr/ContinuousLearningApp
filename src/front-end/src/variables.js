export let apiURL
export let environment = process.env.NODE_ENV

if(environment === "development"){
    apiURL = process.env.REACT_APP_API_URL || "http://localhost:4000/api"
}
else{
    apiURL = process.env.REACT_APP_API_URL || "/api"
}