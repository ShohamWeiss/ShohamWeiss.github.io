
class HandStateHandler {
    constructor() {
      this.handStateHistory = [Gesture.Neutral];
      this.hand;
    }
  
    update(hand) {
      this.hand = hand;
      if(this.HandIsClosed(hand))
      {
        if (this.getCurrentState() != Gesture.CLOSED_HAND)
        {
          // console.log(this.handStateHistory);
          this.handStateHistory.push(Gesture.CLOSED_HAND);
          var position = this.HandCenterLocation();
          Interact(position, ACTION_TYPES.SELECT);
        }
      }
      else if (this.IsMiddleThumbTouching(hand))
      {
        if (this.getCurrentState() != Gesture.MIDDLE_THUMB_TOUCHING)
        {
          // console.log(this.handStateHistory);
          this.handStateHistory.push(Gesture.MIDDLE_THUMB_TOUCHING);
          var position = this.HandCenterLocation();
          Interact(position, ACTION_TYPES.SPEAK);
        }
      }
      else if (this.IsShaka(hand))
      {
        if (![Gesture.SHAKA, Gesture.CLOSED_HAND].includes(this.getCurrentState()))
        {
          // console.log(this.handStateHistory);
          this.handStateHistory.push(Gesture.SHAKA);
          var position = this.HandCenterLocation();
          Interact(position, ACTION_TYPES.CLEAR);
        }
      }
      else if (this.IsSpiderMan(hand))
      {
        if (![Gesture.SPIDERMAN, Gesture.CLOSED_HAND].includes(this.getCurrentState()))
        {
          // console.log(this.handStateHistory);
          this.handStateHistory.push(Gesture.SPIDERMAN);
          var position = this.HandCenterLocation();
          Interact(position, ACTION_TYPES.BACK);
        }
      }
      else if (this.getCurrentState() != Gesture.NEUTRAL)
      {
        // console.log("hand is open");
        this.handStateHistory = [Gesture.NEUTRAL];
      }
    }
  
    // distance between two points in 3D space
    Distance(p1, p2) {
      return Math.hypot(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    }
  
    HandCenterLocation() {
      var selectingLocation = this.hand.landmarks[FingerTips.MIDDLE_FINGER_MCP];
      return [selectingLocation.x * canvasElement.width, selectingLocation.y * canvasElement.height];
    }
      
    HandIsClosed(hand) {
      // console.log("Checking if hand is open");
      return this.IsPinkyClosed(hand) && this.IsIndexFingerClosed(hand) && this.IsMiddleFingerClosed(hand);
    }

    IsMiddleThumbTouching(hand) {
      var middleThumbDistance = this.Distance(hand.landmarks[FingerTips.MIDDLE_FINGER_TIP],hand.landmarks[FingerTips.THUMB_TIP])/this.HandSize(hand);
      // console.log("middleThumbDistance",middleThumbDistance);
      if (middleThumbDistance < 0.3)
      {
        // console.log("middle thumb touching");
        return true;
      }
      return false;
    }
    
    IsShaka(hand) {
      return this.IsIndexFingerClosed(hand) && this.IsMiddleFingerClosed(hand) && !this.IsPinkyClosed(hand) && !this.IsThumbClosed(hand);
    }

    IsSpiderMan(hand) {
      return !this.IsIndexFingerClosed(hand) && this.IsMiddleFingerClosed(hand) && !this.IsPinkyClosed(hand) && !this.IsThumbClosed(hand);
    }

    IsPinkyClosed(hand) {
      var pinkyCloseDistance = this.Distance(hand.landmarks[FingerTips.PINKY_TIP],hand.landmarks[FingerTips.WRIST])/this.HandSize(hand);
      // console.log("pinkyCloseDistance",pinkyCloseDistance);
      if (pinkyCloseDistance < 2.4)
      {
        // console.log("pinky finger closed");
        return true;
      }
      return false;
    }

    IsThumbClosed(hand) {
      var thumbCloseDistance = this.Distance(hand.landmarks[FingerTips.THUMB_TIP],hand.landmarks[FingerTips.INDEX_FINGER_MCP])/this.HandSize(hand);
      // console.log("thumbCloseDistance",thumbCloseDistance);
      if (thumbCloseDistance < 0.8)
      {
        // console.log("thumb closed");
        return true;
      }
      return false;
    }

    IsIndexFingerClosed(hand) {
      var indexClosedDistance = this.Distance(hand.landmarks[FingerTips.INDEX_FINGER_TIP],hand.landmarks[FingerTips.INDEX_FINGER_MCP])/this.HandSize(hand);
      // console.log("indexClosedDistance",indexClosedDistance);
      if (indexClosedDistance < 0.9)
      {
        // console.log("index finger closed");
        return true;
      }
      return false;
    }

    IsMiddleFingerClosed(hand) {
      var middleClosedDistance = this.Distance(hand.landmarks[FingerTips.MIDDLE_FINGER_TIP],hand.landmarks[FingerTips.MIDDLE_FINGER_MCP])/this.HandSize(hand);
      // console.log("middleClosedDistance",middleClosedDistance);
      if (middleClosedDistance < 1)
      {
        // console.log("middle finger closed");
        return true;
      }
      return false;
    }
    
    HandSize(hand)
    {
      // average distance between all middle landmarks
      var totalDistance = 0;
      var middleLandmarks = [0,5,9,13,17]
      for (var i = 0; i < middleLandmarks.length; i++)
      {
        for (var j = i+1; j < middleLandmarks.length; j++)
        {
          totalDistance += this.Distance(hand.landmarks[middleLandmarks[i]],hand.landmarks[middleLandmarks[j]]);
        }
      }
      return totalDistance / (middleLandmarks.length * (middleLandmarks.length - 1) / 2);
    }

    HandStateChanged() {
      return this.currentState != this.lastState;
    }
    
    getCurrentState() {
      // last item in the list
      return this.handStateHistory[this.handStateHistory.length - 1];      
    }
  }

// class hand
class Hand {
  constructor() {
    this.landmarks = []
  }
  update(landmarks) {
    this.landmarks = landmarks
  }
}

const FingerTips = {
  WRIST:0,
  THUMB_CMC:1,
  THUMB_MCP:2,
  THUMB_IP:3,
  THUMB_TIP:4,
  INDEX_FINGER_MCP:5,
  INDEX_FINGER_PIP:6,
  INDEX_FINGER_DIP:7,
  INDEX_FINGER_TIP:8,
  MIDDLE_FINGER_MCP:9,
  MIDDLE_FINGER_PIP:10,
  MIDDLE_FINGER_DIP:11,
  MIDDLE_FINGER_TIP:12,
  RING_FINGER_MCP:13,
  RING_FINGER_PIP:14,
  RING_FINGER_DIP:15,
  RING_FINGER_TIP:16,
  PINKY_MCP:17,
  PINKY_PIP:18,
  PINKY_DIP:19,
  PINKY_TIP:20,
}
const Gesture = {
  CLOSED_HAND:"ClosedHand",
  NEUTRAL:"Neutral",
  MIDDLE_THUMB_TOUCHING:"MiddleThumbTouching",
  SHAKA:"Shaka",
  SPIDERMAN:"Spiderman"
  }