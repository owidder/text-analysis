var path = require("path");
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');

var router = express.Router();

var server = require('http').createServer(app);

var BASE_FOLDER = '/Users/owidder/dev/iteragit/nge/python/f2-all';

app.use(cors());
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/client'));

function readFolder(relFolder) {
    var absFolder = BASE_FOLDER + '/' + relFolder;
    return fs.readdirSync(absFolder);
}

router.get('/folder/*', function (req, res) {
    var relFolder = req.originalUrl.substr("/api/folder".length+1);
    res.json({
        folder: relFolder,
        content: readFolder(relFolder)
    });
});

app.use('/api', router);

server.listen(3000, function () {
    console.log('Radar server listening on port 3000!')
});
