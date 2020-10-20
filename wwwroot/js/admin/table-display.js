const tableDivider = "TABLEDIVIDER";

function createTable(index) {
    var output = "";

    switch (index) {
        case Table.Stops:
            output = displayStops(index);
            break;
        case Table.Routes:
            output = displayRoutes(index);
            break;
        case Table.RouteTables:
            output = displayRouteTables(index);
            break;
        case Table.Tickets: //Ticket Table is handled seperately due to its large width
            displayTickets(); 
            break; 
        case Table.TicketTypes:
            output = displayTicketTypes(index);
            break;
        case Table.Compositions: // Compositions is handled differently, to remove add button
            displayTicketTypeCompositions();
            break;
        case Table.Users:
            output = displayUsers(index);
            break;
        default:
            console.log("Error when displaying table: " + tableIds[index]);
            return;
    }
    formatTable(output, index);
}

function createTableHeader(index) {
    var output =
        "<h2 class='col-8'>Tabell over alle " + tableNamesNor[index].toLowerCase() + "</h2>" +
        "<div class='col-4 text-right'><button class='button-as-anchor font-weight-bold' type='button' onclick='displaySendToDBDialog(" + index + ")'>" +
        uploadIcon() + "Send til database</button></div>";
        
    $("#table-header").html(output);
}

function formatTable(output, index) {
    if (!output || output === "") return; // In cases where the formatting is handled differently

    output =
        "<table class='table table-striped table-bordered table-dark'>" +
        "<thead><tr>" +
        output.split(tableDivider)[0] +
        "<th scope='col' class='text-center'>" + addIcon(index) + "</th>" +
        "</tr></thead>" +
        "<tbody>" +
        output.split(tableDivider)[1] +
        "</tbody></table>";

    $("#table-body").html(output);
}

function displayStops(index) {
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
            editRowButtons(stop.id, index) +
            "</tr>"
    }
    return output;
}

function displayRoutes(index) {
    var output =
        "<th scope='col'>Rutenavn</th>" + "<th scope='col'>Kr/Min</th>" + "<th scope='col'>Midtstopp</th>" +
        tableDivider;

    for (let route of routes) {
        output +=
            "<tr>" +
            "<td>" + route.label + "</td>" +
            "<td>" + route.pricePerMin + "</td>" +
            "<td>" + route.midwayStop + "</td>" +
            editRowButtons(route.label, index) +
            "</tr>"
    }
    return output;
}

function displayRouteTables(index) {
    var output =
        "<th scope='col'>Id</th>" + "<th scope='col'>Rutenavn</th>" + "<th scope='col'>Fra Oslo?</th>" +
        "<th scope='col'>Full lengde?</th>" + "<th scope='col'>Start tid</th>" + "<th scope='col'>Slutt tid</th>" +
        tableDivider;

    for (let routeTable of routeTables) {
        output +=
            "<tr>" +
            "<td>" + routeTable.id + "</td>" +
            "<td>" + routeTable.route.label + "</td>" +
            "<td>" + boolToNor(routeTable.fromHub) + "</td>" +
            "<td>" + boolToNor(routeTable.fullLength) + "</td>" +
            "<td>" + routeTable.startTime + "</td>" +
            "<td>" + routeTable.endTime + "</td>" +
            editRowButtons(routeTable.id, index) +
            "</tr>"
    }
    return output;
}

function displayTickets(index) {
    var output = 
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
        let passengerComposition = null; let routeLabel = null;

        if (composition.length > 0 && composition !== undefined) {
            passengerComposition = "";

            for (var i = 0; i < composition.length; i++) {
                passengerComposition += composition[i].numberOfPassengers + " ";
                passengerComposition += composition[i].ticketType.label + "<br />";
            }
        }

        if (typeof ticket.route.label === "string") routeLabel = ticket.route.label.split(" ")[0];

        output +=
            "<tr>" +
            "<td>" + ticket.id + "</td>" +
            "<td>" + ticket.date.split(" ")[1] + ticket.date.split(" ")[2] + "</td>" +
            "<td>" + ticket.start + "</td>" +
            "<td>" + ticket.end + "</td>" +
            "<td>" + ticket.travelTime + "</td>" +
            "<td>" + routeLabel + "</td>" +
            "<td>" + passengerComposition + "</td>" +
            "<td>" + ticket.totalPrice + "</td>" +
            "<td>" + ticket.email.split("@")[0] + "\n@" + ticket.email.split("@")[1].split(".")[0] + "\n." + ticket.email.split("@")[1].split(".")[1] + "</td>" +
            "<td>" + formatPhoneNumber(ticket.phoneNumber) + "</td>" +
            "</tr>"
    }
    $("#table-body").html(output + "</tbody></table>");
}

function displayTicketTypes(index) {
    var output =
        "<th scope='col'>Type</th>" + "<th scope='col'>Forklaring</th>" + "<th scope='col'>Prisforhold</th>" +
        tableDivider;

    for (let ticketType of ticketTypes) {
        output +=
            "<tr>" +
            "<td>" + ticketType.label + "</td>" +
            "<td>" + ticketType.clarification + "</td>" +
            "<td>" + ticketType.priceModifier + "</td>" +
            editRowButtons(ticketType.label, index) +
            "</tr>"
    }
    return output;
}

function displayTicketTypeCompositions() {
    var output =
        "<table class='table table-striped table-bordered table-dark'>" +
        "<thead><tr>" +
        "<th scope='col'>Id</th>" + "<th scope='col'>Billet id</th>" + "<th scope='col'>Antall</th>" +
        "<th scope='col'>Type</th>" +
        "</tr></thead>" +
        "<tbody>";

    for (let composition of ticketTypeCompositions) {
        output +=
            "<tr>" +
            "<td>" + composition.id + "</td>" +
            "<td>" + standardTicketNor(composition.ticket.id) + "</td>" +
            "<td>" + composition.numberOfPassengers + "</td>" +
            "<td>" + composition.ticketType.label + "</td>" +
            "</tr>";
    }

    $("#table-body").html(output + "</tbody></table>");
}

function displayUsers(index) {
    var output =
        "<th scope='col'>Id</th>" + "<th scope='col'>Email</th>" + "<th scope='col'>Er admin</th>" +
        tableDivider;

    var buttons;

    for (let user of users) {
        buttons = editRowButtons(user.id, index);
        if (user.id === 1) buttons = "";

        output +=
            "<tr>" +
            "<td>" + user.id + "</td>" +
            "<td>" + user.email + "</td>" +
            "<td>" + boolToNor(user.admin) + "</td>" +
            buttons +
            "</tr>";
    }
    return output;
}

function uploadIcon() {
    var output = 
        "<svg id='upload-icon' viewBox='0 0 16 16' class='bi bi-upload' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>" +
            "<path fill-rule='evenodd' d='M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z' />" +
            "<path fill-rule='evenodd' d='M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z' />" +
        "</svg>";
    return output;
}

function addIcon(index) {
    var output =
        "<div id='add0" + tableIds[index] + "' class='add-tooltip' onclick='editRow(this.id)'><svg id='add-icon' viewBox='0 0 16 16' class='bi bi-plus-square' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>" +
        "<path fill-rule='evenodd' d='M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z'/>" +
        "<path fill-rule='evenodd' d='M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z'/>" +
        "</svg></div>"
    return output;
}

function editRowButtons(primaryKey, index) {
    var tableAndPrimaryKey = tableIds[index] + "@" + primaryKey;
    return "<td id='edit-row' class='text-center py-auto'>" + editIcon(tableAndPrimaryKey) + deleteIcon(tableAndPrimaryKey) + "</td>";
}

function editIcon(tableAndPrimaryKey) {
    var output =
        "<div id='edit0" + tableAndPrimaryKey + "' class='edit-tooltip' onclick='editRow(this.id)'><svg id='edit-icon' viewBox='0 0 16 16' class='bi bi-pencil-square' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>" +
        "<path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z'/>" +
        "<path fill-rule='evenodd' d='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z'/>" +
        "</svg></div>";
    return output;
}

function deleteIcon(tableAndPrimaryKey) {
    var output =
        "<div id='" + tableAndPrimaryKey + "' class='delete-tooltip' onclick='displayDeleteDialog(this.id)'><svg id='delete-icon' viewBox='0 0 16 16' class='bi bi-x-square' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>" +
        "<path fill-rule='evenodd' d='M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z'/>" +
        "<path fill-rule='evenodd' d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z'/>" +
        "</svg></div>"
    return output;
}

function standardTicketNor(ticketId) {
    if (ticketId === 0) return "Standardbillett";
    else return ticketId;
}

function boolToNor(bool) {
    return (bool) ? "Ja" : "Nei";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatPhoneNumber(nbr) {
    return nbr.substring(0, 3) + " " + nbr.substring(3, 5) + " " + nbr.substring(5, 8);
}