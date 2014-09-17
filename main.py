from flask import Flask, session, redirect, url_for, request, render_template
import urlparse
import requests

from snippets import ReverseProxied

app = Flask(__name__)
app.config.from_object('default_settings')
app.wsgi_app = ReverseProxied(app.wsgi_app)


@app.route("/")
def index():
    access_token = session.get('access_token', None)
    if not access_token:
        return redirect(url_for('login'))
    return render_template('index.html', access_token=access_token)


@app.route("/login")
def login():
    if 'access_token' in session:
        return redirect(url_for('index'))
    elif 'code' in request.args:
        # Exchange auth code for access token.
        params = {
            'client_id': app.config['CLIENT_ID'],
            'client_secret': app.config['CLIENT_SECRET'],
            'code': request.args.get('code')
        }
        url = 'https://github.com/login/oauth/access_token'
        res = requests.post(url, data=params)
        qs = urlparse.parse_qs(res.text)
        session['access_token'] = qs['access_token'][0]
        return redirect(url_for('index'))
    else:
        # Request auth code.
        params = {
            'client_id': app.config['CLIENT_ID'],
            'redirect_uri': app.config['SITE_URL'] + '/login',
            'scope': 'repo'
        }
        qs = '&'.join(a + '=' + b for a, b in params.iteritems())
        url = 'https://github.com/login/oauth/authorize?' + qs
        return redirect(url)


@app.route('/logout')
def logout():
    session.pop('access_token', None)
    return redirect(url_for('index'))

if __name__ == "__main__":
    app.run(host='0.0.0.0')
