var stops, routes, routeTables, tickets, ticketTypes, ticketTypeCompositions, users;
var tableIds = ["stops", "routes", "route-tables", "tickets", "ticket-types", "ticket-type-compositions", "users"];
var tableNamesNor = ["Stopp", "Ruter", "Rutetabeller", "Billetter", "Billettyper", "Sammensetninger", "Brukere"];

const Table = { Stops: 0, Routes: 1, RouteTables: 2, Tickets: 3, TicketTypes: 4, Compositions: 5, Users: 6 }

$(function () {
    $.get("User/IsAdmin", function () {
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
            "onclick='generateTable(" + i + ")'>" +
            tableNamesNor[i] + "</button></div>";
    }

    $("#table-navigation").html(output);

    $(".button-as-anchor").click(function () {
        $(".button-as-anchor").removeClass("highlight-button");
        $("#" + this.id).addClass("highlight-button");
    });
}

function generateTable(index) {
    createTableHeader(index);
    createTable(index);
}

function deleteData(index) {
    $.post("Admin/DeleteData", { tables: delTables, primaryKeys: delPrimaryKeys }, function () {
        displayInfo();

        // Source: #8
        $(".alert-dismissible").fadeTo(2000, 500).slideUp(500, function () {
            $(".alert-dismissible").alert('close');
        });

        getData();
        createTable(index);
        purgeDeletedDataSets();
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
    $.get("User/LogOut", function () {
        window.location.href = "frontpage.html";
    });
}

function displayInfo() {
    let alert =
        "<div class='alert alert-info alert-dismissible text-center fixed-top w-100' role='alert'>" +
        "<strong>Fullført lagring!</strong> Dataene ble lagret i databasen" +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Lukk'>" +
        "<span aria-hidden='true'>&times;</span>" +
        "</button >" +
        "</div >";
    $("#db-info").html(alert)
}