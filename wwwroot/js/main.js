var stopsArray = [];            // Made into a 2d array (getStops())
var ticketTypesArray = [];      // Made into a 2d array (getTicketTypes())
var ticketPassengers = [];
var routeTablesArray = [];      // Made into a 2d array (getRouteTables())

var selectedRouteTableID;         // Assigned in travel-planner.js

// Enums to make fetching data from 2d arrays more readable and easier to add/remove parameters
const Stops =       { Name: 0, Minutes: 1, RouteLabel: 2, RoutePrice: 3 }
const TicketTypes = { Label: 0, Clarify: 1, PriceMod: 2 }
const RouteTables = { RouteLabel: 0, Direction: 1, FullLength: 2, StartTime: 3, EndTime: 4 }

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
            if (i === 0) ticketPassengers.push(1); // Default is 1 adult
            else ticketPassengers.push(0);
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
                routeTable.route.label, routeTable.direction, routeTable.fullLength,
                routeTable.startTime, routeTable.endTime
            ]);

    }).fail(function () {
        displayError();
    })
}

function storeTicket(email, phone) {
    var tempTicketPassengers = [];
    for (var i = 0; i < ticketPassengers.length; i++)
        if (ticketPassengers[i] != null) tempTicketPassengers.push(ticketPassengers[i]);

    ticketPassengers = tempTicketPassengers;

    const selDateVal = $("#date-selector").val();
    const selFromVal = $("#travel-from").val();
    const selToVal = $("#travel-to").val();

    const ticket = {
        date: selDateVal,
        start: getAdjustedRouteTables(selectedRouteTableID)[0] + " " + selFromVal,
        end: getAdjustedRouteTables(selectedRouteTableID)[1] + " " + selToVal,
        travelTime: getTravelDiff(selFromVal, selToVal),
        route: {
            label: stopsArray[getStopIndex(selFromVal)][Stops.RouteLabel],
            pricePerMin: stopsArray[getStopIndex(selFromVal)][Stops.RoutePrice]
        },
        totalPrice: totalPrice,
        email: email,
        phoneNumber: phone,
        ticketPassengers: ticketPassengers
    }

    $.post("/storeTicket", ticket, function () {
        window.location.href = "payment.html";
        console.log("Storage Successful");
    }).fail(function () {
        displayError();
    });
}

function createRouteTable() {
    if (checkTravelInputFields()) createRouteTableAlternatives();
    else return;
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
    return Math.floor(Math.random() * 50);
}

// Method for getting a specific column from a 2d array
function getColumns(array, columnIndex) {
    var column = [];

    for (var i = 0; i < array.length; i++)
        column.push(array[i][columnIndex]);

    return column;
}

// Method for getting all indexes that matches a specific value, from a 2d array (Source: #4)
function getAllIndexes(array, columnIndex, value) {
    var indexes = [];

    for (var i = 0; i < array.length; i++)
        if (getColumns(array, columnIndex)[i].includes(value))
            indexes.push(i);  

    return indexes;
}

// Prevent enter-key from submitting form
function preventEnterKey() {
    $("#travel-planner").on("keydown", function (event) {
        if (event.which === 13) event.preventDefault();
    });
}