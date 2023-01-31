// enum of all action types
const ACTION_TYPES = {
    SELECT: 1,
    SPEAK: 2,
    BACK: 3,
    CLEAR: 4
};
// function to convert hand position and action to UI interactions
function Interact(position, action)
{
    // console.log("Interacted at", position, action);
    // if the action is select
    if (action == ACTION_TYPES.SELECT)
    {
        // select the button
        SelectButton(position);
    }
    if (action == ACTION_TYPES.SPEAK)
    {
        // speak the sentence
        Speak();
    }
    if (action == ACTION_TYPES.BACK)
    {
        // go back
        // console.log("Going back");
        optionsNavigator.Back();
        document.getElementById("optionsContainer").innerHTML = "";
        document.getElementById("parentOptionsContainer").innerHTML = "";
        CreateButtons(optionsNavigator);
    }
    if (action == ACTION_TYPES.CLEAR)
    {
        // clear the sentence
        document.getElementById("sentence").innerHTML = "";
    }
}

// function for selecting button
function SelectButton(position)
{
    // correct x position for reflection
    position[0] = canvasElement.width - position[0];
    // console.log("Selecting button at", position);
    // for all the buttons, check the distance from the button
    // if the distance is less than the radius, click the button
    // get all the buttons
    var buttons = document.getElementsByTagName("button");
    // for all the buttons
    for (var i = 0; i < buttons.length; i++)
    {
        // get the button
        var button = buttons[i];
        // get the button position
        var buttonPosition = button.getBoundingClientRect();
        // console.log("checking:",buttonPosition);
        // get the button center
        var buttonCenter = {
            x: buttonPosition.left + buttonPosition.width/2,
            y: buttonPosition.top + buttonPosition.height/2
        };
        // get the distance from the button center to the hand position
        var distance = Math.sqrt(Math.pow(buttonCenter.x - position[0], 2) + Math.pow(buttonCenter.y - position[1], 2));
        // if the distance is less than the radius
        if (distance < 100)
        {
            // click the button
            button.click();
        }
    }
}

// function for speaking button
function Speak()
{
    // console.log("Speaking");
    // get the text from the text box
    var text = document.getElementById("sentence").innerHTML;
    // speak the text
    var msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);
}