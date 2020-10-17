var stops, routes, routeTables, tickets, ticketTypes, ticketTypeCompositions, users;
var tableIds = ["stops", "routes", "route-tables", "tickets", "ticket-types", "ticket-type-compositions", "users"];
var tableNamesNor = ["Stopp", "Rute", "Rutetabeller", "Billetter", "Billettyper", "Sammensetninger", "Brukere"];

const tableDivider = "TABLEDIVIDER";

$(function () {
    $.get("/IsAdmin", function () {
        getData();
    }).fail(function (response) {
        reactionTo(response);
    });

    resizeTicketTableListener();
});

function getData() {
    getStops(); getRoutes(); getRouteTables(); getTickets(); getTicketTypes(); getTicketTypeCompositions(); getUsers();
    createTableNavigation();
}

// Default get calls
{ 
function getStops() {
    $.get("Admin/GetStops", function (response) { stops = response; console.log(response) })
        .fail(function (response) { reactionTo(response); });
}

function getRoutes() {
    $.get("Admin/GetRoutes", function (response) { routes = response; console.log(response) })
        .fail(function (response) { reactionTo(response); });
}

function getRouteTables() {
    $.get("Admin/GetRouteTables", function (response) { routeTables = response; console.log(response) })
        .fail(function (response) { reactionTo(response); });
}

function getTickets() {
    $.get("Admin/GetTickets", function (response) { tickets = response; console.log(response) })
        .fail(function (response) { reactionTo(response); });
}

function getTicketTypes() {
    $.get("Admin/GetTicketTypes", function (response) { ticketTypes = response; console.log(response) })
        .fail(function (response) { reactionTo(response); });
}

function getTicketTypeCompositions() {
    $.get("Admin/GetTicketTypeCompositions", function (response) { ticketTypeCompositions = response; console.log(response) })
        .fail(function (response) { reactionTo(response); });
}

function getUsers() {
    $.get("Admin/GetUsers", function (response) { users = response; })
        .fail(function (response) { reactionTo(response); });
    }
}

function createTableNavigation() {
    var output = "";
    for (var i = 0; i < tableIds.length; i++) {
        output +=
            "<div class='col text-center'><button id='" +
            tableIds[i] + "' class='button-as-anchor h6 font-weight-bold' type='button'" +
            "onclick='generateTable(this.id)'>" +
            tableNamesNor[i] + "</button></div>";
    }

    $("#table-navigation").html(output);

    $(".button-as-anchor").click(function () {
        $(".button-as-anchor").removeClass("highlight-button");
        $("#" + this.id).addClass("highlight-button");
    });
}

function generateTable(id) {
    for (var i = 0; i < tableIds.length; i++)
        if (tableIds[i].includes(id))
            displayTable(i);
}

function displayStops() {
    var output =
        "<th scope='col'>Id</th>" + "<th scope='col'>Stopnavn</th>" +
        "<th scope='col'>Min fra Oslo</th>" + "<th scope='col'>Rutenavn</th>" +
        tableDivider;

    for (let stop of stops) {
        output +=
            "<tr>" +
            "<td>" + stop.id + "</td>" +
            "<td>" + stop.name + "</td>" +
            "<td>" + stop.minutesFromHub + "</td>" +
            "<td>" + stop.route.label + "</td>" + 
            "</tr>"
    }
    return output;
}

function displayRoutes() {
    var output =
        "<th scope='col'>Rutenavn</th>" + "<th scope='col'>Kr/Min</th>" + "<th scope='col'>Midtstopp</th>" + 
        tableDivider;

    for (let route of routes) {
        output +=
            "<tr>" +
            "<td>" + route.label + "</td>" +
            "<td>" + route.pricePerMin + "</td>" +
            "<td>" + route.midwayStop + "</td>" +
            "</tr>"
    }
    return output;
}

function displayRouteTables() {
    var output = 
        "<th scope='col'>Id</th>" + "<th scope='col'>Rutenavn</th>" + "<th scope='col'>Fra Oslo?</th>" +
        "<th scope='col'>Full lengde?</th>" + "<th scope='col'>Start tid</th>" + "<th scope='col'>Slutt tid</th>" +
        tableDivider;

    for (let routeTable of routeTables) {
        output +=
            "<tr>" +
            "<td>" + routeTable.id + "</td>" +
            "<td>" + routeTable.route.label + "</td>" +
            "<td>" + boolNor(routeTable.fromHub) + "</td>" +
            "<td>" + boolNor(routeTable.fullLength) + "</td>" +
            "<td>" + routeTable.startTime + "</td>" +
            "<td>" + routeTable.endTime + "</td>" +
            "</tr>"
    }
    return output;
}

function displayTickets() {
    var output =
        "<h2>Tabell over alle " + tableNamesNor[3].toLowerCase() + "</h2>" +
        "<table id='ticket-table' class='table table-striped table-bordered table-dark table-responsive-md'>" +
        "<thead><tr>" +
            "<th scope='col'>Id</th>" + "<th scope='col'>Dato</th>" + "<th scope='col'>Start</th>" +
            "<th scope='col'>Slutt</th>" + "<th scope='col'>Reisetid</th>" + "<th scope='col'>Rutenavn</th>" +
            "<th scope='col'>Antall</th>" + "<th scope='col'>Pris</th>" + "<th scope='col'>Email</th>" +
            "<th scope='col'>Tlf</th>" +
        "</tr></thead>" +
        "<tbody>";

    for (let ticket of tickets) {
        let composition = ticket.ticketTypeCompositions;
        let passengerComposition = "";

        for (var i = 0; i < composition.length; i++) {
            passengerComposition += composition[i].ticketType.label + " ";
            passengerComposition += composition[i].numberOfPassengers;
            passengerComposition += "<br />";
        }

        output +=
            "<tr>" +
            "<td>" + ticket.id + "</td>" +
            "<td>" + ticket.date.split(" ")[1] + ticket.date.split(" ")[2] + "</td>" +
            "<td>" + ticket.start + "</td>" +
            "<td>" + ticket.end + "</td>" +
            "<td>" + ticket.travelTime + "</td>" +
            "<td>" + ticket.route.label.split(" ")[0] + "</td>" +
            "<td>" + passengerComposition + "</td>" +
            "<td>" + ticket.totalPrice + "</td>" +
            "<td>" + ticket.email.split("@")[0] + "\n@" + ticket.email.split("@")[1].split(".")[0] + "\n." + ticket.email.split("@")[1].split(".")[1] + "</td>" +
            "<td>" + formatPhoneNumber(ticket.phoneNumber) + "</td>" +
            "</tr>"
    }
    $("#table-display").html(output + "</tbody></table>");
}

function displayTicketTypes() {
    var output =
        "<th scope='col'>Type</th>" + "<th scope='col'>Forklaring</th>" + "<th scope='col'>Prisforhold</th>" +
        tableDivider;

    for (let ticketType of ticketTypes) {
        output +=
            "<tr>" +
            "<td>" + ticketType.label + "</td>" +
            "<td>" + ticketType.clarification + "</td>" +
            "<td>" + ticketType.priceModifier + "</td>" +
            "</tr>"
    }
    return output;
}

function displayTicketTypeCompositions() {
    var output =
        "<th scope='col'>Id</th>" + "<th scope='col'>Billet Id</th>" + "<th scope='col'>Antall</th>" +
        "<th scope='col'>Type</th>" + 
        tableDivider;

    for (let composition of ticketTypeCompositions) {
        output +=
            "<tr>" +
            "<td>" + composition.id + "</td>" +
            "<td>" + standardTicketNor(composition.ticket.id) + "</td>" +
            "<td>" + composition.numberOfPassengers + "</td>" +
            "<td>" + composition.ticketType.label + "</td>" +
            "</tr>"
    }
    return output;
}

function displayUsers() {
    var output =
        "<th scope='col'>Id</th>" + "<th scope='col'>Email</th>" + "<th scope='col'>Er admin</th>" +
        tableDivider;

    for (let user of users) {
        output +=
            "<tr>" +
            "<td>" + user.id + "</td>" +
            "<td>" + user.email + "</td>" +
            "<td>" + boolNor(user.admin) + "</td>" +
            "</tr>"
    }
    return output;
}

function displayTable(index) {
    var output;

    switch (index) {
        case 0:
            output = displayStops();
            break;
        case 1:
            output = displayRoutes();
            break;
        case 2:
            output = displayRouteTables();
            break;
        case 3:
            // Due to width of tickets table, need to handle its html separately 
            // such as resize and table - responsive class for table tag
            displayTickets(); 
            return;
        case 4:
            output = displayTicketTypes();
            break;
        case 5:
            output = displayTicketTypeCompositions();
            break;
        case 6:
            output = displayUsers();
            break;
        default:
            console.log("Error when displaying table");
            return;
    }

    output =
        "<h2>Tabell over alle " + tableNamesNor[index].toLowerCase() + "</h2>" +
        "<table class='table table-striped table-bordered table-dark'>" +
        "<thead><tr>" +
            output.split(tableDivider)[0] +
        "</tr></thead>" +
        "<tbody>" +
            output.split(tableDivider)[1] +
        "</tbody></table>";

    $("#table-display").html(output);
}

function standardTicketNor(ticketId) {
    if (ticketId === 0) return "Standardbillett";
    else return ticketId;
}

function boolNor(bool) {
    return (bool) ? "Ja" : "Nei";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

function formatPhoneNumber(nbr) {
    return nbr.substring(0, 3) + " " + nbr.substring(3, 5) + " " + nbr.substring(5, 8);
}