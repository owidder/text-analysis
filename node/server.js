var path = require("path");
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var path = require('path');

var router = express.Router();

var server = require('http').createServer(app);

var BASE_FOLDER = '/Users/owidder/dev/iteragit/nge/python/f2-all';

app.use(cors());
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/client'));

var IGNORE_FILE_NAME = './ignore.txt';

var ignoreList;

function readFolder(relFolder) {
    var absFolder = path.join(BASE_FOLDER, relFolder);
    var filesAndSubfolders = fs.readdirSync(absFolder);
    return filesAndSubfolders.filter(function(fileOrSubfolder) {
        return fs.lstatSync(path.join(absFolder, '/', fileOrSubfolder)).isDirectory();
    });
}

function readContent(relPath) {
    var absPath = path.join(BASE_FOLDER, relPath);
    var content = fs.readFileSync(absPath, 'utf8');
    return content;
}

function readIgnore() {
    var content = fs.readFileSync(IGNORE_FILE_NAME, 'utf8').toLowerCase();
    return content.split("\n");
}

function isIgnored(word) {
    return ignoreList.indexOf(word.toLowerCase()) >= 0;
}

function addToIgnore(word) {
    ignoreList.push(word.toLowerCase());
    fs.appendFileSync(IGNORE_FILE_NAME, "\n" + word);
}

router.post('/ignore', function (req, res) {
    var word = req.body.word;
    addToIgnore(word);
    res.json({status: "ok"});
});

router.get('/folder/*', function (req, res) {
    var relFolder = req.originalUrl.substr("/api/folder".length+1);
    res.json({
        folder: relFolder,
        content: readFolder(relFolder)
    });
});

router.get('/values/2/*', function (req, res) {
    var relFolder = req.originalUrl.substr("/api/values/2".length + 1);
    var content = readContent(path.join(relFolder, '_.csv'));
    var rows = content.split("\n");
    var values = {};
    var ctr = 0;
    rows.forEach(function(row) {
        var parts = row.split("\t");
        var key = parts[0];
        var value = parts[1];
        if(!isIgnored(key)) {
            if(ctr++ < 100) {
                values[key] = Math.round(value);
            }
        }
    });
    res.json(values);
});

router.get('/values/*', function (req, res) {
    var relFolder = req.originalUrl.substr("/api/values".length + 1);
    var content = readContent(path.join(relFolder, '_.csv'));
    var rows = content.split("\n");
    var values = [];
    var ctr = 0;
    rows.forEach(function(row) {
        var parts = row.split("\t");
        var id = parts[0];
        var value = parts[1];
        if(ctr++ < 100) {
            values.push({
                id: id,
                value: value
            })
        }
    });
    res.json(values);
});

ignoreList = readIgnore();

app.use('/api', router);

server.listen(3000, function () {
    console.log('Radar server listening on port 3000!')
});
