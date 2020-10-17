var stops, routes, routeTables, tickets, ticketTypes, ticketTypeCompositions, users;
var tableArrays = [];
var tableNames = ["stops", "routes", "routeTables", "tickets", "ticketTypes", "ticketTypeCompositions", "users"];

$(function () {
    $.get("/IsAdmin", function () {
        getData();
    }).fail(function (response) {
        reactionTo(response);
    });
});

function getData() {
    getStops(); getRoutes(); getRouteTables(); getTickets(); getTicketTypes(); getTicketTypeCompositions(); getUsers();
    createTableNavigation();
}

// Default get calls
{ 
function getStops() {
    $.get("Admin/GetStops", function (response) { stops = response; })
        .fail(function (response) { reactionTo(response); });
}

function getRoutes() {
    $.get("Admin/GetRoutes", function (response) { routes = response; })
        .fail(function (response) { reactionTo(response); });
}

function getRouteTables() {
    $.get("Admin/GetRouteTables", function (response) { routeTables = response; })
        .fail(function (response) { reactionTo(response); });
}

function getTickets() {
    $.get("Admin/GetTickets", function (response) { tickets = response; })
        .fail(function (response) { reactionTo(response); });
}

function getTicketTypes() {
    $.get("Admin/GetTicketTypes", function (response) { ticketTypes = response; })
        .fail(function (response) { reactionTo(response); });
}

function getTicketTypeCompositions() {
    $.get("Admin/GetTicketTypeCompositions", function (response) { ticketTypeCompositions = response; })
        .fail(function (response) { reactionTo(response); });
}

function getUsers() {
    $.get("Admin/GetUsers", function (response) { users = response; })
        .fail(function (response) { reactionTo(response); });
    }
}

function createTableNavigation() {
    var output = "";
    for (var i = 0; i < tableNames.length; i++) {
        output +=
            "<div class='col text-center'><button id='" +
            tableNames[i] + "' class='button-as-anchor h6 font-weight-bold' type='button'" +
            "onclick='generateTable(this.id)'>" +
            capitalizeFirstLetter(tableNames[i]) + "</button></div>";
    }

    $("#table-navigation").html(output);
}

function generateTable(id) {
    var selectedTable;

    for (var i = 0; i < tableNames.length; i++)
        if (tableNames[i].includes(id))
            selectedTable = getTableVariable(id);

    for (var i = 0; i < selectedTable.length; i++)
        console.log(selectedTable[i])
}

function getTableVariable(tableName) {
    switch (tableName) {
        case "stops":
            return stops;
            break;
        case "routes":
            return routes;
            break;
        case "routeTables":
            return routeTables;
            break;
        case "tickets":
            return tickets;
            break;
        case "ticketTypes":
            return ticketTypes;
            break;
        case "ticketTypeCompositions":
            return ticketTypeCompositions;
            break;
        case "users":
            return users;
            break;
        default:
            console.log("Error fetching variablename");
    }
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