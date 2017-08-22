'use strict';

var path = require("path");
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var _ = require('lodash');
var zlib = require('zlib');

var lsiIndex = require('./server/lsiIndex');
var vector = require('./server/vectors');
var forceMgr = require('./server/forceMgr');

var router = express.Router();

var server = require('http').createServer(app);

var BASE_FOLDER = './data/OpenSpeedMonitor';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/', express.static(__dirname + '/client'));

var IGNORE_FILE_NAME = './ignore.txt';

var ignoreList;

var SUMMARY_FILENAME = '_.csv';
var FAKE_SUMMARY_FILENAME = '_SUMMARY_';
var VALUE_FILE_SUFFIX = '.utf8.csv';

function isSummaryFile(filename) {
    return filename == SUMMARY_FILENAME;
}

function isFakeSummaryFilePath(filePath) {
    return filePath.endsWith(FAKE_SUMMARY_FILENAME);
}

function isValueFile(filename) {
    return isSummaryFile(filename) || filename.endsWith(VALUE_FILE_SUFFIX);
}

function isDirectory(filename, absFolder) {
    return fs.lstatSync(path.join(absFolder, filename)).isDirectory();
}

function filterNonValueFiles(filesAndSubfolderNameList, absFolder) {
    return filesAndSubfolderNameList.filter(function(fileOrSubfolderName) {
        return isValueFile(fileOrSubfolderName) || isDirectory(fileOrSubfolderName, absFolder);
    });
}

function adaptValueFilename(filename) {
    if(isSummaryFile(filename)) {
        return FAKE_SUMMARY_FILENAME;
    }
    return filename.substr(0, filename.length - VALUE_FILE_SUFFIX.length);
}

function backAdaptValueFilePath(filePath) {
    if(isFakeSummaryFilePath(filePath)) {
        return filePath.substr(0, filePath.length - FAKE_SUMMARY_FILENAME.length) + SUMMARY_FILENAME;
    }
    return filePath + VALUE_FILE_SUFFIX;
}

function adaptNames(filesAndSubfolderNameList, absFolder) {
    return filesAndSubfolderNameList.map(function (fileOrSubfolderName) {
        if(isDirectory(fileOrSubfolderName, absFolder)) {
            return fileOrSubfolderName + "/";
        }
        else {
            return adaptValueFilename(fileOrSubfolderName);
        }
    });
}

function sortNonCaseSensitive(list) {
    return list.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
}

function readFolder(relFolder) {
    var absFolder = path.join(BASE_FOLDER, relFolder);
    var filesAndSubfolders = fs.readdirSync(absFolder);
    var onlyFoldersAndValueFiles = filterNonValueFiles(filesAndSubfolders, absFolder);
    return sortNonCaseSensitive(adaptNames(onlyFoldersAndValueFiles, absFolder));
}

function readContent(relPath) {
    var absPath = path.join(BASE_FOLDER, relPath);
    if(fs.existsSync(absPath)) {
        var content = fs.readFileSync(absPath, 'utf8');
        return content;
    }
    return "";
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

router.get('/index/*', function (req, res) {
    var relPath = req.originalUrl.substr("/api/index".length + 1);
    var entry = lsiIndex.getIndexEntry(relPath);

    res.json(entry);
});

router.get('/matrix', function (req, res) {
    var matrix = lsiIndex.readMatrixAndNodes();

    return res.json(matrix);
});

router.get('/corona/*', function (req, res) {
    var relPath = req.originalUrl.substr("/api/corona".length + 1).split("?")[0];
    var depth = req.query.depth;
    var corona = lsiIndex.getCorona(relPath, depth);
    res.json(corona);
});

router.get('/histogram/*', function (req, res) {
    var relPath = req.originalUrl.substr("/api/histogram".length + 1);
    var histo = vector.createHistoDataForFile(relPath);
    res.json(histo);
});

router.get('/cosineBetween/*', function (req, res) {
    var relPath = req.originalUrl.substr("/api/cosineBetween".length + 1).split("?")[0];
    var lower = req.query.lower;
    var upper = req.query.upper;
    var data = vector.getAllFilesWithCosineBetween(relPath, lower, upper);
    res.json(data);
});

router.get('/theWholeCloud/*', function (req, res) {
    var thresholdStr = req.originalUrl.substr("/api/theWholeCloud".length + 1);
    var threshold = Number(thresholdStr) / 100;
    var theCloud = vector.readTheCloud(threshold);
    res.json(theCloud);
});

router.post('/start', function (req, res) {
    var width = req.body.width;
    var height = req.body.height;
    var forceRefresh = req.body.forceRefresh;
    var thresholdStr = req.body.threshold;
    var threshold = Number(thresholdStr) / 100;

    var result = forceMgr.start(width, height, threshold, forceRefresh);

    res.json(result);
});

router.get('/getSvg/*', function (req, res) {
    var forceId = req.originalUrl.substr("/api/getSvg".length + 1);
    var svg = forceMgr.getSvg(forceId);

    res.json({svg: svg});
});

router.get('/nextSvgChunk/*', function (req, res) {
    var forceId = req.originalUrl.substr("/api/nextSvgChunk".length + 1);
    var chunkObj = forceMgr.nextSvgChunk(forceId, true);
    res.json(chunkObj);
});

router.get('/getNodesAndLinks/*', function (req, res) {
    var forceId = req.originalUrl.substr("/api/getNodesAndLinks".length + 1);
    var nodesAndLinks = forceMgr.getNodesAndLinks(forceId);

    res.json(nodesAndLinks);
});

router.get('/nextNodesAndLinksChunk/*', function (req, res) {
    var forceId = req.originalUrl.substr("/api/nextNodesAndLinksChunk".length + 1);
    var chunkObj = forceMgr.nextNodesAndLinksChunk(forceId, true);

    res.json(chunkObj);
});

router.get('/getNodes/*', function (req, res) {
    var forceId = req.originalUrl.substr("/api/getNodesAndLinks".length + 1);
    var nodesAndLinks = forceMgr.getNodesAndLinks(forceId);

    res.json({nodes: nodesAndLinks.nodes});
});

router.post('/stop/*', function (req, res) {
    var forceId = req.originalUrl.substr("/api/stop".length + 1);
    forceMgr.stop(forceId);

    res.json({stopped: forceId});
});

router.post('/remove/*', function (req, res) {
    var forceId = req.originalUrl.substr("/api/remove".length + 1);
    forceMgr.remove(forceId);

    res.json({removed: forceId});
});

router.get('/values/file/*', function (req, res) {
    var relFile = req.originalUrl.substr("/api/values/file".length + 1);
    var relFileAdapted = backAdaptValueFilePath(relFile);
    var content = readContent(relFileAdapted);
    var rows = content.split("\n");
    var values = {};
    var ctr = 0;
    rows.forEach(function(row) {
        var parts = row.split("\t");
        var key = parts[0];
        var value = parts[1];
        if(!isIgnored(key)) {
            if(ctr++ < 100) {
                values[key] = Math.round(value * 100);
            }
        }
    });
    res.json(values);
});

router.get('/ping', function (req, res) {
    res.send("pong");
});

router.get('/testzip', function (req, res) {
    var text = _.repeat('abcdef', 1e+3);
    var zipped = zlib.gzipSync(text);
    var base64 = zipped.toString('base64');

    res.json({
        len: base64.length,
        base64: base64
    });
});

ignoreList = readIgnore();

app.use('/api', router);

var port = process.argv.length > 2 ? process.argv[2] : 80;

server.listen(port, function () {
    console.log('text-analysis server is listening on ' + port)
});
