import { putData, getData } from "./database.js"

/*
Database structure

- gameLobbies
    - lobbyName
        - ...
        - threads
            - thread1
                - author (userId of the person that draws this picture)
                - prompt (If it is the first drawing, this would be the original prompt;
                    otherwise, this is the "guess" of the previous drawing)
                - drawing (data of the drawing in json form)
                - guess (what this player thinks the prompt is;
                    if it is the first drawing, this should be the same as "prompt")
                - nextDrawing (the drawing made by the next player after seeing the drawing above)
                    - author
                    - prompt
                    - ...
                    - nextDrawing
                        - ...
            - thread2
                - ...
            - ...

*/



// The function threadPull returns an array of 'class Drawing'
// Each Drawing instance represents a drawing in the database
class Drawing {
    constructor(author, drawing, prompt, guess) {
        this.author = author
        this.drawing = drawing
        this.prompt = prompt
        this.guess = guess
    }

    toString() {
        return this.author+' '+this.prompt+' '+this.guess
    }
}

// make sure you run this first before doing any other thread operations
async function threadCreate(lobby, threadName) {
    await putData('gameLobbies/'+lobby+'/threads/'+threadName, 0)
    return
}

// upload a drawing to database
// all the inputs should be string, except for "prompt"
// if you want to upload the first drawing in a thread, input a "prompt" as a string; otherwise, "prompt" should always be integer 0
// this function will find the "guess" of the previous drawing (if it exists), and use that as the "prompt" of the current drawing
async function threadPush(lobby, threadName, userId, drawing, prompt, guess) {
    var directory = 'gameLobbies/'+lobby+'/threads/'+threadName
    var next = await getData(directory)
    var prev = directory
    var prevGuess = ''
    while (next != 0) {
        next = await getData(directory+'/nextDrawing')
        if (next == 0 && prompt == 0) {
            prev = directory+'/guess'
            prevGuess = await getData(prev)
        }
        directory += '/nextDrawing'
    }
    if (prompt == 0) {
        await putData(directory, {"author": userId, "drawing": drawing, "prompt": prevGuess, "guess": guess, "nextDrawing": 0})
    } else {
        await putData(directory, {"author": userId, "drawing": drawing, "prompt": prompt, "guess": guess, "nextDrawing": 0})
    }
    return
}

// retrieve all the drawings under a thread
// it returns an array of 'class Drawing' (see above definition)
// the order of this array will match the causal order of the drawings
// (i.e. array[0] will be the first drawing based on the original prompt, and array[len-1] will be the last one)
async function threadPull(lobby, threadName) {
    var result = []
    var directory = 'gameLobbies/'+lobby+'/threads/'+threadName
    var drawing = await getData(directory)
    var author = ''
    var picture = {}
    var prompt = ''
    var guess = ''
    while (drawing != 0) {
        author = await getData(directory+'/author')
        picture = await getData(directory+'/drawing')
        prompt = await getData(directory+'/prompt')
        guess = await getData(directory+'/guess')
        result.push(new Drawing(author, picture, prompt, guess))
        directory += '/nextDrawing'
        drawing = await getData(directory)
    }
    return result
}

export { threadCreate, threadPull, threadPush, Drawing };
