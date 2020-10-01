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
    var time = formatTime(travelDiffInMin);                                     // Ex: 200 (diff in min) => 3:20
    var travelTime = time.split(":")[0] + "t " + time.split(":")[1] + "min";    // Ex: 3:20 => 3t 20min
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

function getRange() {
    var selectedRouteLabel = stopsArray[getStopIndex(selectedTravelTo)][Stops.RouteLabel];
    var allIndexes = getAllIndexes(routeTablesArray, RouteTables.RouteLabel, selectedRouteLabel);

    return [
        allIndexes[0],
        allIndexes[allIndexes.length - 1]
    ];
}

function calcTotalPrice(travelDiffInMin) {
    var totalPrice = 0;
    var routePricePerMin = parseFloat(stopsArray[getStopIndex(selectedTravelFrom)][Stops.RoutePrice]);

    for (var i = 0; i < ticketTypesArray.length; i++) {
        var numberPassengersPerTicketType = parseInt(passengersComposition[i]);
        var ticketTypePriceModifier = parseFloat(ticketTypesArray[i][TicketTypes.PriceMod]);
        totalPrice += travelDiffInMin * routePricePerMin * numberPassengersPerTicketType * ticketTypePriceModifier;
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
        if (minutes == 0) minutes = "00";

        return Math.floor(time / 60) + ":" + minutes;                 // Ex: 630 => 600 / 60 = 10 => 10:30
    }
}

function getTravelDiffBetween() {
    return getTravelDiff(selectedTravelFrom, selectedTravelTo);
}

function getTravelDiffOrigin() {
    var startIndex = getStopIndex(selectedTravelFrom);              
    var endIndex = getStopIndex(selectedTravelTo);

    // Check travel direction and adjust routeStart accordingly
    var routeStart = (startIndex < endIndex) ? stopsArray[0][Stops.Name] : stopsArray[stopsArray.length - 1][Stops.Name];

    return [
        getTravelDiff(routeStart, selectedTravelFrom),
        getTravelDiff(routeStart, selectedTravelTo)
    ];
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