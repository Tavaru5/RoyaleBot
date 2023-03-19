const { SlashCommandBuilder } = require('discord.js');
const Strings = require('../Strings')
const { getBotMessages, getStandardTitle, getReactionsWithEmojis } = require('../messageFiltering')

class UserScore {
    matchScore = 0;
    opponents = [];
    oppMatchWin = 0;
    gameWin = 0;
    gameLoss = 0;
    oppGameWin = 0;
    oppGameLoss = 0;
    user;

    constructor(user) {
        this.user = user
    }

    addPoints(record, oppRecord) {
        if (record > oppRecord) {
            this.matchScore = this.matchScore + 3
        }
        this.gameWin = this.gameWin + record
        this.gameLoss = this.gameLoss + oppRecord
    }

    addOpponent(opponent) {
        this.opponents = this.opponents.concat(opponent)
    }

    calculateOppStats(userMap) {
        for (const opponent of this.opponents) {
            let oppScore = userMap.get(opponent)
            this.oppMatchWin = this.oppMatchWin + oppScore.matchScore
            this.oppGameWin = this.oppGameWin + oppScore.gameWin
            this.oppGameLoss = this.oppGameLoss + oppScore.gameLoss
        }
        this.oppMatchWin = this.oppMatchWin / this.opponents.length
    }

    addScore(userScore) {
        this.matchScore = this.matchScore + userScore.matchScore
        this.oppMatchWin = (this.oppMatchWin + userScore.oppMatchWin) / 2
        this.gameWin = this.gameWin + userScore.gameWin
        this.gameLoss = this.gameLoss + userScore.gameLoss
        this.oppGameWin = this.oppGameWin + userScore.oppGameWin
        this.oppGameLoss = this.oppGameLoss + userScore.oppGameLoss
    }

    getGameWinPercentage() {
        return this.gameWin / (this.gameWin + this.gameLoss)
    }

    getOppGameWinPercentage() {
        return this.oppGameWin / (this.oppGameWin + this.oppGameLoss)
    }

    getPlayerRecord() {
        let matchWins = this.matchScore/3
        return Strings.FINALS.TEMPLATES.PLAYER_RECORD(this.user, matchWins, 8 - matchWins)
    }

}

function compareScores(scoreA, scoreB) {
    return ((scoreA.matchScore - scoreB.matchScore || scoreA.oppMatchWin - scoreB.oppMatchWin) || scoreA.getGameWinPercentage() - scoreB.getGameWinPercentage()) || scoreA.getOppGameWinPercentage() - scoreB.getOppGameWinPercentage()
    
}

async function tallyMatches(matchMessages) {
    let playerPoints = new Map()
    // Remove the initial thread message
    matchMessages.pop()
    for (const match of matchMessages) {
        let reactions = await getReactionsWithEmojis(match, [Strings.MATCHES.LITERALS.TWO_EMOJI, Strings.MATCHES.LITERALS.ONE_EMOJI, Strings.MATCHES.LITERALS.ZERO_EMOJI])
        if (reactions[0][1].length > 0) {
            let winner = reactions[0][1][0]
            let loser
            let loserPoints = 0
            if (reactions[1][1].length > 0) {
                loser = reactions[1][1][0]
                loserPoints = 1
            } else if (reactions[2][1].length > 0) {
                loser = reactions[2][1][0]
            }
            if (!playerPoints.has(winner)) {
                playerPoints.set(winner, new UserScore(winner))
            } 
            if (!playerPoints.has(loser)) {
                playerPoints.set(loser, new UserScore(loser))
            }
            playerPoints.get(winner).addPoints(2, loserPoints)
            playerPoints.get(winner).addOpponent(loser)
            playerPoints.get(loser).addPoints(loserPoints, 2)
            playerPoints.get(loser).addOpponent(winner)
        }
        
    }
    playerPoints.forEach((userScore) => {userScore.calculateOppStats(playerPoints)})
    return playerPoints
}



module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-finals-bracket')
        .setDescription('Tally this standard\'s matches and create the finals bracket'),
        async execute(interaction) {
            await interaction.deferReply();
            let failureReason = ''
            let botMessages = await getBotMessages(interaction.channel)
            let standardTitle = getStandardTitle(botMessages)
            console.log(standardTitle)

            let weekOneThread = interaction.channel.threads.cache.find(thread => thread.name === Strings.MATCHES.TEMPLATES.MATCHES_THREAD_TITLE(standardTitle, Strings.MATCHES.LITERALS.WEEK_ONE))
            let weekTwoThread = interaction.channel.threads.cache.find(thread => thread.name === Strings.MATCHES.TEMPLATES.MATCHES_THREAD_TITLE(standardTitle, Strings.MATCHES.LITERALS.WEEK_TWO))

            let weekOneMessages = await getBotMessages(weekOneThread)
            let weekOneMap = await tallyMatches(weekOneMessages)
            let weekTwoMessages = await getBotMessages(weekTwoThread)
            let weekTwoMap = await tallyMatches(weekTwoMessages)


            weekTwoMap.forEach((value, key) => {
                if (weekOneMap.has(key)) {
                    weekTwoMap.get(key).addScore(weekOneMap.get(key))
                }
            })

            // Merged map will take last value, so this just catches any values that were in week one but not in week two
            let finalList = Array.from((new Map([...weekOneMap, ...weekTwoMap])).values()).sort(compareScores).reverse()

            finalList.forEach((userScore) => {
                console.log(`${userScore.user.username}: \t\t${userScore.matchScore}\t\t${userScore.oppMatchWin/12}`)
            })

            let reply = Strings.TAG_CHANNEL
            if (failureReason.length > 0) {
                reply = Strings.COMMAND_FAILURE + failureReason
            } else {
                reply += Strings.FINALS.TEMPLATES.TITLE(standardTitle)
                reply += Strings.FINALS.TEMPLATES.TOP_FOUR(
                    Strings.FINALS.TEMPLATES.PLAYER_RECORD(finalList[0].getPlayerRecord()),
                    Strings.FINALS.TEMPLATES.PLAYER_RECORD(finalList[1].getPlayerRecord()),
                    Strings.FINALS.TEMPLATES.PLAYER_RECORD(finalList[2].getPlayerRecord()),
                    Strings.FINALS.TEMPLATES.PLAYER_RECORD(finalList[3].getPlayerRecord()),
                )
                reply += Strings.FINALS.LITERALS.FINALS_INSTRUCTIONS
            }


            await interaction.editReply(reply)
        },
};