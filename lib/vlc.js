const fetch = require("node-fetch");
const { parseStringPromise } = require("xml2js");
const { XmlEntities } = require("html-entities");
const EventEmitter = require("events");

const entities = new XmlEntities();

module.exports = class VLCClient extends EventEmitter {
    constructor(baseURL, password){
        super();

        let authDigest = Buffer.from(":" + password).toString("base64");

        this._baseURL = baseURL || "http://localhost:8080";
        this._headers = {
            "Authorization": "Basic " + authDigest
        };

        this._started = false;
        this._timer = null;
        this._previousFilename = null;
    }

    start(){
        if (this._started)
            return false;

        const callback = () => {
            this.getStatus()
                .then(status => {
                    var filename = null;

                    if (status && status.information.meta.filename) {
                        filename = status.information.meta.filename;
                    }

                    if (this._previousFilename !== filename){
                        this.emit("song-changed", status);
                    }

                    this._previousFilename = filename;
                })
                .finally(() => {
                    if (this._started)
                        this._timer = setTimeout(callback, 10000);
                });
        }

        this._started = true;

        callback();

        return true;
    }

    stop(){
        if (!this._started)
            return false;

        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this._started = false;

        return true;
    }

    getStatus(){
        let url = `${this._baseURL}/requests/status.xml`

        return fetch(url, {headers: this._headers})
            .then(res => res.text())
            .then(bodyText => parseStringPromise(bodyText))
            .then(xml => new VLCStatus(xml.root));
    }
}

class VLCStatus {
    constructor(root) {
        this.state = root.state[0];
        this.information = new VLCInfo(root.information[0]);
    }
}

class VLCInfo {
    constructor(info) {
        if (info && info.category) {
            let meta = info.category.find(item => item.$.name == "meta");
            this.meta = new VLCMetaInfo(meta);
        }
    }
}

class VLCMetaInfo {
    constructor(meta) {
        if (meta && meta.info) {
            meta.info.forEach(item => {
                this[item.$.name] = entities.decode(item._)
            });
        }
    }
}
