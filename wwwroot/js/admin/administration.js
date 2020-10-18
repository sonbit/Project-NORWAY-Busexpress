var stops, routes, routeTables, tickets, ticketTypes, ticketTypeCompositions, users;
var tableIds = ["stops", "routes", "route-tables", "tickets", "ticket-types", "ticket-type-compositions", "users"];
var tableNamesNor = ["Stopp", "Ruter", "Rutetabeller", "Billetter", "Billettyper", "Sammensetninger", "Brukere"];

const tableDivider = "TABLEDIVIDER";
const Table = { Stops: 0, Routes: 1, RouteTables: 2, Tickets: 3, TicketTypes: 4, Compositions: 5, Users: 6 }

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
    for (var i = 0; i < tableIds.length; i++) {
        if (tableIds[i].includes(id)) {
            createTableHeader(i);
            createTable(i);
        }
    }
}

function deleteData(index) {
    $.post("Admin/DeleteData", { tables: delTables, primaryKeys: delPrimaryKeys }, function () {
        displayDBConfirmationDialog();
        getData();
        createTable(index);
    }).fail(function () {
        displayError();
    });
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