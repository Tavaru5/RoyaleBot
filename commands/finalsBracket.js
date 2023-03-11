const { SlashCommandBuilder } = require('discord.js');
const { clientId } = require('../config.json');
const Strings = require('../Strings')
const { matchFormatString, FORMAT_PLACEHOLDER } = require('../stringParsing')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-finals-bracket')
        .setDescription('Tally this standard\'s matches and create the finals bracket'),
        async execute(interaction) {
            let botMessages;
            let failureReason = ''
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

            let weekOneThread = interaction.channel.threads.cache.find(thread => thread.name === Strings.MATCHES.TEMPLATES.MATCHES_THREAD_TITLE(standardTitle, Strings.MATCHES.LITERALS.WEEK_ONE))
            let weekTwoThread = interaction.channel.threads.cache.find(thread => thread.name === Strings.MATCHES.TEMPLATES.MATCHES_THREAD_TITLE(standardTitle, Strings.MATCHES.LITERALS.WEEK_TWO))
            // Go through each thread
            // Parse out only messages from bot
            // Have a map of user -> "points" (1 for tie, 3 for win, 0 for loss)
            // Add points per match
            // Have separate map(?) for user -> users they faced that week
            // At end of parsing for a week, take that separate map and grab each opponent's w/l to calculate opp win percentage

            if (failureReason.length > 0) {
                interaction.reply(Strings.COMMAND_FAILURE + failureReason)
            } else {
                // Do things
            }
        },
};