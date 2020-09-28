// Based on dynamic-bus-stop-list which is mostly based on code from w3schools

function createTicketTypesListener(typesLabel, typesClarification) {
    var outerDIV, innerDIV, closeDIV;
    var selButton = document.getElementById("ticket-type-selector");
    
    if (typesLabel == null) {
        console.log("Error TICKETTYPES");
        return false;
    }

    selButton.addEventListener("click", function (e) {
        outerDIV = document.createElement("DIV");
        outerDIV.setAttribute("id", "ticket-type-dropdown");
        this.parentNode.appendChild(outerDIV);

        for (var i = 0; i < typesLabel.length; i++) {
            innerDIV = document.createElement("DIV");
            innerDIV.setAttribute("class", "ticket-type-item");

            innerDIV.innerHTML =
                "<div class='row'>" +
                "<p class='ticket-type-label col-md-5 mb-0'> <strong>" + typesLabel[i] + "</strong></p>" +
                    "<div class='ticket-type-selector ml-auto col-md-5 input-group'>" +
                        "<button type='button' class='decrease-button mr-auto'></button>" +
                        "<span class='px-0 mx-auto passengers-counter'>1</span>" +
                        "<button type='button' class='increase-button ml-auto'></button>" +
                    "</div>" +
                "</div >" +
                "<p class='ticket-type-clarification'>" + typesClarification[i] + "</p>";

            outerDIV.appendChild(innerDIV);
        }

        closeDIV = document.createElement("DIV");
        closeDIV.setAttribute("class", "row");
        closeDIV.innerHTML = "<button type='button' id='close-button' onClick='closeDropDown()' class='ml-auto col-md-3 px-0'>Lukk</button>";
        outerDIV.appendChild(closeDIV);
    });

    var decreaseButton = document.getElementByClassName("decrease-button");
    var increaseButton = document.getElementByClassName("increase-button");
    var closeButton = document.getElementById("close-button");

    closeButton.addEventListener("click", function (e) {
        $("#ticket-type-dropdown").html("");
        console.log("HEI");
    });
}

function closeDropDown() {
    $("#ticket-type-dropdown").remove();
}