
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');


 //plant slider
var PlantSlider = document.getElementById("PlantSlider");
var PlantOutput = document.getElementById("PlantValue");
var PlantOutputVarNo = document.getElementById("PlantOutputVar");

let updatePlant = () => PlantOutput.innerHTML = PlantSlider.value* 100;
PlantSlider.addEventListener('input', updatePlant);
updatePlant();


// for legacy browsers
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// get the audio element
const audioElementHigh = document.getElementById('highSound');
const audioElementMid = document.getElementById('midSound');
const audioElementLow = document.getElementById('lowSound');
const audioElementSleeping = document.getElementById('sleepingSound');

// pass it into the audio context
const track = audioContext.createMediaElementSource(audioElementHigh);
track.connect(audioContext.destination);

//loop the sounds
audioElementHigh.loop = true; 
audioElementMid.loop = true;
audioElementLow.loop = true;
audioElementSleeping.loop = true; 


// volume
const gainNode = audioContext.createGain();

const volumeControl = document.querySelector('[data-action="volume"]');
volumeControl.addEventListener('input', function() {
	gainNode.gain.value = this.value;
}, false);


// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will 
  // define in the next step.
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
  
  // Placeholder function for next step. Paste over this in the next step.
  function enableCam(event) {
  }

  // Enable the live webcam view and start classification.
function enableCam(event) {
    // Only continue if the COCO-SSD has finished loading.
    if (!model) {
      return;
    }
    
    // Hide the button once clicked.
    event.target.classList.add('removed');  
    
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
  }

  // Placeholder function for next step.
function predictWebcam() {
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
  demosSection.classList.remove('invisible');
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

   

 // create an array of bananas detected
 let bananasDetected = predictions.filter(predictions => predictions.class == "banana" && predictions.score > BananaSlider.value );
 //console.log(bananasDetected);
 
 // create an array of plants detected
 let plantsDetected = predictions.filter(predictions => predictions.class == "potted plant" && predictions.score > PlantSlider.value);
 //console.log(plantsDetected);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
     /* if (predictions[n].score > 0.6) {
        document.body.style.backgroundColor = "white";
     */
       const p = document.createElement('p');

       
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

       liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p); 
        
    //} 





    if (plantsDetected.length > 0) {
      document.getElementById('PlantSliderDiv').style.color = "green";
     
      audioElementLow.volume  = plantsDetected[0].score;
    //  audioElementLow().volume = plantsDetected[n].score;
      audioElementLow.play();

     console.log(audioElementLow.volume );



    /*  this.dataset.playing = 'true'; */
    }
    else if (predictions[n].score > OrangeSlider.value && predictions[n].class=='orange') {
       document.getElementById('OrangeSliderDiv').style.color = "orange";
       audioElementMid.volume = predictions[n].score;
       audioElementMid.play();

       
     }
     else if (predictions[n].score > AppleSlider.value && predictions[n].class=='apple')
     {
     document.getElementById('AppleSliderDiv').style.color = "red";
     audioElementSleeping.volume = predictions[n].score;
     audioElementSleeping.play();
}
   else if ( bananasDetected.length > 0) {
     // indicate the bananas detected in the GUI
     document.getElementById('BananaSliderDiv').style.color = "yellow"; 
     //play sound for each banana
   //  audioElementHigh.volume = bananasDetected[n].value;  // set volume to 50%
     audioElementHigh.play();

     console.log('i see ' +  bananasDetected.length +' bananas!');
/*for (let i = 0; i <= bananasDetected.length; i++) {
  //  console.log(`${i}: ${bananasDetected[i]}`);
  /*setTimeout(function() {
    audioElementHight.play();
  }, 30*Math.random); 
  audioElementHight.play();
   //log how many bananas are detected 
    }*/

   } else {
      //  document.body.style.backgroundColor = "black";
      document.getElementById('PlantSliderDiv').style.color = "black";
      document.getElementById('AppleSliderDiv').style.color = "black";
      document.getElementById('OrangeSliderDiv').style.color = "black";
      document.getElementById('BananaSliderDiv').style.color = "black";    
      audioElementLow.pause();
      audioElementMid.pause();
      audioElementHigh.pause();
      audioElementSleeping.pause();

       /* audioElementSleeping.pause();
        audioElementHigh.pause();
        audioElementMid.pause();
        audioElementLow.pause(); */
        //this.dataset.playing = 'false';
      //  audioElementSleeping.play();
     }
  }

   
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });

}

/*    if (predictions[n].class='potted plant') {
      document.body.style.backgroundColor = "green";
      audioElementHigh.play();}
      else {
        document.body.style.backgroundColor = "white";
      }

 if (predictions[n].class='orange') {
      document.body.style.backgroundColor = "orange";
      audioElementMid.play();
    } else {
      document.body.style.backgroundColor = "white";
    } */