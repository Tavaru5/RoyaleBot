const { clientId } = require('./config.json');
const { matchFormatString, FORMAT_PLACEHOLDER } = require('./stringParsing')
const Strings = require('./Strings')

module.exports = {
    async getBotMessages(interaction) {
        let botMessages
        await interaction.channel.messages.fetch({ limit: 100 })
                .then(messages => {
                    botMessages = Array.from(messages.filter(m => m.author.id === clientId).values())
                }
                )
        return botMessages
    },
    getStandardTitle(botMessages) {
        // To-do: Handle failure of no previous standard title
        let standardTitle
        botMessages.find(message => {
            standardTitle = matchFormatString(message.content, Strings.BREW_WEEK.TEMPLATES.TITLE_LINE(FORMAT_PLACEHOLDER))
            if (standardTitle.length > 0) {
                return true
            }
            return false
        })
        return standardTitle
    },
    async getReactions(botMessages, formatString) {
        let reactionEmojis
        let reactionMap = []
        let reactions

        let reactionMessage = botMessages.find(message => {
            reactionEmojis = matchFormatString(message.content, formatString)
            return (reactionEmojis.length > 0)
        })
        if (reactionMessage != undefined) {
            reactions = reactionMessage.reactions.cache
        }
        for (const reactionEmoji of reactionEmojis) {
            await reactions.get(reactionEmoji).users.fetch()
            .then(users => {
                let filteredUsers = Array.from(users.values()).filter(user => user.id !== clientId)
                reactionMap.push([reactionEmoji, filteredUsers])
            })
        }
        return reactionMap
    },
}