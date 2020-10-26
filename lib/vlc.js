const fetch = require("node-fetch");
const { parseStringPromise } = require("xml2js");
const { XmlEntities } = require("html-entities");

const entities = new XmlEntities();

module.exports = class VLCClient {
    constructor(baseURL, password){
        let authDigest = Buffer.from(":" + password).toString("base64");

        this._baseURL = baseURL || "http://localhost:8080";
        this._headers = {
            "Authorization": "Basic " + authDigest
        };
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
