const { google } = require("googleapis");
const http = require("http");
const url = require("url");
const opn = require("open");
const destroyer = require("server-destroy");
const fs = require("fs");
const path = require("path");

// client app keys which contains client_id , client_secrets, redirect_urls etc.
const keyPath = path.join(__dirname, "secrets/oauth2.keys.json");

const TOKEN_DIR = "secrets";
// if token file doesn't exists it will ask for user permission
// once permission granted it will same token + refresh_token in below file
const TOKEN_PATH = path.join(__dirname, "secrets/youtube-API-secrets.json");


// let TOKEN_DIR =
//   (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
//   "/.credentials/";
// let TOKEN_PATH = TOKEN_DIR + "youtube-API-secrets.json";


let keys = {
  redirect_uris: ["http://localhost:3000/oauth2callback"]
};
if (fs.existsSync(keyPath)) {
  const keyFile = require(keyPath);
  keys = keyFile.installed || keyFile.web;
}

const invalidRedirectUri = `The provided keyfile does not define a valid
redirect URI. There must be at least one redirect URI defined, and this sample
assumes it redirects to 'http://localhost:3000/oauth2callback'.  Please edit
your keyfile, and add a 'redirect_uris' section.  For example:

"redirect_uris": [
  "http://localhost:3000/oauth2callback"
]
`;

class OAuth {
  constructor(options) {
    this._options = options || { scopes: [] };

    // validate the redirectUri.  This is a frequent cause of confusion.
    if (!keys.redirect_uris || keys.redirect_uris.length === 0) {
      throw new Error(invalidRedirectUri);
    }
    const redirectUri = keys.redirect_uris[keys.redirect_uris.length - 1];
    const parts = new url.URL(redirectUri);
    if (
      redirectUri.length === 0 ||
      parts.port !== "3000" ||
      parts.hostname !== "localhost" ||
      parts.pathname !== "/oauth2callback"
    ) {
      throw new Error(invalidRedirectUri);
    }

    // create an oAuth client to authorize the API call
    this.oAuth2Client = new google.auth.OAuth2(
      keys.client_id,
      keys.client_secret,
      redirectUri
    );
  }

  async storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != "EEXIST") {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
      if (err) throw err;
      console.log("Token stored to " + TOKEN_PATH);
    });
    console.log("Token stored to " + TOKEN_PATH);
  }

  async getToken() {
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(TOKEN_PATH, function(err, token) {
          if (err) {
            resolve(false);
          } else {
            resolve(JSON.parse(token));
          }
        });
      } catch (error) {
        resolve(false);
      }
    });
  }

  // Open an http server to accept the oauth callback. In this
  // simple example, the only request to our webserver is to
  // /oauth2callback?code=<code>
  async authenticate(scopes) {
    return new Promise(async (resolve, reject) => {
      // grab the url that will be used for authorization
      const offLineTokens = await this.getToken();
      if (offLineTokens) {
        this.oAuth2Client.credentials = offLineTokens;
        resolve(this.oAuth2Client);
      } else {
        this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
          access_type: "offline",
          scope: scopes.join(" ")
        });

        const server = http
          .createServer(async (req, res) => {
            try {
              if (req.url.indexOf("/oauth2callback") > -1) {
                const qs = new url.URL(req.url, "http://localhost:3000")
                  .searchParams;
                res.end(
                  "Authentication successful! Please return to the console."
                );
                server.destroy();
                const { tokens } = await this.oAuth2Client.getToken(
                  qs.get("code")
                );
                this.oAuth2Client.credentials = tokens;
                await this.storeToken(tokens);
                resolve(this.oAuth2Client);
              }
            } catch (e) {
              reject(e);
            }
          })
          .listen(3000, () => {
            // open the browser to the authorize url to start the workflow
            opn(this.authorizeUrl, { wait: false }).then(cp => cp.unref());
          });
        destroyer(server);
      }
    });
  }
}

module.exports = new OAuth();
