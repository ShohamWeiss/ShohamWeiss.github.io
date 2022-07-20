var arrayBuffer;

async function uploadNumpy() {
    var file = document.getElementById("file").files[0];
    // read file
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function() {
        arrayBuffer = reader.result;        
    }
    // set successfullUpload to visible
    // sleep for 2 seconds
    predSpinner = document.getElementById("readySpinner");
    predSpinner.hidden = false;
    await sleep(500);
    predSpinner.hidden = true;
    var successfullUpload = document.getElementById("successfullUpload");
    successfullUpload.hidden = false;
}


async function chooseAudio() {
    // get the selected radio button
    var selected = document.querySelector('input[name="audioOption"]:checked');
    var filename = selected.value;
    // read the file    
    arrayBuffer = await fetch("projects/emotion_detector/tensors/"+filename).then(response => response.arrayBuffer());        
    // get the brother element of the selected radio button
    var audio = selected.nextElementSibling;    
    var audioContainer = document.getElementById("audio-container");
    var audioCopy = audio.cloneNode(true);
    // remove the previous audio element
    if (document.getElementById("audio")) {
        document.getElementById("audio").remove();
    }
    audioCopy.id = "audio";
    audioContainer.appendChild(audioCopy);
    predSpinner = document.getElementById("readySpinner");
    predSpinner.hidden = false;
    // sleep for 2 seconds
    await sleep(500);
    predSpinner.hidden = true;
    var successfullUpload = document.getElementById("successfullUpload");
    successfullUpload.hidden = false;
}

// function to load the tf model
async function loadModel() {
    // loads the model
  model = await tf.loadLayersModel('projects/emotion_detector/TimeDestConv/model.json');
  
  // warm start the model. speeds up the first inference
  var inp = tf.zeros([1, 33, 240, 60, 1]);
  var inp = tf.cast(inp, dtype = 'float32');
  var y = model.apply(inp, {training: true});

  $('*[id*=spinner]').hide();
  
  return model
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// defines the model inference function
async function predictModel(){
  predicted = document.getElementById("predicted");
  predSpinner = document.getElementById("predictingSpinner");
  predSpinner.hidden = false;
  // sleep for 2 seconds
  await sleep(500);
  predSpinner.hidden = true;
  var prediction = 3;
  var tensor = await parse(arrayBuffer);
  prediction = await model.apply(tensor);
  // predictions to percentage
  predicted.hidden = false;
  percentages = tf.softmax(prediction);
  document.getElementById("predictedAngry").style.width = percentages.dataSync()[0]*100+"%";
  document.getElementById("predictedDisgust").style.width = percentages.dataSync()[1]*100+"%";
  document.getElementById("predictedFear").style.width = percentages.dataSync()[2]*100+"%";
  document.getElementById("predictedHappiness").style.width = percentages.dataSync()[3]*100+"%";
  document.getElementById("predictedNeutral").style.width = percentages.dataSync()[4]*100+"%";
  document.getElementById("predictedSad").style.width = percentages.dataSync()[5]*100+"%";
  predSpinner.hidden = true;
}

  // load the model
  var model = loadModel();