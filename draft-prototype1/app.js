//this file makes the server ?

var http = require('http');
var fs = require('fs');
var index = fs.readFileSync( 'prototype1.html');

const tf = require('@tensorflow/tfjs-node');
(async function() {
    const modelURL = `https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json`;
    const model = await tf.loadLayersModel(modelURL);
    model.summary();
})();

var SerialPort = require('serialport');
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
  delimiter: '\r\n'
});

var port = new SerialPort('COM3',{ 
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});

port.pipe(parser);

var app = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
});

var io = require('socket.io').listen(app);

io.on('connection', function(socket) {
    
  console.log('Node is listening to port');
    
});

parser.on('data', function(data) {
    
  console.log('Received data from port: ' + data);
  io.emit('data', data);
    
});

app.listen(3000);