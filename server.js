const express = require("express");
const expressHandlebars = require("express-handlebars");

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

app.listen(port, () =>{
    console.log(`Now Playing server listening at http://localhost:${port}`)
});
