const { SlashCommandBuilder } = require('discord.js');
const { clientId } = require('../config.json');
const Strings = require('../Strings')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-matches')
        .setDescription('Start matches for a week'),
        async execute(interaction) {
            let botMessages;
            let reactionString = Strings.SIGN_UP_REACTIONS.replace('$payIn', Strings.PAY_IN_EMOJI).replace('$f2p', Strings.F2P_EMOJI)
            await interaction.channel.messages.fetch()
                .then(messages =>
                    botMessages = messages.filter(m => m.author.id === clientId)
                )
            let reactions = botMessages.find(message => message.content.startsWith(reactionString)).reactions.cache
            let buyIns
            let f2ps
            await reactions.get('💵').users.fetch()
            .then(users =>
                buyIns = users
            )
            await reactions.get('🃏').users.fetch()
            .then(users =>
                f2ps = users
            )
            let usersForBracket = Array.from(buyIns.values).push(...Array.from(f2ps.values)).filter(user => user.id !== clientId)
            let numUsers = usersForBracket.length
            let matches = [[0, 1], [0, 3], [1, 2], [numUsers - 3, numUsers], [numUsers - 1, numUsers], [numUsers - 2, numUsers - 1]]
            for (let step = 0; step < numUsers; step++) {
                if (step < numUsers - 4) {
                    matches.push([ step, step + 4 ])
                }
                if (step < numUsers - 2) {
                    matches.push([ step, step + 2 ])
                }
            }
            matches.push(`${usersForBracket[0].username} vs ${usersForBracket[1].username}`)

            let buyInString = Array.from(buyIns.values()).filter(user => user.id !== clientId).flatMap(user => user.username).join(', ')
            interaction.reply(`The people who bought in are: ${buyInString}`)
        },
};