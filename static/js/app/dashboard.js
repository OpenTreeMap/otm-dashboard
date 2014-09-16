define(['lodash', 'jquery', 'moment', './parseHeaders'],
    function(_, $, moment, parseHeaders) {

    var access_token = null;

    function init(options) {
        access_token = options.access_token;
        initHeader();
        initRepos();
        initIssues();
    }

    function initHeader() {
        var url = apiUrl('https://api.github.com/orgs/OpenTreeMap'),
            tmpl = _.template($('#header-tmpl').html());
        $.getJSON(url).then(function(data) {
            $('#header').html(tmpl(data));
        });
    }

    function initRepos() {
        var url = apiUrl('https://api.github.com/orgs/OpenTreeMap/repos'),
            tmpl = _.template($('#repos-tmpl').html());
        $.getJSON(url).then(function(data) {
            data = _.sortBy(data, function(repo) {
                return repo.name.toLowerCase();
            });
            var html = tmpl({
                repos: data
            });
            $('#repos').html(html);
        });
    }

    function initIssues() {
        var url = apiUrl('https://api.github.com/orgs/OpenTreeMap/issues', {
                filter: 'all',
                state: 'closed',
                labels: 'unverified',
                sort: 'created'
            });

        $('#issues').delegate('.pagination a', 'click', function(e) {
            e.preventDefault();
            loadIssues(e.target.href);
        });

        loadIssues(url);
    }

    function loadIssues(url) {
        var tmpl = _.template($('#issues-tmpl').html());
        $.getJSON(url).then(function(data, status, xhr) {
            var headers = parseHeaders(xhr.getAllResponseHeaders()),
                html = tmpl({
                    issues: data,
                    firstPage: headers.firstPage,
                    prevPage: headers.prevPage,
                    nextPage: headers.nextPage,
                    lastPage: headers.lastPage
                });
            $('#issues').html(html);
        });
    }

    function apiUrl(url, qsParts) {
        qsParts = _.defaults({}, qsParts, {
            access_token: access_token
        });
        var qs = _.pairs(qsParts)
            .map(function(pair) {
                return pair[0] + '=' + pair[1];
            })
            .join('&');
        return url + '?' + qs;
    }

    return {
        init: init
    };
});