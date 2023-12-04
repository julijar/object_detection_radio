const video = document.getElementById("webcam");
const socket = io();
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");
const PlantSlider = document.getElementById("PlantSlider");
const stabilizingSlider = document.getElementById("stabilizingSlider");
var output = document.getElementById("value");
var outputVarNo = document.getElementById("outputVar");

const AudioContext = window.AudioContext || window.webkitAudioContext; // for legacy browsers
const audioContext = new AudioContext(); //sound things

//sounds
const deepScan = document.getElementById("deepScanning");
const noise = document.getElementById("noise-interference");
const person = document.getElementById("person");
const beepScan = document.getElementById("beepScan");

const static = [
  document.getElementById("radioStatic1"),
  document.getElementById("radioStatic2"),
  document.getElementById("radioStatic3"),
];
const plantSounds = [
  document.getElementById("plantSound1"),
  document.getElementById("plantSound2"),
  document.getElementById("plantSound3"),
]


function silent() {
  volume= 0;
}

deepScan.loop = true;
noise.loop = true;
person.loop = true;
static[0].loop=true;
static[1].loop=true;
static[2].loop=true;
plantSounds[0].loop=true;
plantSounds[1].loop=true;
plantSounds[2].loop=true;

let volumeState = [
  0,0,0,
]

let friction;



// pass it into the audio context
/*
const track1 = audioContext.createMediaElementSource(audioElement1);
track1.connect(audioContext.destination);

const track2 = audioContext.createMediaElementSource(audioElement2);
track2.connect(audioContext.destination); */



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


    // input from server/potentiometer
    socket.on("data", function (data) {
      // console.log(data);
   if (data) {
      //if data is coming from 1st potentiometer
     if (data<101)
      PlantSlider.value = data / 100;
      } 
      //if data is coming from another potentiometer (i added 1000 to in in arduino code to distinguish it from the 1st potentiometer)
    else  if (data>=1000) {
        //stabilizingSlider.value = (data-1000)/100;
        stabilizingSlider.value = (data-1000)/100; 
      }
    }
    )  


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
 
      let plantsDetected = predictions.filter(
        (predictions) => predictions.class == "potted plant"
        // && predictions.score > PlantSlider.value
      );

      let update = () => (output.innerHTML = plantsDetected.length);
      update();


 //   plantSounds.forEach(silent);
   //   static.forEach(silent);
      deepScan.volume = 0.4;
      noise.volume = 0;
      person.volume = 0;
      beepScan.volume =0.4;

      deepScan.play();
      noise.play();
      person.play();


      static[0].volume=0;
      static[1].volume=0;
      static[2].volume=0;
      static[0].play();
    static[1].play();
    static[2].play();
 
    plantSounds[0].volume=0;
    plantSounds[1].volume=0;
    plantSounds[2].volume=0;
    plantSounds[0].play();
    plantSounds[1].play();
    plantSounds[2].play();



    
 

   // friction= stabilizingSlider.value;

   // document.getElementById("PlantStationsDiv").style.color="white";
    if (plantsDetected.length==1) {
      deepScan.volume = 0;  
      let x = Math.abs(
          PlantSlider.value - plantsDetected[0].score
                  );
                //  static[0].volume = x / 4;

        let targetVolume = 1 - 2 * x; // set "prediction volume"
        let newVolume = (volumeState[0] + (targetVolume*stabilizingSlider.value))/2;
        static[0].volume = 1-newVolume;
        if (static[0].volume<0){
          static[0].volume = 0;
        }
     //   let newVolume = volumeState[0] + ((volumeState[0] - targetVolume) * friction); // calculate new volume based on old and friction
        if (newVolume <= 0) {
          newVolume = 0; // clamp volume so it does not go under 0
        }
        plantSounds[0].volume = newVolume; // set volume
        volumeState[0] = newVolume; // save volume for next loop   
        console.log("new volume "+newVolume);

        if (predictions[0].class == "person") {
          person.volume = 0.5;
        }

let station1;
         station1 = "plantsDetected[0].score*100";
        document.getElementById("stationOne").style.marginLeft="station1"+"%";
        document.getElementById("stationOne").style.height="20px";
        document.getElementById("stationOne").style.backgroundColor="green";

    }
   else if (plantsDetected.length==2) {
      deepScan.volume = 0;  
      let x = Math.abs(
          PlantSlider.value - plantsDetected[0].score
                  );

        let targetVolume = 1 - 2 * x; // set "prediction volume"
        let newVolume = (volumeState[0] + (targetVolume*stabilizingSlider.value))/2;
        static[0].volume = 1-newVolume;
     //   let newVolume = volumeState[0] + ((volumeState[0] - targetVolume) * friction); // calculate new volume based on old and friction
        if (newVolume <= 0) {
          newVolume = 0; // clamp volume so it does not go under 0
        }
        plantSounds[0].volume = newVolume; // set volume
        volumeState[0] = newVolume; // save volume for next loop   
        console.log("new volume "+newVolume);

        
//2nd plant
        let y = Math.abs(
          PlantSlider.value - plantsDetected[1].score
                  );

        let targetVolume2 = 1 - 2 * y; // set "prediction volume"
        let newVolume2 = (volumeState[y] + (targetVolume2*stabilizingSlider.value))/2;
        static[1].volume = Math.round(1-newVolume2)/100;
     //   let newVolume = volumeState[0] + ((volumeState[0] - targetVolume) * friction); // calculate new volume based on old and friction
        if (newVolume2 <= 0) {
          newVolume2 = 0; // clamp volume so it does not go under 0
        }
        plantSounds[1].volume = newVolume; // set volume
        volumeState[1] = newVolume; // save volume for next loop   
        console.log("new volume 2 "+newVolume2);


       
       if ( x < 15 &&  y < 15) {
        noise.volume = Math.abs(1-(x-y));
       console.log("noise vol"+noise.volume)
      }
      if (predictions[0].class == "person") {
        person.volume = 0.5;
      }

    }

 else  if (plantsDetected.length==0) {
  
  setTimeout(checkStatus, 200);
  
function checkStatus(){
  if(plantsDetected.length==0){
    let timesGood = 0; 
    timesGood++;
    //control how long to wait before switching to not detecting plants by friction
      if(timesGood >= 75*stabilizingSlider.value){
          // Code here for condition met for 7.5 seconds.
          static[0].volume=0;
    plantSounds[0].volume=0;  
    plantSounds[1].volume=0;  
      deepScan.volume = 0.4;
      }
  } else{
      timesGood = 0;
      deepScan.volume = 0;
  } 
 // setTimeout(checkStatus, 200);
}

}  
  
    
    }


   updatePredictions();
  });
  
    
    
}


/*function loop() {
  
}*/