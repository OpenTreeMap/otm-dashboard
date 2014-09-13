requirejs.config({
    baseUrl: 'static/js/lib',
    paths: {
        app: '../app'
    },
    shim: {
        'bootstrap.min': {
            deps: ['jquery']
        }
    }
});