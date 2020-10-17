// Arrays: Lookup main.js

var tTypeDropdownDisplaying = false;

function createTicketTypesListener() {
    const buttonCreateList = document.getElementById("button-create-ticket-list");
    var outerDIV, innerDIV, closeDIV;

    if (ticketTypeComposition === null) {
        console.log("Unable to create Ticket Types Listener");
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

        for (var i = 0; i < ticketTypeComposition.length; i++) {
            innerDIV = document.createElement("DIV");
            innerDIV.setAttribute("class", "ticket-type-item");

            var label = ticketTypeComposition[i][TicketType.Label];
            var clarification = ticketTypeComposition[i][TicketType.Clarification];
            var number = ticketTypeComposition[i][TicketType.Number];

            innerDIV.innerHTML =
                "<div class='row'>" +
                "<p id='label-" + label +"' class='ticket-type-label col-md-5 mb-0 font-weight-bold'>" + label + "</p>" +

                "<div class='ticket-type-selector ml-auto col-md-5 input-group'>" +
                    "<button id='decrease-" + label + "' class='decrease-button mr-auto' type='button' onClick='adjustPassengers(this.id)'></button>" +
                    "<span id='counter-" + label + "' class='px-0 mx-auto passengers-counter'>" + number + "</span>" +
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
    for (var i = 0; i < ticketTypeComposition.length; i++) {
        var label = ticketTypeComposition[i][TicketType.Label];
        var decreaseButtonID = "decrease-" + label;
        var increaseButtonID = "increase-" + label;

        var number = ticketTypeComposition[i][TicketType.Number];
        if (buttonID === decreaseButtonID && number > 0) number--;
        if (buttonID === increaseButtonID) number++;

        ticketTypeComposition[i][TicketType.Number] = number;
        updateTicketTypeElements();
    }
}

// Update the visuals of the ticket type list
function updateTicketTypeElements() {
    var buttonValue = "";
    var onlyZero = true;

    for (var i = 0; i < ticketTypeComposition.length; i++) {
        var label = ticketTypeComposition[i][TicketType.Label];
        var number = ticketTypeComposition[i][TicketType.Number];
        $("#counter-" + label).html(number);

        var decreaseButton = $("#decrease-" + label);
        var inputLabel = $("#label-" + label);

        // Toggle font-weight bold and decrease button display based on number value
        if (number === 0 && decreaseButton.hasClass("decrease-button")) {
            decreaseButton.toggleClass("decrease-button decrease-button-50-op");
            inputLabel.toggleClass("font-weight-bold font-weight-normal");
        } else if (number > 0 && decreaseButton.hasClass("decrease-button-50-op")) {
            decreaseButton.toggleClass("decrease-button-50-op decrease-button");
            inputLabel.toggleClass("font-weight-normal font-weight-bold");
        }

        // Update value to reflect selected ticket types and composition
        if (parseInt(ticketTypeComposition[i][TicketType.Number]) !== 0) {
            buttonValue += ticketTypeComposition[i][TicketType.Number] + " " + label + " ";
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