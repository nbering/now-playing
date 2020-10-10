const express = require("express");

const app = express();
const port = process.env["PORT"] || 3000;

app.listen(port, () =>{
    console.log(`Now Playing server listening at http://localhost:${port}`)
});
