var stopsArray = [];            // Made into a 2d array (getStops())
var ticketTypesArray = [];      // Made into a 2d array (getTicketTypes())
var passengersComposition = [];
var routeTablesArray = [];      // Made into a 2d array (getRouteTables())

const Stops = { Name: 0, Minutes: 1, RouteLabel: 2, RoutePrice: 3 }
const TicketTypes = { Label: 0, Clarify: 1, PriceMod: 2 }
const RouteTables = { Label: 0, RouteLabel: 1, StartTime: 2, EndTime: 3 }

$(function () {
    getStops();
    getTicketTypes();
    getRouteTables();
    createDateSelector();
    preventEnterKey();
});

function getStops() {
    $.get("/getStops", function (stops) {
        for (let stop of stops)
            stopsArray.push([
                stop.name, stop.minutesFromOslo, stop.route.label, stop.route.pricePerMin
            ]);

        $("#travel-from").val(stopsArray[0][Stops.Name]);
        $("#travel-to").val(stopsArray[5][Stops.Name]);

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
            ticketTypesArray.push([
                ticketType.label, ticketType.clarification, ticketType.priceModifier
            ]);

        for (var i = 0; i < ticketTypesArray.length; i++) {
            if (i === 0) passengersComposition.push(1); // Default is 1 adult
            passengersComposition.push(0);
        }

        createTicketTypesListener();
    }).fail(function () {
        displayError();
    })
}

function getRouteTables() {
    $.get("/getRouteTables", function (routeTables) {
        for (let routeTable of routeTables)
            routeTablesArray.push([
                routeTable.label, routeTable.route.label, routeTable.startTime, routeTable.endTime
            ]);

    }).fail(function () {
        displayError();
    })
}

function createRouteTable() {
    if (!($("#travel-from").val() == "") && !($("#travel-to").val() == "")) {
        createRouteTableAlternatives();
    }
}

function purchaseTicket() {

    validateContactInfo();

}

function validateContactInfo() {
    var address = $("#input-email");
    var addressError = $("#invalid-email");
    var number = $("#input-phone");
    var numberError = $("#invalid-phone");

    if (address.html == "") addressError.html("Du må skrive inn en e-post adresse");
    else if (validateEmail(address)) addressError.html("");
    else addressError.html("Adressen er ikke gyldig");

    if (number.html == "") numberError.html("Du må skrive inn et telefon nummer");
    else if (validatePhone(number)) numberError.html("");
    else numberError.html("Telefon nummeret er ikke gyldig");

    if (addressError.html != "" || numberError.html != "") return;
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

    for (var i = 0; i < array.length; i++)
        column.push(array[i][index]);

    return column;
}

// Method for getting all indexes of an array, where each element contains specific value (Source: #4)
function getAllIndexes(array, index, value) {
    var indexes = [];

    for (var i = 0; i < array.length; i++) {
        if (getColumns(array, index)[i] === value) {
            indexes.push(i);
        }    
    }
        
    return indexes;
}

// Prevent enter-key from submitting form
function preventEnterKey() {
    $("#travel-planner").on("keydown", function (event) {
        if (event.which === 13) event.preventDefault();
    });
}