var stops, routes, routeTables, tickets, ticketTypes, ticketTypeCompositions, users;
var tableIds = ["stops", "routes", "route-tables", "tickets", "ticket-types", "ticket-type-compositions", "users"];
var tableNamesNor = ["Stopp", "Ruter", "Rutetabeller", "Billetter", "Billettyper", "Sammensetninger", "Brukere"];

const Table = { Stops: 0, Routes: 1, RouteTables: 2, Tickets: 3, TicketTypes: 4, Compositions: 5, Users: 6 }

$(function () {
    $.get("User/IsAdmin", function () {
        getData();
        createTableNavigation();
    }).fail(function (response) {
        reactionTo(response);
    });

    resizeTicketTableListener();
});

function getData() {
    $.get("Admin/GetData", function (dbData) {
        stops = dbData.stops;
        routes = dbData.routes;
        routeTables = dbData.routeTables;
        tickets = dbData.tickets;
        ticketTypes = dbData.ticketTypes;
        ticketTypeCompositions = dbData.ticketTypeCompositions;
        users = dbData.users;
    }).fail(function (response) { reactionTo(response); });
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

function sendData(index) {
    sendDeleteData();
    sendEditData(index);
}

function sendDeleteData() {
    if (delPrimaryKeys !== undefined && delPrimaryKeys.length !== 0) {
        $.post("Admin/DeleteData", { primaryKeys: delPrimaryKeys }, function () {
            displayDBConfirmation();
        }).fail(function () {
            displayDBError("DELETE");
        });
    }
}

function sendEditData(index) {
    var emptyEditArray = (editStops.length === 0 && editRoutes.length === 0 && editRouteTables.length === 0 && editTickets.length === 0 && editTicketTypes.length === 0 && editCompositions.length === 0 && editUsers.length === 0);

    // Skipping tickets and compositions, as they won't be edited / added here
    if (!emptyEditArray) {
        var dbData = {
            stops: editStops,
            routes: editRoutes,
            routeTables: editRouteTables,
            ticketTypes: editTicketTypes,
            users: editUsers
        }

        $.post("Admin/EditData", dbData, function (dbData) {
            stops = dbData.stops;
            routes = dbData.routes;
            routeTables = dbData.routeTables;
            tickets = dbData.tickets;
            ticketTypes = dbData.ticketTypes;
            ticketTypeCompositions = dbData.ticketTypeCompositions;
            users = dbData.users;

            purgeTempData();
            createTable(index);
            displayDBConfirmation();
        }).fail(function () {
            displayDBError("ADD");
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
    $.get("User/LogOut", function () {
        window.location.href = "frontpage.html";
    });
}

function displayDBError(type) {
    var message = "";
    switch (type) {
        case "ADD":
            message = "<strong>Fikk ikke lagt til data i DB!</strong> Feilen er loggført. Prøv igjen senere.";
            break;
        case "EDIT":
            message = "<strong>Fikk endret data i DB!</strong> Feilen er loggført. Prøv igjen senere.";
            break;
        case "DELETE":
            message = "<strong>Fikk ikke slettet data fra DB!</strong> Feilen er loggført. Prøv igjen senere.";
            break;
    }
    let alert =
        "<div class='alert alert-danger alert-dismissible text-center fixed-top w-100' role='alert'>" +
        message +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Lukk'>" +
        "<span aria-hidden='true'>&times;</span>" +
        "</button >" +
        "</div >";
    $("#db-info").append(alert);
}

function displayDBConfirmation() {
    let alert =
        "<div class='alert-temp alert alert-info alert-dismissible text-center fixed-top w-100' role='alert'>" +
        "<strong>Fullført lagring!</strong> Dataene ble lagret i databasen" +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Lukk'>" +
        "<span aria-hidden='true'>&times;</span>" +
        "</button >" +
        "</div >";
    $("#db-info").append(alert);

    // Source: #8
    $(".alert-temp").fadeTo(2000, 500).slideUp(500, function () {
        $(".alert-temp").alert('close');
    });
}

function displayDBInfo() {
    let alert =
        "<div class='alert-temp alert alert-warning alert-dismissible text-center fixed-top w-100' role='alert'>" +
        "<strong>Fant ikke endret data!</strong> Databasen ble ikke kontaktet" +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Lukk'>" +
        "<span aria-hidden='true'>&times;</span>" +
        "</button >" +
        "</div >";
    $("#db-info").append(alert)

    // Source: #8
    $(".alert-temp").fadeTo(2000, 500).slideUp(500, function () {
        $(".alert-temp").alert('close');
    });
}