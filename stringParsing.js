module.exports = {
    FORMAT_PLACEHOLDER: '$/$',
    matchFormatString(toMatch, templateString) {
        let split = templateString.replace(/\n$/g, '').split('$/$')
        let matches = []
        for (let i = 0; i < split.length - 1; i++) {
            let split1 = split[i]
            matches.push(toMatch.substring(toMatch.indexOf(split1) + split1.length, toMatch.indexOf(split[i + 1])))
        }
        return matches
    },
}