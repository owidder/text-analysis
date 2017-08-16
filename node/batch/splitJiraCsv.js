var fs = require('fs');
var _ = require('lodash');

var currentTicketNo;
var tickets = {};

var BASE_FOLDER = "/Users/owidder/dev/iteragit/nge/python/OpenSpeedMonitor/jira";
var OUT_FOLDER = BASE_FOLDER + "/tickets";

function pathForTicket(ticketNo) {
    var folderName = String(ticketNo).substr(0, 2);
    var folderPath = OUT_FOLDER + "/" + folderName;
    if(!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    return folderPath + "/" + ticketNo + ".txt";
}

function writeTicket(ticketNo, lines) {
    if(!_.isEmpty(currentTicketNo) || currentTicketNo > 0) {
        console.log("write: " + ticketNo);
        var path = pathForTicket(ticketNo);
        fs.writeFileSync(path, "");
        lines.forEach(function (line) {
            fs.appendFileSync(path, line);
            fs.appendFileSync(path, "\n");
        })
    }
}

function addToCurrentTicket(text) {
    if(_.isEmpty(tickets[currentTicketNo])) {
        tickets[currentTicketNo] = [];
    }

    tickets[currentTicketNo].push(text);
}

function readLine(line) {
    var newTicketRegex = /^(\d{5,6})\t(.*)$/;
    var ticketNo, matches;
    if(newTicketRegex.test(line)) {
        matches = line.match(newTicketRegex);
        ticketNo = Number(matches[1]);
        currentTicketNo = ticketNo;
        addToCurrentTicket(matches[2]);
    }
    else {
        addToCurrentTicket(line);
    }
}

function readFile(filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var lines = content.split("\n");
    lines.forEach(function (line) {
        readLine(line);
    });
}

function writeFiles() {
    _.forOwn(tickets, function (lines, ticketNo) {
        writeTicket(ticketNo, lines);
    })
}

readFile(BASE_FOLDER + "/jira-20170727.txt");
writeFiles();

process.exit(0);