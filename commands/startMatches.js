const { SlashCommandBuilder } = require('discord.js');
const Strings = require('../Strings')
const { FORMAT_PLACEHOLDER } = require('../stringParsing')
const { getBotMessages, getStandardTitle, getReactions } = require('../messageFiltering')

// Discord flag to not ping people when tagged
const NOTIF_SUPPRESSION_FLAG = 4096

function makeMatches(users) {
    let numUsers = users.length
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
    }
    matches = matches.flatMap(indices => Strings.MATCHES.TEMPLATES.PAIRING_MESSAGE(users[indices[0]], users[indices[1]]))
}

async function makeMatchesThread(channel, matches, standardTitle, week) {
    const matchMessage = await channel.send(Strings.MATCHES.TEMPLATES.MATHCES_THREAD_MESSAGE(
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
        const singleMatch = await matchThread.send({ content: match, flags: [NOTIF_SUPPRESSION_FLAG] })
        singleMatch.react(Strings.MATCHES.LITERALS.TWO_EMOJI)
            .then(() => singleMatch.react(Strings.MATCHES.LITERALS.ONE_EMOJI))
            .then(() => singleMatch.react(Strings.MATCHES.LITERALS.ZERO_EMOJI))
            .then(() => singleMatch.react(Strings.MATCHES.LITERALS.TIE_EMOJI))
    }
}

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
            let failureReason = ''
            const weekOne = interaction.options.getBoolean('weekone')

            let botMessages = await getBotMessages(interaction)
            let standardTitle = getStandardTitle(botMessages)

            let reactions = await getReactions(botMessages, Strings.TEMPLATES.SIGN_UP_REACTIONS(FORMAT_PLACEHOLDER, FORMAT_PLACEHOLDER))
            let usersForBracket = reactions[0][1].concat(reactions[1][1])

            // Parse the week one stuff for adds/drops if it's week two
            if (!weekOne) {
                let dropAdds = getReactions(botMessages, Strings.MATCHES.TEMPLATES.DROPS_MESSAGE(FORMAT_PLACEHOLDER, FORMAT_PLACEHOLDER))
                if (dropAdds.length == 2) {
                    usersForBracket = usersForBracket.filter(user => !dropAdds[0].some(drop => drop.id === user.id)).concat(dropAdds[1])
                }
            }

            // Shuffle the array (for matchmaking purposes)
            for (let i = usersForBracket.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [usersForBracket[i], usersForBracket[j]] = [usersForBracket[j], usersForBracket[i]];
            }

            // Matchmaking
            let numUsers = usersForBracket.length
            let matches
            if (numUsers > 4) {
                matches = makeMatches(usersForBracket)
            } else {
                failureReason = Strings.FAILURES.NOT_ENOUGH_SIGNUPS
            }

            if (failureReason.length > 0) {
                interaction.reply(Strings.COMMAND_FAILURE + failureReason)
            } else {
                let reply = Strings.TAG_CHANNEL
                let week = weekOne ? Strings.MATCHES.LITERALS.WEEK_ONE : Strings.MATCHES.LITERALS.WEEK_TWO
                reply += Strings.MATCHES.TEMPLATES.TITLE(standardTitle, week)
                reply += Strings.MATCHES.LITERALS.FOLLOWUP_THREAD_INFO
                if (weekOne) {
                    reply += Strings.MATCHES.LITERALS.WEEK_ONE_SIGN_UP
                    reply += Strings.MATCHES.TEMPLATES.DROPS_MESSAGE(Strings.MATCHES.LITERALS.DROP_EMOJI, Strings.MATCHES.LITERALS.ADD_EMOJI)
                }
                const initialMessage = await interaction.reply({ content: reply, fetchReply: true })
                if (weekOne) {
                    await initialMessage.react(Strings.MATCHES.LITERALS.DROP_EMOJI)
                    await initialMessage.react(Strings.MATCHES.LITERALS.ADD_EMOJI)
                }

                const decklistMessage = await interaction.channel.send(Strings.MATCHES.LITERALS.DECKLIST_THREAD_MESSAGE)
                await decklistMessage.startThread({
                    name: Strings.MATCHES.TEMPLATES.DECKLIST_THREAD_TITLE(standardTitle, week),
                })
                await decklistMessage.pin()

                makeMatchesThread(interaction.channel, matches, standardTitle, week)
            }
        },
};