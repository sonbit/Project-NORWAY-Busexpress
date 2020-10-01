// Arrays: Lookup main.js

var selectedTravelFrom;
var selectedTravelTo;
var selectedDate;
var totalPrice;

function createRouteTableAlternatives() {
    if (routeTablesArray.length == 0) {
        console.log("Unable to create Route Table Alternatives");
        return false;
    }

    selectedTravelFrom = $("#travel-from").val();
    selectedTravelTo = $("#travel-to").val();

    var dateSplit = $("#date-selector").val().split(" ");
    selectedDate = dateSplit[0] + " " + dateSplit[1] + " " + dateSplit[2];

    $("#route-table-info").html(
        "<div class='row text-center travel-planner-group'>" +
        "<p class='h5 col-md-12'>" + selectedTravelFrom + " &rarr; " + selectedTravelTo + "</p>" +
        "<p class='h5 col-md-12'>" + selectedDate + "</p>" +
        "</div>" +

        "<div id='route-table-alternatives'></div>"

        // TODO: Get yesterday and next day, check whether selected day = today => hide option to go to yesterday
        // + "<div class='row py-5 travel-planner-group'>" +
        //"<a class='col-md-6 mr-0 mb-0' onclick='updateDateElement(false)'>&larr; " + getDate() + "</a>" +
        //"<a class='col-md-6 ml-0 mb-0 text-right' onclick='updateDateElement(true)'>" + "" + " &rarr;</a>" +
        //"</div>"
    );

    var travelDiffInMin = getTravelDiffBetween();
    var travelTime = getTravelTime(travelDiffInMin);                 
    totalPrice = calcTotalPrice(travelDiffInMin);

    var output = "";

    for (var i = getRange()[0]; i < getRange()[1] + 1; i++) {
        var adjustedTime = getAdjustedRouteTables(i);

        output +=
            "<div class='row text-center route-table-alternative'>" +
            "<div class='col-md-3 route-table-departure'>" +
            "<p>Avreise</p>" +
            "<span class='h5'><strong>" + adjustedTime[0] + " &rarr;</strong> " + adjustedTime[1] + "</span>" +
            "</div>" +

            "<div class='col-md-3 route-table-duration'>" +
            "<p>Reisetid</p>" +
            "<span class='h5'>" + travelTime + "</span>" +
            "</div>" +

            "<div class='col-md-3 route-table-price'>" +
            "<p>Nettpris</p>" +
            "<span class='h5'>Nok " + totalPrice + "</span>" +
            "</div>" +

            "<div class='col-md-3'>" +
            "<button id='selected-route-table-" + i + "'class='button-styled mt-3' onclick='createContactForm(this.id)' type='button'>Velg avgang</button>" +
            "</div>" +
            "</div>";
    }
    $("#route-table-alternatives").html(output);
}

function getTravelTime(travelDiffInMin) {
    var time = formatTime(travelDiffInMin);             // Ex: 200 (diff in min) => 3:20
    var splitTime = time.split(":");                    // Ex: E0: 3, E1: 20
    var hours = splitTime[0];
    var minutes = splitTime[1];
    hours = (hours > 0) ? hours + "t " : ""; 

    if (minutes >= 10) minutes = minutes + "min";
    else if (10 > minutes > 0) minutes = minutes.toString().split("0")[1] + "min";
    else if (minutes == 0) minutes = "";

    return hours + minutes;                             // Ex: 3:20 => 3t 20min
}

function getRange() {
    var routeTableDirection = (getDirection()) ? "WEST" : "EAST";

    var allIndexesDirection = getAllIndexes(routeTablesArray, RouteTables.Direction, routeTableDirection);
    var allIndexesFullLength = getAllIndexes(routeTablesArray, RouteTables.FullLength, isFullLength());

    var allIndexes = [];

    for (var i = 0; i < allIndexesDirection.length; i++)
        for (var j = 0; j < allIndexesFullLength.length; j++)
            if (allIndexesDirection[i] == allIndexesFullLength[j])
                allIndexes.push(allIndexesDirection[i]);

    return [
        allIndexes[0],
        allIndexes[allIndexes.length - 1]
    ];
}

function calcTotalPrice(travelDiffInMin) {
    var totalPrice = 0;
    var routePricePerMin = parseFloat(stopsArray[getStopIndex(selectedTravelFrom)][Stops.RoutePrice]);
    var travelPrice = travelDiffInMin * routePricePerMin;

    for (var i = 0; i < ticketTypesArray.length; i++) {
        var numberPassengersPerTicketType = parseInt(passengersComposition[i]);
        var ticketTypePriceModifier = parseFloat(ticketTypesArray[i][TicketTypes.PriceMod]);
        totalPrice += travelPrice * numberPassengersPerTicketType * ticketTypePriceModifier;
    }
    return Math.ceil(totalPrice/5) * 5; // Round to nearest multiple of 5
}

function getAdjustedRouteTables(i) {
    var startTime = routeTablesArray[i][RouteTables.StartTime];

    return [
        formatTime(formatTime(startTime) + getTravelDiffOrigin()[0]),
        formatTime(formatTime(startTime) + getTravelDiffOrigin()[1])
    ];
}

function formatTime(time) {
    if (time.toString().includes(":")) {
        var timeSplit = time.split(":");                
        return (parseInt(timeSplit[0]) * 60 + parseInt(timeSplit[1]));  // Ex: 10:30 => 10*60 + 30 = 630 (minutes in total)
    } else {
        time = parseInt(time);
        var minutes = time % 60;
        if (10 > minutes > 0) minutes = "0" + minutes;
        
        return Math.floor(time / 60) + ":" + minutes;                   // Ex: 630 => 600 / 60 = 10 => 10:30
    }
}

function getTravelDiffBetween() {
    return getTravelDiff(selectedTravelFrom, selectedTravelTo);
}

function getTravelDiffOrigin() {
    var routeStart = (getDirection()) ? stopsArray[0][Stops.Name] : stopsArray[stopsArray.length - 1][Stops.Name];

    return [
        getTravelDiff(routeStart, selectedTravelFrom),
        getTravelDiff(routeStart, selectedTravelTo)
    ];
}

function getDirection() {
    return getStopIndex(selectedTravelFrom) < getStopIndex(selectedTravelTo);   // Returns true if travelling from Oslo
}

function isFullLength() {
    if (getDirection()) return (getStopIndex("Åmot Vinje Kro") < getStopIndex(selectedTravelTo)) ? "true" : "false";
    else return (getStopIndex("Åmot Vinje Kro") > getStopIndex(selectedTravelTo)) ? "true" : "false";
}

function getTravelDiff(startName, endName) {
    return Math.abs(
        parseInt(stopsArray[getStopIndex(startName)][Stops.Minutes]) -
        parseInt(stopsArray[getStopIndex(endName)][Stops.Minutes])
    );
}

function getStopIndex(stopName) {
    return getColumns(stopsArray, Stops.Name).indexOf(stopName);
}

function updateDateElement(increase) {
    setDate(increase);
    createRouteTableAlternatives();
}