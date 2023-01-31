var canvasBoundingRect = null;

// function to add buttons to the optionsContainer div
function CreateButtons(optionsNavigator){
    // console.log(optionsNavigator)
    // optionsContainer
    optionsContainer = document.getElementById("optionsContainer")
    // angleStep split 100 degress to descrete steps based on num of buttons
    angleStep = 180 / (Object.keys(optionsNavigator.Options()).length + 1);
    angle = -angleStep;  
    // radius of the circle proportional to window width
    radius = window.innerWidth/3;
    // get canvas center
    if (!canvasBoundingRect)
    {
        canvasBoundingRect = document.getElementById("canvas").getBoundingClientRect();
    }
    center = {
        x: canvasBoundingRect.left + canvasBoundingRect.width/2,
        y: canvasBoundingRect.top + canvasBoundingRect.height/2 + radius/2 + 100
    }
    buttonHeight = 100;
    buttonWidth = 100;
    // for each key in optionsNavigator add a button to optionsContainer
    for (key in optionsNavigator.Options()){
      // create a button
      var button = document.createElement("button");
      // set class to btn
      button.className = "btn btn-primary m-2";
      // set the button text
      button.innerHTML = key;
      // set button size
      button.style.width = buttonWidth;
      button.style.height = buttonHeight;
      // set the button position to angle position
      button.style.position = "absolute";
      // put the center of the button in the position
      button.style.left = getPointInCircle(center, radius, angle).x + "px";
      button.style.top = getPointInCircle(center, radius, angle).y + "px";
    //   console.log(button.style.left, button.style.top);
      angle -= angleStep;
    //   console.log(angle);
      // add a click event listener to the button
      button.addEventListener ("click", function() {
        // Navigate to the button text
        optionsNavigator.Navigate(this.innerHTML);
        // clear the optionsContainer div
        document.getElementById("optionsContainer").innerHTML = "";
        // clear the parentOptionsContainer div
        document.getElementById("parentOptionsContainer").innerHTML = "";
        // create buttons
        CreateButtons(optionsNavigator);
      });
      // add the button to the optionsContainer div
      document.getElementById("optionsContainer").appendChild(button);
    }

    // // create back button
    // var backButton = document.createElement("button");
    // // set class to btn
    // backButton.className = "btn btn-secondary mx-5";
    // // set the button text
    // backButton.innerHTML = "Back";
    // // set button size
    // backButton.style.width = "200px";
    // backButton.style.height = "100px";
    // backButton.addEventListener ("click", function() {
    //     optionsNavigator.Back();
    //     document.getElementById("optionsContainer").innerHTML = "";
    //     document.getElementById("parentOptionsContainer").innerHTML = "";
    //     CreateButtons(optionsNavigator);
    // });    
    // document.getElementById("parentOptionsContainer").appendChild(backButton);

    // for each parent option add a button to parentOptionsContainer
    for (key in optionsNavigator.ParentOptions()){
        // create a button
        var button = document.createElement("button");
        // set class to btn
        button.className = "btn btn-primary mx-5";
        // set the button text
        button.innerHTML = key;
        // set button size
        button.style.width = "200px";
        button.style.height = "100px";
        button.addEventListener ("click", function() {
            // Navigate to the button text
            optionsNavigator.ParentNavigate(this.innerHTML);
            // clear the optionsContainer div
            document.getElementById("optionsContainer").innerHTML = "";
            // clear the parentOptionsContainer div
            document.getElementById("parentOptionsContainer").innerHTML = "";
            // create buttons
            CreateButtons(optionsNavigator);
        });
        // add the button to the optionsContainer div
        document.getElementById("parentOptionsContainer").appendChild(button);
    }
    
    // // create speak button
    // var speakButton = document.createElement("button");
    // // set class to btn
    // speakButton.className = "btn btn-success mx-5";
    // // set the button text
    // speakButton.innerHTML = "Speak";
    // // set button size
    // speakButton.style.width = "200px";
    // speakButton.style.height = "100px";
    // speakButton.addEventListener ("click", function() {
    //     // get sentece button
    //     var sentenceButton = document.getElementById("sentence");
    //     // get the text from the sentence button
    //     var sentence = sentenceButton.innerHTML;
    //     // speak the current directory
    //     Speak(sentence);
    //     }
    // );
    // document.getElementById("parentOptionsContainer").appendChild(speakButton);

    // // create clear button
    // var clearButton = document.createElement("button");
    // // set class to btn
    // clearButton.className = "btn btn-danger mx-5";
    // // set the button text
    // clearButton.innerHTML = "Clear";
    // // set button size
    // clearButton.style.width = "200px";
    // clearButton.style.height = "100px";
    // clearButton.addEventListener ("click", function() {
    //     // get sentece button
    //     var sentenceButton = document.getElementById("sentence");
    //     // get the text from the sentence button
    //     var sentence = sentenceButton.innerHTML;
    //     // speak the current directory
    //     sentenceButton.innerHTML = "";
    //     }
    // );
    // document.getElementById("parentOptionsContainer").appendChild(clearButton);
  }
// function to get a point in a semi-circle
function getPointInCircle(center, radius, angle){
// convert angle to radians
angle = angle * Math.PI / 180;
return {
    x: center.x + radius * Math.cos(angle) - buttonWidth/2,
    y: center.y + radius * Math.sin(angle) - buttonHeight/2
};
}
// function to speak a sentence
function Speak(sentence){
    // create a new SpeechSynthesisUtterance object
    var utterance = new SpeechSynthesisUtterance(sentence);
    // set the voice to the first voice in the voices array
    utterance.voice = speechSynthesis.getVoices()[0];
    // speak the sentence
    speechSynthesis.speak(utterance);
}

//function to add to the sentece
function addToSentence(word)
{
    // get the sentence button
    var sentenceButton = document.getElementById("sentence");
    // get the text from the sentence button
    var sentence = sentenceButton.innerHTML;
    // add the word to the sentence
    sentence += " " + word;
    // set the sentence button text to the new sentence
    sentenceButton.innerHTML = sentence;
}