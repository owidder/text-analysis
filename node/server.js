var path = require("path");
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);


var latestRadarData;

app.use(cors());
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/client'));

server.listen(3002, function () {
    console.log('Radar server listening on port 3002!')
});


io.on('connection', function (socket) {
    console.log('a user connected');
    socket.emit('initalItems', latestRadarData);

    socket.on('itemsUpdate', function (items) {
        console.log('received item update from client:');
        console.log(items);
        latestRadarData = items;
        socket.broadcast.emit('refreshItems', items);
    });

    socket.on('reset', function() {
        console.log('received reset request');
        socket.broadcast.emit('reset');
    })
});
