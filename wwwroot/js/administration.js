var stops = [];
var routes = [];
var routeTables = [];
var tickets = [];
var ticketTypes = [];
var ticketTypeCompositions = [];
var users = [];

$(function () {
    $.get("/IsAdmin", function () {
        getData();
    }).fail(function (response) {
        reactionTo(response);
    });
});

function getData() {
    var methodNames = ["Stops", "Routes", "RouteTables", "Tickets", "TicketTypes", "TicketTypeCompositions", "Users"];
    var tableArrays = [stops, routes, routeTables, tickets, ticketTypes, ticketTypeCompositions, users];

    for (var i = 0; i < tables.length; i++) {
        $.get("Admin/Get" + methodNames[i], function (response) {
            tableArrays[i] = response;
        }).fail(function (response) {
            reactionTo(response);
        });
    }
}

function reactionTo(response) {
    if (response.status === 401) { // => Unauthorized
        window.location.href = "mypage.html";
    } else {
        displayError();
    }
}

function logOut() {
    $.get("/LogOut", function () {
        window.location.href = "frontpage.html";
    });
}

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