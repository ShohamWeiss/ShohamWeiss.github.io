var searchModel;
var passage;
$(document).ready(function() {
    $('body').show();
    /* ======= Isotope plugin ======= */
    /* Ref: http://isotope.metafizzy.co/ */
    // init Isotope    
    var $container = $('.isotope');

    if ($container != null) {
        $container.imagesLoaded(function() {
            $('.isotope').isotope({
                itemSelector: '.isotope-item',
                layoutMode: 'fitRows',
            });
        });
    }
    
    // filter items on click
    $('#filters').on('click', '.type', function() {
        var filterValue = $(this).attr('data-filter');
        $container.isotope({ filter: filterValue });
    });
    
    // change is-checked class on buttons
    $('.filters').each(function(i, typeGroup) {
        var $typeGroup = $(typeGroup);
        $typeGroup.on('click', '.type', function() {
            $typeGroup.find('.active').removeClass('active');
            $(this).addClass('active');
        });
    });
});

function fillModal(a) {
    // var title = document.getElementsByClassName('card-title')[a].textContent;
    // var summary = document.getElementsByClassName('card-text')[a].textContent;
    // document.getElementsByClassName('modal-title')[0].innerHTML = title;
    // document.getElementsByClassName('modal-body')[0].innerHTML = summary;
}

function showAcademic() {
    document.getElementById("acadbtn").hidden = true;
    document.getElementById("profbtn").hidden = false;
    document.getElementById("prof").hidden = true;
    document.getElementById("acad").hidden = false;
    document.body.style.background = "#323639";
}

function showProfessional() {
    document.getElementById("acadbtn").hidden = false;
    document.getElementById("profbtn").hidden = true;
    document.getElementById("prof").hidden = false;
    document.getElementById("acad").hidden = true;
    document.body.style.background = "#F7F8FA";
}

async function answerQuestion() {
    // make spinner visible
    document.getElementById("answerbox").hidden = true;
    document.getElementById("spinner").hidden = false;
    if (searchModel == null) {
            qna.load().then(model => {
                // Find the answers
                searchModel = model;
            // make answerbox visible
            passage = document.body.innerText;
            // load the aboutme.txt file
            var client = new XMLHttpRequest();
            client.open('GET', 'aboutme.txt');
            client.onreadystatechange = function() {
                passage += client.responseText;
                runSearchInference()
            }
            client.send();
        });
    } else {
        runSearchInference()
    }

}

function runSearchInference()
{
    var question = document.getElementById("question").value;
    // Find the answers
    searchModel.findAnswers(question, passage).then(answers => {
        if (answers.length == 0) {
            // Show the answers
            document.getElementById("answer").innerHTML = "No answer found. Try rephrasing.";
        } else {
            console.log('Answers: ', answers);
            document.getElementById("answer").innerHTML = answers[0]['text'];
        }
        document.getElementById("answerbox").hidden = false;
        document.getElementById("spinner").hidden = true;
    });
}

function allowEnter() {
    // when clicking enter while typing in the question input, click on the searchButton
    document.getElementById("question").addEventListener("keypress", function(event) {
        if (event.key == "Enter") {
            event.preventDefault();
            document.getElementById("searchButton").click();
        }
    });
}