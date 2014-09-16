define(['lodash'], function(_) {

    // Selectively parse headers returned from GitHub API.
    function parseHeaders(headers) {
        function tokenize(str) {
            return str.split(/(\s+|\n|,)/).filter(notWhitespace);
        }

        function notWhitespace(str) {
            return !/^\s*$/.test(str);
        }

        function parse(tokens) {
            var result = {};
            while (tokens.length > 0) {
                if (tokens[0] == 'Link:') {
                    result = _.merge(result, parseLinkHeader(tokens));
                }
                // Throw away invalid or unknowns tokens.
                tokens.shift();
            }
            return result;
        }

        function parseLinkHeader(tokens) {
            var result = {},
                linkPattern = /<(http.+)>;$/;

            expect(tokens, /Link:/);

            while (true) {
                var link = expect(tokens, linkPattern)[0],
                    rel = expect(tokens, /rel="(first|prev|next|last)"/)[0];
                result[rel + 'Page'] = link;
                if (tokens[0] == ',') {
                    expect(tokens, /,/);
                    continue;
                }
                break;
            }

            return result;
        }

        function expect(tokens, expected) {
            var actual = tokens.shift(),
                match = expected.exec(actual);
            if (!match) {
                throw 'Expected "' + expected.toString() + '" but received "' + actual.toString() + '"';
            }
            return match.slice(1);
        }

        return parse(tokenize(headers));
    }
    return parseHeaders;
});