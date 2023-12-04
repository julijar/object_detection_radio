const video = document.getElementById("webcam");
const socket = io();
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const loadModelButton = document.getElementById("loadModel");
const enableWebcamButton = document.getElementById("webcamButton");
const playStateButton = document.getElementById("playStateButton");
const PlantSlider = document.getElementById("PlantSlider");
const stabilizingSlider = document.getElementById("stabilizingSlider");
const PlantStationsMarkers = document.querySelectorAll(
  "#PlantStationsMarkers li"
);

const AudioContext = window.AudioContext || window.webkitAudioContext; // for legacy browsers
const audioContext = new AudioContext(); //sound things

let predictionActive = false;

//sounds
const deepScan = document.getElementById("deepScanning");
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
];

let volumeState = [0, 0, 0];
// Store the resulting model in the global scope of our app.
let model;

// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    console.log("no model");
    return;
  }

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true,
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", function () {
      startSounds();
      togglePlayState(true);
    });
    event.target.classList.add("removed");
  });
}

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment
// to get everything needed to run.
async function loadModel() {
  return await cocoSsd.load().then(
    function (loadedModel) {
      // Show demo section now model is ready to use.
      console.log("Model loaded");
      demosSection.classList.remove("invisible");
      return loadedModel;
    },
    function (error) {
      console.error(error);
      return false;
    }
  );
}

function togglePlayState(state = !predictionActive) {
  predictionActive = state;
  console.log("new state:", predictionActive);
  if (predictionActive) {
    loop();
  }
}

function startSounds() {
  deepScan.volume = 0;
  deepScan.loop = true;
 // deepScan.play();
  person.volume = 0;
  person.loop = true;
  person.play();

  static.forEach(function (el) {
    el.volume = 0;
    el.loop = true;
    el.play();
  });
  plantSounds.forEach(function (el) {
    el.volume = 0;
    el.loop = true;
    el.play();
  });
}

function interpolateVolume(oldVol, targetVol, friction) {
  const diff = Math.max(targetVol, 0) - Math.max(oldVol, 0);
  const newVol = Math.max(oldVol + diff * friction, 0);
  return newVol;
}

async function loop() {
  const predictions = await model
    .detect(video)
    .then((predictions) => predictions);
  const plantsDetected = predictions.filter(
    (prediction) => prediction.class == "potted plant"
  );
  const peopleDetected = predictions.filter(
    (prediction) => prediction.class == "person"
  );
  const friction = stabilizingSlider.value;

  document.getElementById("predictionCount").innerHTML = plantsDetected.length;

  if (plantsDetected.length) {
    deepScan.volume = interpolateVolume(deepScan.volume, 0, friction);
  } else {
    deepScan.volume = interpolateVolume(deepScan.volume, 0.4, friction);
  }

  for (let i = 0; i < 3; i++) {
    const plant = plantsDetected[i];
    let targetVolume = 0;
    let plantPosition = "-100%";

    if (plant) {
      const sliderDistance = Math.abs(PlantSlider.value - plant.score);
      targetVolume = 1 - 2 * sliderDistance; // set "prediction volume"
      plantPosition = plant.score * 100 + "%";
    }

    PlantStationsMarkers[i].style.left = plantPosition;
    let newVolume = interpolateVolume(
      plantSounds[i].volume,
      targetVolume,
      friction
    );

    static[i].volume = 1 - newVolume;
    plantSounds[i].volume = newVolume; // set volume
  }

  let personTargetVolume = 0;
  if (peopleDetected.length) {
    personTargetVolume = 0.5;
  }
  const personVolume = interpolateVolume(
    person.volume,
    personTargetVolume,
    friction
  );
  console.log(personVolume);
  person.volume = personVolume;

  if (predictionActive) {
    setTimeout(loop, 100); // Slowed it down a bit
    // window.requestAnimationFrame(loop);
  }
}

function init() {
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    console.warn("getUserMedia() is not supported by your browser");
    return;
  }

  loadModelButton.addEventListener("click", async function (ev) {
    model = await loadModel();
    ev.target.classList.add("removed");
  });

  enableWebcamButton.addEventListener("click", enableCam);

  playStateButton.addEventListener("click", function (ev) {
    togglePlayState();
  });

  // start listening to input from server/potentiometer
  socket.on("data", function (data) {
    // console.log(data);
    if (!isNaN(data)) {
      //if data is coming from 1st potentiometer
      if (data < 101) { PlantSlider.value = data / 100;
      //if data is coming from another potentiometer (i added 1000 to in in arduino code to distinguish it from the 1st potentiometer)
         }   else if (data >= 1000) {
        //stabilizingSlider.value = (data-1000)/100;
        stabilizingSlider.value = (data - 1000) / 100;
      }
    }
  });

  startSounds();
}

init();
