'use strict';

var path = require("path");
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var lsiIndex = require('./server/lsiIndex');

var router = express.Router();

var server = require('http').createServer(app);

var BASE_FOLDER = './data/erpnext';

app.use(cors());
app.use(bodyParser.json());
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

router.get('/index/*', function (req, res) {
    var relPath = req.originalUrl.substr("/api/index".length + 1);
    var entry = lsiIndex.getIndexEntry(relPath);

    res.json(entry);
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

ignoreList = readIgnore();

app.use('/api', router);

server.listen(3100, function () {
    console.log('text-analysis server is listening on 3100!')
});
