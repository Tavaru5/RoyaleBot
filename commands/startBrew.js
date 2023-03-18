const { SlashCommandBuilder } = require('discord.js');
const mtg = require('mtgsdk')
const Strings = require('../Strings')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-brew')
        .setDescription('Send the message for the first week of brewing')
        .addStringOption(option =>
			option
				.setName('blocks')
				.setDescription('List of blocks for this standard separated by a comma')
				.setRequired(true)
        )
        .addStringOption(option =>
			option
				.setName('bans')
				.setDescription('List of banned cards separated by a comma')
				.setRequired(false)
        ),
        async execute(interaction) {
            const blocks = interaction.options.getString('blocks').split(',')
            const bannedCards = (interaction.options.getString('bans') ?? '').split(',')
            let titleString
            let scryFallString
            let setString
            await mtg.set.where({ block: blocks.join('|') + '|Core Set' })
            .then(sets => {
                let setsList = sets.filter(
                    set => set.type === 'expansion'
                    && blocks.some(blockName => set.block.toLowerCase() === blockName.toLowerCase())
                )
                let setDates = setsList.flatMap(set => new Date(set.releaseDate))
                let minDate = new Date(Math.min(...setDates))
                let maxDate = new Date(Math.max(...setDates))
                setsList.push(...sets.filter(set =>
                    set.type === 'core'
                    && new Date(set.releaseDate) > minDate
                    && new Date(set.releaseDate).getFullYear() <= maxDate.getFullYear()
                ))
                setsList.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))

                titleString = blocks.join(' - ')
                scryFallString = '(' + setsList.flatMap(set => 'set:' + set.code).join(' OR ') + ')'
                setString = setsList.flatMap(set => set.code).join(', ')
            })
            let tagLine = Strings.TAG_CHANNEL
            let lineOne = Strings.BREW_WEEK.TEMPLATES.TITLE_LINE(titleString)
            let lineTwo = Strings.BREW_WEEK.TEMPLATES.SET_LINE(setString)
            let lineThree
            if (bannedCards[0].length == 0) {
                lineThree = Strings.BREW_WEEK.LITERALS.NO_BANS
            } else {
                lineThree = Strings.BREW_WEEK.TEMPLATES.BANS(bannedCards.join(', '))
            }
            let lineFour = Strings.BREW_WEEK.TEMPLATES.SCRYFALL_LINE(scryFallString)
            let lineFive = Strings.TEMPLATES.SIGN_UP_REACTIONS(Strings.PAY_IN_EMOJI, Strings.F2P_EMOJI)
            const message = await interaction.reply({ content: tagLine + lineOne + lineTwo + lineThree + lineFour + lineFive, fetchReply: true })
            await message.pin()
            message.react(Strings.PAY_IN_EMOJI)
            message.react(Strings.F2P_EMOJI)
        },
};