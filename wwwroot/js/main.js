var stopsArray = [];            // Made into a 2d array (getStops())
var ticketTypesArray = [];      // Made into a 2d array (getTicketTypes())
var ticketPassengers = [];
var routeTablesArray = [];      // Made into a 2d array (getRouteTables())

var selectedRouteTableID;       // Assigned in travel-planner.js

var scrollBarWidth;

// Enums to make fetching data from 2d arrays more readable and easier to add/remove parameters
const Stops =       { Name: 0, Minutes: 1, RouteLabel: 2, RoutePrice: 3 }
const TicketTypes = { Label: 0, Clarify: 1, PriceMod: 2 }
const RouteTables = { RouteLabel: 0, Direction: 1, FullLength: 2, StartTime: 3, EndTime: 4 }

var isFrontPage = false;

$(function () {
    scrollBarWidth = getScrollbarWidth();
});

function prepareFrontPage() {
    getStops();
    getTicketTypes();
    getRouteTables();
    createDateSelector();
    preventEnterKey();

    resizeListener();
}

function getStops() {
    $.get("/getStops", function (stops) {
        for (let stop of stops)
            stopsArray.push([
                stop.name, stop.minutesFromOslo, stop.route.label, stop.route.pricePerMin
            ]);

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
        window.location.href = "payment.html?email=" + email;
    }).fail(function (reply) {
        displayError();
    });
}

function getTickets() {
    var email = (window.location.href).split("=")[1];

    if (typeof email == "undefined") {
        displayTicketsError();
        return;
    }

    $.get("/getTickets", email, function (tickets) {
        formatTicketTable(tickets);
    }).fail(function () {
        displayError();
    });
}

function formatTicketTable(tickets) {
    if (tickets == undefined || tickets.length == 0) {
        displayTicketsError();
        return;
    }

    var output = formatTableHead();

    for (let ticket of tickets) {
        output +=
            "<tr>" +
            "<th scope='row'>" + ticket.id + "</th>" +
            "<td>" + ticket.date + "</td>" +
            "<td>" + ticket.start + "</td>" +
            "<td>" + ticket.end + "</td>" +
            "<td>" + ticket.travelTime + "</td>" +
            "<td>" + ticket.route.label + "</td>" +
            "<td>" + formatsComps(ticket) + "</td>" +
            "<td>" + ticket.totalPrice + "</td>" +
            "<td>" + ticket.email + "</td>" +
            "<td>" + ticket.phoneNumber + "</td>" +
            "</tr>";
    }
    output +=
        "</tbody>" +
        "</table>";

    $("#ticket-table").html(output);
    $("#ticket-table").addClass("row, jumbotron");
}

function formatTableHead() {
    return (
        "<table class='table table-striped'>" +
        "<thead>" +
        "<tr>" +
        "<th scope='col'>#</th>" +
        "<th scope='col'>Date</th>" +
        "<th scope='col'>Start</th>" +
        "<th scope='col'>End</th>" +
        "<th scope='col'>TravelTime</th>" +
        "<th scope='col'>RouteLabel</th>" +
        "<th scope='col'>Travellers</th>" +
        "<th scope='col'>TotalPrice</th>" +
        "<th scope='col'>Email</th>" +
        "<th scope='col'>PhoneNumber</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>");
}

function displayTicketsError() {
    $("#ticket-header").html(
        "<p class='h1 col-md-12'>Dessverre!</p>" +
        "<p class='h3 col-md-12'>Her var det ingenting å finne</p>"
    );
}

function formatComps(ticket) {
    return ticket.passengerComposition.numberOfPassengers * ticket.passengerComposition.routeTable.label;
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

function toFrontPage() {
    window.location.href = "frontpage.html";
}

function toMinSide() {
    window.location.href = "https://www.nor-way.no/min-side//#/min-side";
}

function resizeListener() {
    $(window).on("load resize", function () {
        resizeNavBar();
        if(isFrontPage) resizeArticles();
    });
}

function resizeNavBar() {
    if ($(window).width() < (992 + scrollBarWidth)) {
        $("#dropdown-nav-button").removeAttr("hidden");
        document.getElementById("nav-bar-menu-options").setAttribute("hidden", true);
    } else {
        document.getElementById("dropdown-nav-button").setAttribute("hidden", true)
        hideDropDownNav();
        $("#nav-bar-menu-options").removeAttr("hidden");
    }
}

function resizeArticles() {
    if ($(window).width() < (768 + scrollBarWidth)) {
        var articles = document.getElementById("article-section").getElementsByTagName("DIV");
        for (let article of articles) {
            if (article != articles[articles.length - 1]) {
                article.style.borderRight = "none";
                article.style.borderBottom = "2px solid #2a347a";
            }
        }
    } else {
        var articles = document.getElementById("article-section").getElementsByTagName("DIV");
        for (let article of articles) {
            if (article != articles[articles.length - 1]) {
                article.style.borderRight = "2px solid #2a347a";
                article.style.borderBottom = "none";
            }
        }
    }
}

function showDropDownNav() {
    $("#dropdown-nav-button").html(
        '<div id="dropdown-nav-button-action" onclick="hideDropDownNav()">' +
        '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-x-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />' +
        '<path fill-rule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />' +
        '</svg>' +
        '</div');

    $("#dropdown-nav-menu-options").removeAttr("hidden");
}

function hideDropDownNav() {
    $("#dropdown-nav-button").html(
        '<div id="dropdown-nav-button-action" onclick="showDropDownNav()">' +
        '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-list" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill-rule="evenodd" d="M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />' +
        '</svg>' +
        '</div>');

    document.getElementById("dropdown-nav-menu-options").setAttribute("hidden", true);
}

// Source: #5
function getScrollbarWidth() {

    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;

}