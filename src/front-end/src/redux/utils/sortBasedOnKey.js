export function sortBasedOnKey(data, key, order = "asc"){
    let keyMap = {}
    // create a map of the distinct values for the key provided
    for (let i in data){
        let keyValue = data[i][key]
        if(keyMap[keyValue]){
            keyMap[keyValue].push(
                data[i]
            )
        }
        else{
            keyMap[keyValue] = [data[i]]
        }
    }

    // sort keys of map based on order
    let sortedKeys
    if (order === "desc"){
        // inverse the sort to give a descending order 
        // by returning -1 when a ( the element that comes before ) 
        // is greater than b ( the element that comes after )
        sortedKeys = Object.keys(keyMap).sort(
            (a, b) => {
                if (a > b){
                    return -1
                }
                else if (a === b){
                    return 0
                }
                return 1 
            } 
        )
    }
    else{
        sortedKeys = Object.keys(keyMap).sort()
    }

    let sortedData = []

    // concat the arrays of data for each of the individual keys
    // to produce the sorted array of data 
    for(let i in sortedKeys){
        sortedData = [
            ...sortedData,
            ...keyMap[sortedKeys[i]]
        ]
    }
    return sortedData
}