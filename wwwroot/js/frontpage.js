var ticketTypesLabel = [];
var passengersComposition = [];
var tTypeDropdownDisplaying = false;

$(function () {
    preventEnterKey();
    getStops();
    getTicketTypes();
    createDateSelector();
});

// Prevent enter-key from submitting form
function preventEnterKey() {
    $("#travel-planner").on("keydown", function (event) {
        if (event.which === 13) event.preventDefault();
    });
}

function getStops() {
    $.get("/getStops", function (stops) {
        var stopsName = [];

        for (let stop of stops) {
            stopsName.push(stop.name);
        }

        createBusStopListener(document.getElementById("travel-from"), stopsName);
        createBusStopListener(document.getElementById("travel-to"), stopsName);
    }).fail(function () {
        displayError();
    });
}

function getTicketTypes() {
    $.get("/getTicketTypes", function (ticketTypes) {

        var ticketTypesClarification = [];

        for (let ticketType of ticketTypes) {
            ticketTypesLabel.push(ticketType.label);
            ticketTypesClarification.push(ticketType.clarification);
        }

        for (var i = 0; i < ticketTypesLabel.length; i++) {
            if (i === 0) passengersComposition.push(1); // Default is 1 adult
            passengersComposition.push(0);
        }

        createTicketTypesListener(ticketTypesClarification);
    }).fail(function () {
        displayError();
    })
}

// Dynamically create list of ticket types when button is pressed
function createTicketTypesListener(ticketTypesClarification) {
    const buttonCreateList = document.getElementById("button-create-ticket-list");
    var outerDIV, innerDIV, closeDIV;

    if (ticketTypesLabel == null) {
        console.log("Error TICKETTYPES");
        return false;
    }

    buttonCreateList.addEventListener("click", function (e) {
        if (tTypeDropdownDisplaying) {
            closeTypeDropDown();
            return false;
        }

        outerDIV = document.createElement("DIV");
        outerDIV.setAttribute("id", "ticket-type-dropdown");
        this.parentNode.appendChild(outerDIV);

        for (var i = 0; i < ticketTypesLabel.length; i++) {
            innerDIV = document.createElement("DIV");
            innerDIV.setAttribute("class", "ticket-type-item");

            var label = ticketTypesLabel[i];
            var clarification = ticketTypesClarification[i];

            innerDIV.innerHTML =
                "<div class='row'>" +
                "<p id='label-" + label +"' class='ticket-type-label col-md-5 mb-0 font-weight-bold'>" + label + "</p>" +
                "<div class='ticket-type-selector ml-auto col-md-5 input-group'>" +
                "<button id='decrease-" + label + "' class='decrease-button mr-auto' type='button' onClick='adjustPassengers(this.id)'></button>" +
                "<span id='counter-" + label + "' class='px-0 mx-auto passengers-counter'>" + passengersComposition[i] + "</span>" +
                "<button id='increase-" + label + "' class='increase-button ml-auto' type='button' onClick='adjustPassengers(this.id)'></button>" +
                "</div>" +
                "</div >" +
                "<p class='ticket-type-clarification'>" + clarification + "</p>";

            outerDIV.appendChild(innerDIV);
        }

        closeDIV = document.createElement("DIV");
        closeDIV.setAttribute("class", "row");
        closeDIV.innerHTML = "<button id='close-button' class='ml-auto col-md-3 px-0' type='button' onClick='closeTypeDropDown()'>Lukk</button>";
        outerDIV.appendChild(closeDIV);

        tTypeDropdownDisplaying = true;
        updateTicketTypeElements();
        return false;
    });
}

// Adjust the passenger counter for each ticket type
function adjustPassengers(buttonID) {
    for (var i = 0; i < ticketTypesLabel.length; i++) {
        var number = passengersComposition[i];
        const decreaseButtonID = "decrease-" + ticketTypesLabel[i];
        const increaseButtonID = "increase-" + ticketTypesLabel[i];
        
        if (buttonID === decreaseButtonID && number !== 0) if (number > 0) number--;
        if (buttonID === increaseButtonID) number++;

        passengersComposition[i] = number;
        updateTicketTypeElements();
    }
}

// Update the visuals of the ticket type list
function updateTicketTypeElements() {
    var buttonValue = "";
    var onlyZero = true;

    for (var i = 0; i < passengersComposition.length; i++) {
        var number = passengersComposition[i];
        $("#counter-" + ticketTypesLabel[i]).html(number);

        const decreaseButton = $("#decrease-" + ticketTypesLabel[i]);
        const label = $("#label-" + ticketTypesLabel[i]);

        // Toggle font-weight bold and decrease button display based on number value
        if (number === 0 && decreaseButton.hasClass("decrease-button")) {
            decreaseButton.toggleClass("decrease-button decrease-button-50-op");
            label.toggleClass("font-weight-bold font-weight-normal");
        } else if (number > 0 && decreaseButton.hasClass("decrease-button-50-op")) {
            decreaseButton.toggleClass("decrease-button-50-op decrease-button");
            label.toggleClass("font-weight-normal font-weight-bold");
        }

        // Update value to reflect selected ticket types and composition
        if (passengersComposition[i] != 0) {
            buttonValue += passengersComposition[i] + " " + ticketTypesLabel[i] + " ";
            onlyZero = false;
        } 
    }
    // If no ticket type is selected, update value with helpful message
    if (onlyZero) buttonValue = "Velg billettype";

    $("#button-create-ticket-list").html(buttonValue);
}

function closeTypeDropDown() {
    tTypeDropdownDisplaying = false;
    $("#ticket-type-dropdown").remove();
}

// Create Datepicker (jQuery UI) to allow user to pick a date
function createDateSelector() {
    const options = $.extend({},
        $.datepicker.regional["no"], {
        dateFormat: "DD d. M yy",
        minDate: 0,

        // Source: See readme #3
        beforeShow: function (input, inst) { 
            setTimeout(function () {
                inst.dpDiv.css({
                    top: $("#date-selector").offset().top - 250,
                    left: $("#date-selector").offset().left
                });
            }, 0);
        }
    });

    $("#date-selector").datepicker(options);
    updateDate();
}

// Create a Date object and set the input value to this (until Datapicker updates it dynamically)
function updateDate() {
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }

    const dateStrings = (new Date())
        .toLocaleDateString("nb-NO", dateOptions)
        .split(" ");
    // Example - Element 0: "tirsdag", Element 1: "24.", Element 2: "sep.", Element 3: "2020"

    $("#date-selector").val(
        captLetter(dateStrings[0]) + " " + // => "Tirsdag "
        dateStrings[1] + " " +                            
        captLetter(dateStrings[2]).split(".")[0] + " " + // => "Sep"
        dateStrings[3]);
}

function captLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Display alert on top of page if DB/Server error occurs
function displayError() {
    let alert =
        "<div class='alert alert-danger alert-dismissible text-center fixed-top w-100' role='alert'>" +
        "<strong> Ikke kontakt med databasen!</strong> Feilen er loggført. Prøv igjen senere." +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Lukk'>" +
        "<span aria-hidden='true'>&times;</span>" +
        "</button >" +
        "</div >";
    $("#DBError").html(alert)
}

function hideError() {
    $("#DBError").html("");
}

function getRandomNumber() {
    return Math.floor(Math.random() * 1000);
}