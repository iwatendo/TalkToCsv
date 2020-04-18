var fs = require('fs')
var path = require('path');


/**
 * 指定ファイルの{version}にバージョンを埋める
 * @param {*} filepath 
 * @param {*} modified 
 * @param {*} version 
 * @param {*} apikey 
 */
function SetVersionAndApiKey(filepath, modified, version, apikey) {

    console.info("Set VersionAndApiKey " + version + " : " + filepath);

    fs.readFile(filepath, 'utf8', function (err, data) {
        if (err) throw err;
        var result = data.replace(/{version}/g, version)
                         .replace(/{modified}/g, modified)
                         .replace(/{googlemap}/g, apikey.googlemap);
        fs.writeFile(filepath, result, 'utf8', function (err) {
            if (err) throw err;
        });
    });
}


/**
 * index.htmlを検索して、{version}をセットする
 * @param {*} folder 
 * @param {*} modified 
 * @param {*} version 
 * @param {*} apikey 
 */
function SetVersionAndApiKey_ToIndexHtml(folder, modified, version, apikey) {

    fs.readdir(folder, function (err, files) {

        if (err) throw err;

        files.forEach(function (file) {

            let filepath = path.join(folder, file);

            if (file.indexOf("index.html") === 0) {
                SetVersionAndApiKey(filepath, modified, version, apikey);
            }
            else {
                if (fs.statSync(filepath).isDirectory()) {
                    SetVersionAndApiKey_ToIndexHtml(filepath, modified, version, apikey);
                }
            }
        });
    });
}

/**
 * ビルド日時をバージョンとする
 */
function build_date() {
    let now = new Date();
    return now.getFullYear()
        + ("0" + (now.getMonth() + 1)).slice(-2)
        + ("0" + now.getDate()).slice(-2)
        + ("0" + now.getHours()).slice(-2)
        + ("0" + now.getMinutes()).slice(-2);
}


let modified = new Date().toUTCString();
let version = build_date();
let apikey = require('../src/Page/apikey.json');

console.info(modified);


SetVersionAndApiKey_ToIndexHtml("dist", modified, version, apikey);

