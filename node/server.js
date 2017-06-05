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

router.get('/folder/*', function (req, res) {
    var relFolder = req.originalUrl.substr("/api/folder".length+1);
    res.json({
        folder: relFolder,
        content: readFolder(relFolder)
    });
});

router.get('/values/*', function (req, res) {
    var relFolder = req.originalUrl.substr("/api/values".length+1);
    res.json({
        content: readContent(path.join(relFolder, '_.csv'))
    });
});

app.use('/api', router);

server.listen(3000, function () {
    console.log('Radar server listening on port 3000!')
});
