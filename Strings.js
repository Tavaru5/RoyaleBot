module.exports = {
    PAY_IN_EMOJI: '💵',
    F2P_EMOJI: '🃏',
    TAG_CHANNEL: '@here \n',
    COMMAND_FAILURE: 'This command failed due to: ',
    FAILURES: {
        NOT_ENOUGH_SIGNUPS: 'Not enough players signed up (minimum 4)',
    },
    TEMPLATES: {
        SIGN_UP_REACTIONS: (payIn, f2p) => `React by next Sunday with ${payIn} to buy-in for next week or ${f2p} to sign up with no buy-in.\n`,
    },
    BREW_WEEK: {
        TEMPLATES: {
            TITLE_LINE: (title) => `This starts the brew week for ${title} standard!\n`,
            SET_LINE: (sets) => `The sets for this standard are ${sets}.\n`,
            SCRYFALL_LINE: (scryFallQuery) => `The scryfall query string for these cards is \`${scryFallQuery}\`\n`,
            BANS: (bans) => `The following cards are banned in this standard: ${bans}.\n`,
        },
        LITERALS: {
            NO_BANS: 'There are no bans for this standard.\n',
        },
    },
    MATCHES: {
        TEMPLATES: {
            TITLE: (title, week) => `This starts week ${week} of matches for ${title} standard!\n`,
            MATHCES_THREAD_MESSAGE: (two, one, zero, tie) => `Matches thread:\nI will post every single match in reply to this thread (each person has 4 matches).\nYou can play matches whenever you and your opponent have time. Matches are bo3, time limit 1 hour (at time go to turns etc).\nReact to the match message with ${two} ${one} ${zero} based on how many games you win, and ${tie} if there is a draw.`,
            MATCHES_THREAD_TITLE: (title, week) => `${title} week ${week} matches`,
            DECKLIST_THREAD_TITLE: (title, week) => `${title} week ${week} decklists`,
            PAIRING_MESSAGE: (user1, user2) => `${user1} vs ${user2}`,
            DROPS_MESSAGE: (drop, add) => `React with ${drop} if you want to drop for week 2 or with ${add} if you want to join (no buy-in).`,
        },
        LITERALS: {
            FOLLOWUP_THREAD_INFO: 'I will post two follow-up threads: one for match pairings and one for decklists. \n',
            WEEK_ONE_SIGN_UP: 'There will be another week of matches next week. \n',
            DECKLIST_THREAD_MESSAGE: 'Decklist thread: Post decklists for week one in this thread.\nDO NOT LOOK IN THE THREAD IF YOUR DECK IS NOT READY TO POST YET (no unfair sideboard advantages).\nPlease post decklists as MTGGoldfish links and use a spoiler tag (`||` around the text).',
            WEEK_ONE: 'One',
            WEEK_TWO: 'Two',
            TWO_EMOJI: '2️⃣',
            ONE_EMOJI: '1️⃣',
            ZERO_EMOJI: '0️⃣',
            TIE_EMOJI: '👔',
            DROP_EMOJI: '💧',
            ADD_EMOJI: '➕',
        },
    },
}