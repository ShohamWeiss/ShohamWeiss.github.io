// var canvas = document.getElementById("");
var canvas = document.querySelector('[id*="canvas"]');
var ctx = canvas.getContext('2d');

var dragging = false;
var pos = { x: 0, y: 0 };


// define event listeners for both desktop and mobile

// nontouch
canvas.addEventListener('mousedown',  engage);
canvas.addEventListener('mousedown',  setPosition);
canvas.addEventListener('mousemove',  draw);
canvas.addEventListener('mouseup', disengage);

// touch_
canvas.addEventListener('touchstart', engage);
canvas.addEventListener('touchmove', setPosition);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', disengage);

// detect if it is a touch device
function isTouchDevice() {
  return (
    (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0))
  );
}


// define basic functions to detect click / release
function engage() {
  dragging = true;
};

function disengage() {
  dragging = false;
};


// get the new position given a mouse / touch event
function setPosition(e) {
  if (e.touches !== undefined) {
  	var touch = e.touches[0];
  	pos.x = touch.clientX - getOffset(ctx.canvas).left;
  	pos.y = touch.clientY - getOffset(ctx.canvas).top;
  } else {
	  pos.x = e.clientX - getOffset(ctx.canvas).left;
  	pos.y = e.clientY - getOffset(ctx.canvas).top;
  }
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top
  };
}

// draws a line in a canvas if mouse is pressed
function draw(e) {
  
  e.preventDefault();
  e.stopPropagation();

  // to draw the user needs to be engaged (dragging = True)
  if (dragging) {

    // begin drawing
    ctx.beginPath();
  
    // attributes of the line

    // get line width from slider
    var lineWidth = document.getElementById("slider").value;
    ctx.lineWidth = lineWidth;

    // get line color from color picker
    // var lineColor = document.getElementById("color").value;
    ctx.strokeStyle = "black";
    
    ctx.lineCap = 'round';
    // get current position, move to new position, create line from current to new
    ctx.moveTo(pos.x, pos.y);
    setPosition(e);
    ctx.lineTo(pos.x, pos.y);

    // draw
    ctx.stroke();
  }
}

// clear canvas
function erase() {
  // fill canvas with white rectable
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function confirm() {
  canvas = document.getElementById("canvas");
  var before = document.getElementById("image");
  var ctx = before.getContext("2d");
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
}

// defines a TF model load function
async function loadModel(){	
  	
  // loads the model  
  model = await tf.loadLayersModel('projects/image_colorization/model/model.json');
  var inp = tf.zeros([1, 256, 256, 3]);
  var inp = tf.cast(inp, dtype = 'float32');
  var y = model.apply(inp, {training: true});
  $('*[id*=spinner]').hide();
  return model
}


// gets an image tensor from a canvas
function getData(){
  image = document.getElementById("image");
  tensor = tf.browser.fromPixels(image, numChannels = 3);
  return tensor;
}

// defines the model inference functino
async function predictModel(){
    
  // // gets image data
  imageData = getData();
  // pre-process image
  imageData = tf.image.resizeBilinear(imageData, [256,256]).expandDims(0).div(tf.scalar(255));
  imageData = tf.cast(imageData, dtype = 'float32');
  
  predicted = document.getElementById("predicted");

  // gets model prediction
  var y = await model.apply(imageData, {training: true});
  tf.browser.toPixels(tf.image.resizeBilinear(tf.squeeze(y),[predicted.width,predicted.height]).add(1).div(2).mul(255).cast('int32'),predicted);
}

// upload image and save and display on image
function uploadImage(){
  var file = document.getElementById("file").files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var dataURL = reader.result;
    // resize image width to 500
    var image = new Image();
    image.src = dataURL;
    image.onload = function() {
      var canvas = document.getElementById("image");
      var ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
    // var image = document.getElementById("image");
    // image.src = dataURL;
  }
  reader.readAsDataURL(file);
}

// function for selecting image from options
function selectImage(img_id){
  selected = document.getElementById(img_id);
  var before = document.getElementById("image");
  var ctx = before.getContext("2d");
  ctx.drawImage(selected, 0, 0, before.width, before.height);
  // get parent of selected image
  var parent = selected.parentElement;
  // make border blue
  parent.style.border = "2px solid blue";
  // get all brother elements
  var brothers = parent.parentElement.parentElement.children;
  // make all border black
  for (var i = 0; i < brothers.length; i++) {
    // except the selected image
    if (brothers[i].children[0].children[0].id != img_id) {
      brothers[i].children[0].style.border = "2px solid black";
    }
  }  
}

// loads the model
var model = loadModel();
// let worker = new Worker('loadModel();');
erase();