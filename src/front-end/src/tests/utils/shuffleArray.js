export function shuffleArray(array) {
    let arrayCopy = Object.assign([], array)
    for (let i = arrayCopy.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * i);
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }

    return arrayCopy
}