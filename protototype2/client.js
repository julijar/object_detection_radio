const video = document.getElementById("webcam");
const socket = io();
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");
const PlantSlider = document.getElementById("PlantSlider");
var output = document.getElementById("value");
var outputVarNo = document.getElementById("outputVar");

const AudioContext = window.AudioContext || window.webkitAudioContext; // for legacy browsers
const audioContext = new AudioContext(); //sound things
//sounds
const audioElement1 = document.getElementById("plantSound");
const audioElement2 = document.getElementById("plantSound2");
const radioStatic = document.getElementById("radioStatic");
const deepScan = document.getElementById("deepScanning");
const noise = document.getElementById("noise-interference");
const person = document.getElementById("person");
const beepScan = document.getElementById("beepScan");

audioElement1.loop = true;
audioElement2.loop = true;
radioStatic.loop = true;
deepScan.loop = true;
noise.loop = true;
person.loop = true;

// pass it into the audio context
/*
const track1 = audioContext.createMediaElementSource(audioElement1);
track1.connect(audioContext.destination);

const track2 = audioContext.createMediaElementSource(audioElement2);
track2.connect(audioContext.destination); */

//loop the sounds
audioElement1.loop = true;
radioStatic.loop = true;

// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will
// define in the next step.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Placeholder function for next step. Paste over this in the next step.
function enableCam(event) {}

// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }

  // Hide the button once clicked.
  event.target.classList.add("removed");

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true,
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

// Placeholder function for next step.
function predictWebcam() {}

// Pretend model has loaded so we can try out the webcam code.
// Store the resulting model in the global scope of our app.
var model = undefined;

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import so ignore any warning in Glitch.
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  // Show demo section now model is ready to use.
  demosSection.classList.remove("invisible");
});

var children = [];

//function for updating predictions
function updatePredictions() {
  window.requestAnimationFrame(predictWebcam);
}





function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      /* if (predictions[n].score > 0.6) {
       */

 let plantsDetected = predictions.filter(
  (predictions) => predictions.class == "potted plant"
  // && predictions.score > PlantSlider.value
);

      let update = () => (output.innerHTML = plantsDetected.length);
      update();

      audioElement1.volume = 0;
      audioElement2.volume = 0;
      radioStatic.volume = 0;
      deepScan.volume = 0;
      noise.volume = 0;
      person.volume = 0;
      beepScan.volume =0.4;

      radioStatic.play();
      audioElement1.play();
      audioElement2.play();
      deepScan.play();
      noise.play();
      person.play();

      if (plantsDetected.length == 1) {
        let x = Math.abs(
          PlantSlider.value - plantsDetected[0].score
          //    +(localStorage.getItem(score1Previous))/2)
        );
        radioStatic.volume = x / 4;

        z = 1 - 2 * x;
        if (z >= 0) {
          audioElement1.volume = z;
        } else if (z < 0) {
          audioElement1.volume = 0;
        }


      } else if (plantsDetected.length == 2) {
        let x = Math.abs(PlantSlider.value - plantsDetected[0].score);
        //play noise if the slider is close to one or other signal

        radioStatic.volume = x / 4;

        z = 1 - 2 * x;
        if (z >= 0) {
          audioElement1.volume = z;
        } else if (z < 0) {
          audioElement1.volume = 0;
        }

        let y = Math.abs(PlantSlider.value - plantsDetected[1].score);
        radioStatic.volume = x / 4;
        a = 1 - 2 * y;
        if (a >= 0) {
          audioElement2.volume = a;
        } else if (z < 0) {
          audioElement2.volume = 0;
        }

        if (10 < x < 15 && 10 < y < 15) {
          noise.volume = 0.5;
          noise.play();
         
        }
      } else if (predictions.class == "person") {
        person.volume = 0.5;
        person.play();
      } else {
        deepScan.volume = 0.4;
        deepScan.play();
        //  deepScan.volume = 0.3;
        setTimeout(function () {
          audioElement1.volume = 0;
          audioElement2.volume = 0;
          radioStatic.volume = 0;
          person.volume = 0;
          noise.volume = 0;
        }, 500);
      }
      // input from server/potentiometer
      socket.on("data", function (data) {
        // console.log(data);

    if (!isNaN(data) ) {
        //update slider value and update predictions as you move it  
     // updatePredictions();
        PlantSlider.value = data / 100;
 
        } 
        else  if (data=="button") {
          updatePredictions();
           beepScan.play();
          console.log("updating predictions...");
          output.innerHTML = "...scanning...";
        } 

    /*    if (data=="buttonSmall")  { 
          //  updatePredictions();
            PlantSlider.value==plantsDetected[1].score;
           // beepScan.play();
          }  */
      }
      );
    }

 

  // updatePredictions();

    // Call this function again to keep predicting when the browser is ready.
   //  setTimeout(window.requestAnimationFrame(predictWebcam), beepScan.play(), 30000);
  });
}
