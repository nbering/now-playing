const express = require("express");
const expressHandlebars = require("express-handlebars");

const app = express();
const port = process.env["PORT"] || 3000;

app.engine("handlebars", expressHandlebars());
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(port, () =>{
    console.log(`Now Playing server listening at http://localhost:${port}`)
});
