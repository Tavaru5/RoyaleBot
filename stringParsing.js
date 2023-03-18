module.exports = {
    FORMAT_PLACEHOLDER: '$/$',
    matchFormatString(toMatch, templateString) {
        let splitString = templateString.replace(/\n$/g, '').split('$/$')
        let matches = []
        for (let i = 0; i < splitString.length - 1; i++) {
            let segment = splitString[i]
            let firstFind = toMatch.indexOf(segment)
            if (firstFind > 0) {
                let match = toMatch.substring(toMatch.indexOf(segment) + segment.length, toMatch.indexOf(splitString[i + 1]))
                if (match) {
                    matches.push(match)
                }
            }
        }
        return matches
    },
}