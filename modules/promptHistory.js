import { putData, getData } from "./database.js"

/* 
INPUT:
    lobby: string, name of the lobby
    playersNum: int, total number of players
    roundsNum: int, total number of rounds
OUTPUT:
    string (format: 'p1 -> p1.1 -> ... \np2 -> p2.1 ->...')
*/
async function getHistory(lobby, playersNum, roundsNum) {
    var path = 'gameLobbies/'+lobby+'/players/'
    var output = []
    var playerHistory = []
    for (var player = 0; player < playersNum; player++) {
        var currPlayer = player
        var prompt = ''
        for (var round = 1; round < (roundsNum + 1); round++) {
            currPlayer = (player + (2 * (round - 1))) % playersNum
            prompt = await getData(path+(currPlayer.toString())+'/previous_prompts/'+(round.toString()))
            playerHistory.push(prompt)
        }
        output.push(playerHistory)
        playerHistory = []
    }

    var outputString = ''
    for (var i = 0; i < output.length; i++) {
        var curr = output[i]
        for (var j = 0; j < curr.length; j++) {
            outputString += curr[j]
            if (j != (curr.length - 1)) {
                outputString += ' -> '
            }
        }
        if (i != (output.length - 1)) {
            outputString += '\n'
        }
    }
    return outputString
}

export { getHistory }
