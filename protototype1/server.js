//this file makes the server ? Yes
var SerialPort = require("serialport");
var static = require("node-static");
var http = require("http");
var fs = require("fs");
var socket = require("socket.io");

var file = new static.Server(__dirname);

var app = http.createServer(function (req, res) {
  file.serve(req, res);
});

// This is just some kind of test, right? No need to load the model or tensorflow on the server. You are using it in the browser.
// const tf = require('@tensorflow/tfjs-node');
// (async function() {
//     const modelURL = `https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json`;
//     const model = await tf.loadLayersModel(modelURL);
//     model.summary();
// })();

const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
  delimiter: "\r\n",
});

// This breaks if you don't have an arduino connected
 var port = new SerialPort("COM5", {
   baudRate: 9600,
   dataBits: 8,
   parity: "none",
   stopBits: 1,
   flowControl: false,
 });

 port.pipe(parser);

var io = socket.listen(app);
io.on("connection", function (socket) {
  console.log("Node is listening to port");
});
parser.on("data", function (data) {
  console.log("Received data from port: " + data);
  io.emit("data", data);
});

app.listen(3000);
