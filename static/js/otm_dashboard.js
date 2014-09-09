(function(window) {

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
            state: 'all',
            labels: 'unverified',
            sort: 'created'
        }),
        tmpl = _.template($('#issues-tmpl').html());
    $.getJSON(url).then(function(data) {
        data = _.sortBy(data, function(issue) {
            return issue.repository.name.toLowerCase();
        });
        data = _.groupBy(data, function(issue) {
            return issue.repository.name;
        });
        var html = tmpl({
            grouped_issues: data
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
      
window.otm_dashboard = {
    init: init
};  

}(window));