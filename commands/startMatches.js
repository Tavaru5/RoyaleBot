const { SlashCommandBuilder } = require('discord.js');
const { clientId } = require('../config.json');
const Strings = require('../Strings')
const { matchFormatString, FORMAT_PLACEHOLDER } = require('../stringParsing')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-matches')
        .setDescription('Start matches for a week')
        .addBooleanOption(option =>
			option
				.setName('weekone')
				.setDescription('Is this week one of matches?')
				.setRequired(true)
        ),
        async execute(interaction) {
            let botMessages;
            let failureReason = ''
            const weekOne = interaction.options.getBoolean('weekone')
            await interaction.channel.messages.fetch()
                .then(messages =>
                    botMessages = Array.from(messages.filter(m => m.author.id === clientId).values())
                )
            // To-do: Handle failure of no previous standard title
            let standardTitle
            botMessages.find(message => {
                standardTitle = matchFormatString(message.content, Strings.BREW_WEEK.TEMPLATES.TITLE_LINE(FORMAT_PLACEHOLDER))
                if (standardTitle.length > 0) {
                    return true
                }
                return false
            })

            // Get the users from their reactions to the previous sign up message
            // To-do: Handle failure of no previous reactions (or incorrect ones)
            let reactionEmojis
            let buyIns
            let f2ps
            let reactions = botMessages.find(message => {
                reactionEmojis = matchFormatString(message.content, Strings.TEMPLATES.SIGN_UP_REACTIONS(FORMAT_PLACEHOLDER, FORMAT_PLACEHOLDER))
                return (reactionEmojis.length === 2)
            }).reactions.cache
            await reactions.get(reactionEmojis[0]).users.fetch()
            .then(users =>
                buyIns = users
            )
            await reactions.get(reactionEmojis[1]).users.fetch()
            .then(users =>
                f2ps = users
            )
            let usersForBracket = Array.from(buyIns.values()).concat(Array.from(f2ps.values())).filter(user => user.id !== clientId)

            // Shuffle the array (for matchmaking purposes)
            for (let i = usersForBracket.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [usersForBracket[i], usersForBracket[j]] = [usersForBracket[j], usersForBracket[i]];
            }

            // Matchmaking
            let numUsers = usersForBracket.length
            let matches
            if (numUsers > 4) {
                matches = [[0, 1], [0, 3], [1, 2], [numUsers - 4, numUsers - 1], [numUsers - 2, numUsers - 1], [numUsers - 3, numUsers - 2]]
                for (let step = 0; step < numUsers; step++) {
                    if (step < numUsers - 4) {
                        matches.push([ step, step + 4 ])
                    }
                    if (step < numUsers - 2) {
                        matches.push([ step, step + 2 ])
                    }
                }
            } else if (numUsers == 4) {
                matches = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
            } else {
                failureReason = Strings.FAILURES.NOT_ENOUGH_SIGNUPS
            }
            matches = matches.flatMap(indices => Strings.MATCHES.TEMPLATES.PAIRING_MESSAGE(usersForBracket[indices[0]], usersForBracket[indices[1]]))

            if (failureReason.length > 0) {
                interaction.reply(Strings.COMMAND_FAILURE + failureReason)
            } else {
                let reply = ''
                let week = weekOne ? Strings.MATCHES.LITERALS.WEEK_ONE : Strings.MATCHES.LITERALS.WEEK_TWO
                reply += Strings.TAG_CHANNEL
                reply += Strings.MATCHES.TEMPLATES.TITLE(standardTitle, week)
                reply += Strings.MATCHES.LITERALS.FOLLOWUP_THREAD_INFO
                if (weekOne) {
                    reply += Strings.MATCHES.LITERALS.WEEK_ONE_SIGN_UP
                    reply += Strings.TEMPLATES.SIGN_UP_REACTIONS(Strings.PAY_IN_EMOJI, Strings.F2P_EMOJI)
                }
                const initialMessage = await interaction.reply({ content: reply, fetchReply: true })
                if (weekOne) {
                    await initialMessage.react(Strings.PAY_IN_EMOJI)
                    await initialMessage.react(Strings.F2P_EMOJI)
                }
                const decklistMessage = await interaction.channel.send(Strings.MATCHES.LITERALS.DECKLIST_THREAD_MESSAGE)
                await decklistMessage.startThread({
                    name: Strings.MATCHES.TEMPLATES.DECKLIST_THREAD_TITLE(standardTitle, week),
                })
                await decklistMessage.pin()
                const matchMessage = await interaction.channel.send(Strings.MATCHES.TEMPLATES.MATHCES_THREAD_MESSAGE(
                    Strings.MATCHES.LITERALS.TWO_EMOJI,
                    Strings.MATCHES.LITERALS.ONE_EMOJI,
                    Strings.MATCHES.LITERALS.ZERO_EMOJI,
                    Strings.MATCHES.LITERALS.TIE_EMOJI,
                ))
                const matchThread = await matchMessage.startThread({
                    name: Strings.MATCHES.TEMPLATES.MATCHES_THREAD_TITLE(standardTitle, week),
                })
                await matchMessage.pin()
                for (const match of matches) {
                    // This is the flag to supress notifications
                    await matchThread.send({ content: match, flags: [4096] })
                }
            }
        },
};