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

            if (failureReason.length > 0) {
                interaction.reply(Strings.COMMAND_FAILURE + failureReason)
            } else {
                // Do things
            }
        },
};