var stopsArray = [];            // Made into a 2d array (getStops())
var ticketTypesArray = [];      // Made into a 2d array (getTicketTypes())
var passengersComposition = [];
var routePrice = 0;
var routeTablesArray = [];      // Made into a 2d array (getRouteTables())

$(function () {
    getStops();
    getTicketTypes();
    createDateSelector();
    preventEnterKey();
});

function getStops() {
    $.get("/getStops", function (stops) {
        for (let stop of stops)
            stopsArray.push([stop.name, stop.minutesFromOslo, stop.route.label]);

        var stopsName = getColumns(stopsArray, 0);
        createBusStopListener(document.getElementById("travel-from"), stopsName);
        createBusStopListener(document.getElementById("travel-to"), stopsName);
    }).fail(function () {
        displayError();
    });
}

function getTicketTypes() {
    $.get("/getTicketTypes", function (ticketTypes) {
        for (let ticketType of ticketTypes)
            ticketTypesArray.push([ticketType.label, ticketType.clarification, ticketType.priceModifier])

        for (var i = 0; i < ticketTypesArray.length; i++) {
            if (i === 0) passengersComposition.push(1); // Default is 1 adult
            passengersComposition.push(0);
        }

        createTicketTypesListener();
    }).fail(function () {
        displayError();
    })
}

function getRoutePrice() {
    $.get("/getRouteFromLabel", getRouteLabel(), function (route) {
        routePrice = route.pricePerKM;
    }).fail(function () {
        displayError();
    })
}

function getRouteTables() {
    $.get("/getRouteTablesFromRouteLabel", getRouteLabel(), function (routeTables) {
        for (let routeTable of routeTables)
            routeTablesArray.push([routeTable.label, routeTable.startTime, routeTable.endTime]);

        createRouteTableAlternatives();
    }).fail(function () {
        displayError();
    })
}

function getRouteLabel() {
    var selectedStop = $("#travel-to").val();
    var index = stopsArrays.indexOf(selectedStop);
    return stopsArray[index][2];
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

// Get a random number, append to css filename in html to force refresh (due to css caching)
function getRandomNumber() {
    return Math.floor(Math.random() * 1000);
}

// Method for getting a specific column from a 2d array
function getColumns(array, index) {
    var column = [];

    for (var i = 0; i < array.length; i++) {
        column.push(array[i][index]);
    }

    return column;
}

// Prevent enter-key from submitting form
function preventEnterKey() {
    $("#travel-planner").on("keydown", function (event) {
        if (event.which === 13) event.preventDefault();
    });
}