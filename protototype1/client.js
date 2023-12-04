const video = document.getElementById("webcam");
const socket = io();
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");
const PlantSlider = document.getElementById("PlantSlider");
const AudioContext = window.AudioContext || window.webkitAudioContext; // for legacy browsers
const audioContext = new AudioContext(); //sound things
const audioElement1 = document.getElementById("plantSound");
const audioElement2 = document.getElementById("radioStatic");

audioElement1.volume = 0.5;
audioElement2.volume = 0.5;

// input from server/potentiometer
socket.on("data", function (data) {
  console.log(data);
  PlantSlider.value = data / 100;
});

// pass it into the audio context
/*
const track1 = audioContext.createMediaElementSource(audioElement1);
track1.connect(audioContext.destination);

const track2 = audioContext.createMediaElementSource(audioElement2);
track2.connect(audioContext.destination); */

//loop the sounds
audioElement1.loop = true;
audioElement2.loop = true;

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

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // create an array of plants detected
    let plantsDetected = predictions.filter(
      (predictions) =>
        predictions.class == "potted plant" &&
        predictions.score > PlantSlider.value
    );
    //console.log(plantsDetected);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      /* if (predictions[n].score > 0.6) {
         document.body.style.backgroundColor = "white";
      */
      //const p = document.createElement("p");

      /*  p.innerText =
        predictions[n].class +
        " - with " +
        Math.round(parseFloat(predictions[n].score) * 100) +
        "% confidence.";
      p.style =
        "margin-left: " +
        predictions[n].bbox[0] +
        "px; margin-top: " +
        (predictions[n].bbox[1] - 10) +
        "px; width: " +
        (predictions[n].bbox[2] - 10) +
        "px; top: 0; left: 0;";

      const highlighter = document.createElement("div");
      highlighter.setAttribute("class", "highlighter");
      highlighter.style =
        "left: " +
        predictions[n].bbox[0] +
        "px; top: " +
        predictions[n].bbox[1] +
        "px; width: " +
        predictions[n].bbox[2] +
        "px; height: " +
        predictions[n].bbox[3] +
        "px;";

      liveView.appendChild(highlighter);
      liveView.appendChild(p);
      //dont show the bounding boxes
      children.push(highlighter);
      children.push(p); */


   


      if (plantsDetected.length > 0 ) {
        let x = Math.abs(PlantSlider.value - plantsDetected[0].score);
        //    document.getElementById('PlantSliderDiv').style.color = "green";
           // audioElementLow.volume  = plantsDetected[0].score;
          //  audioElementLow().volume = plantsDetected[n].score;
       if (x<0.15)  { 
         
        audioElement1.play();
          audioElement2.pause();
          /*  this.dataset.playing = 'true'; */
       }
           else if  (x>0.15
            ) {
              audioElement1.pause();
              audioElement2.play();
         }} else {
          audioElement1.pause();  
          audioElement2.pause();
           
    }
  }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}
