const express = require("express");
const expressHandlebars = require("express-handlebars");
const url = require ("url");

const app = express();
const port = process.env["PORT"] || 3000;

const VLC = require("./lib/vlc");
const vlcClient = new VLC(null, process.env["VLC_PASS"]);

app.engine("handlebars", expressHandlebars());
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
    vlcClient.getStatus()
        .then(status => {
            res.render("index", {
                vlcStatus: status
            });
        });
});

app.get("/artwork", (req, res) => {
    vlcClient.getStatus()
        .then(status => {
            if (status.information.meta.artwork_url){
                filePath = url.fileURLToPath(status.information.meta.artwork_url)
                // TODO: Potentially unsafe...
                // Ideally this should limit to a base path
                return res.sendFile(filePath);
            }
            else
                return res.status(404);
        });
});

app.listen(port, () =>{
    console.log(`Now Playing server listening at http://localhost:${port}`)
});
