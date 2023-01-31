var videoElement = document.getElementById('video');
var canvasElement = document.getElementById('canvas');
var canvasCtx = canvasElement.getContext('2d');

var hand  = new Hand();
var state = new HandStateHandler();

canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;

// load options navigator
optionsNavigator = new OptionsNavigator(options, addToSentence)
// create buttons
CreateButtons(optionsNavigator);

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      hand.update(landmarks);
      state.update(hand);
      // rgba of opacue blue
      showHand(canvasCtx, hand, "rgba(0, 0, 255, 1)");
      drawPoint(canvasCtx, state.HandCenterLocation(), "blue");
      showHandState(state);
    }
  }
  canvasCtx.restore();
}

function showHand(canvasCtx, hand) {
  for (let i = 0; i < hand.landmarks.length; i++) {
    const x = hand.landmarks[i].x * canvasElement.width;
    const y = hand.landmarks[i].y * canvasElement.height;
    drawPoint(canvasCtx, [x, y]);
  }
}

// draw points
function drawPoint(ctx, point, color) {
  ctx.beginPath();
  // in the middle of the canvas
  ctx.arc(point[0], point[1], 10, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.save();
}

// show text at bottom right on screen
function showHandState(state) {
  // get enum as string
  var gesture = state.getCurrentState()
  canvasCtx.font = "30px Arial";
  canvasCtx.fillStyle = "red";
  // reverse in the x direction
  canvasCtx.scale(-1, 1);
  canvasCtx.fillText(gesture, -canvasElement.width + 10, canvasElement.height - 10);
  canvasCtx.scale(-1, 1);
}


function init_hand_detection(params) {
  const hands = new Hands({locateFile: (file) => {
    console.log(`file: ${file}`);
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }});
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  hands.onResults(onResults);
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
  width: window.innerWidth,
  height: window.innerHeight
  });
  camera.start();
}

// main function
async function app() {
  await init_hand_detection();
}

app();