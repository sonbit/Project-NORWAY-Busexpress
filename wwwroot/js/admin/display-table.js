function displayTable(index) {
    var output;

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
        case Table.Tickets:
            // Due to width of tickets table, need to handle its html separately 
            // such as resize and table - responsive class for table tag
            displayTickets(index);
            return;
        case Table.TicketTypes:
            output = displayTicketTypes(index);
            break;
        case Table.Compositions:
            output = displayTicketTypeCompositions(index);
            break;
        case Table.Users:
            output = displayUsers(index);
            break;
        default:
            console.log("Error when displaying table");
            return;
    }
    finalizeTable(output, index);
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
            editRowButtons(index, stop.id) +
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
            editRowButtons(index, route.label) +
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
            "<td>" + boolNor(routeTable.fromHub) + "</td>" +
            "<td>" + boolNor(routeTable.fullLength) + "</td>" +
            "<td>" + routeTable.startTime + "</td>" +
            "<td>" + routeTable.endTime + "</td>" +
            editRowButtons(index, routeTable.id) +
            "</tr>"
    }
    return output;
}

function displayTickets(index) {
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
            editRowButtons(index, ticket.id) +
            "</tr>"
    }
    $("#table-display").html(output + "</tbody></table>");
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
            editRowButtons(index, ticketType.label) +
            "</tr>"
    }
    return output;
}

function displayTicketTypeCompositions(index) {
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
            editRowButtons(index, composition.id) +
            "</tr>";
    }
    return output;
}

function displayUsers(index) {
    var output =
        "<th scope='col'>Id</th>" + "<th scope='col'>Email</th>" + "<th scope='col'>Er admin</th>" +
        tableDivider;

    for (let user of users) {
        output +=
            "<tr>" +
            "<td>" + user.id + "</td>" +
            "<td>" + user.email + "</td>" +
            "<td>" + boolNor(user.admin) + "</td>" +
            editRowButtons(index, user.id) +
            "</tr>";
    }
    return output;
}

function finalizeTable(output, index) {
    output =
        "<h2>Tabell over alle " + tableNamesNor[index].toLowerCase() + "</h2>" +
        "<button class='button-as-anchor float-right' type='button' onclick='deleteData()'>Oppdater</button>" +
        "<table class='table table-striped table-bordered table-dark'>" +
        "<thead><tr>" +
        output.split(tableDivider)[0] +
        "<th scope='col' class='text-center'>" + addIcon() + "</th>" +
        "</tr></thead>" +
        "<tbody>" +
        output.split(tableDivider)[1] +
        "</tbody></table>";

    $("#table-display").html(output);
}

function addIcon(table) {
    var output =
        "<div id='add-tooltip' class='" + table + "'><svg id='add-icon' viewBox='0 0 16 16' class='bi bi-plus-square' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>" +
        "<path fill-rule='evenodd' d='M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z'/>" +
        "<path fill-rule='evenodd' d='M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z'/>" +
        "</svg></div>"
    return output;
}

function editRowButtons(index, primaryKey) {
    var tableAndPrimaryKey = tableIds[index] + "@" + primaryKey;
    return "<td id='edit-row' class='text-center py-auto'>" + editIcon(tableAndPrimaryKey) + deleteIcon(tableAndPrimaryKey) + "</td>";
}

function editIcon(tableAndPrimaryKey) {
    var output =
        "<div id='edit-tooltip' class='" + tableAndPrimaryKey + "'><svg id='edit-icon' viewBox='0 0 16 16' class='bi bi-pencil-square' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>" +
        "<path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z'/>" +
        "<path fill-rule='evenodd' d='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z'/>" +
        "</svg></div>";
    return output;
}

function deleteIcon(tableAndPrimaryKey) {
    var output =
        "<div id='delete-tooltip' class='" + tableAndPrimaryKey + "' onclick='displayDeleteDialog(this.classList)'><svg id='delete-icon' viewBox='0 0 16 16' class='bi bi-x-square' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>" +
        "<path fill-rule='evenodd' d='M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z'/>" +
        "<path fill-rule='evenodd' d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z'/>" +
        "</svg></div>"
    return output;
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

function formatPhoneNumber(nbr) {
    return nbr.substring(0, 3) + " " + nbr.substring(3, 5) + " " + nbr.substring(5, 8);
}