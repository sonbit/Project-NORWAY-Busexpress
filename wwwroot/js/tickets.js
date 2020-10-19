$(function () {
    resizeTicketTableListener();
    getTickets();
})

function getTickets() {
    var href = window.location.href;
    var email = "";

    if (href.includes("?email=")) email = href.split("?")[1];
    else return;

    $.get("Ticket/GetTickets", email, function (ticketResponse) {
        updateTicketHeader(ticketResponse.length);
        formatTicketTable(ticketResponse);
    }).fail(function (response) {
        if (response.status === 500)
            displayError();
    });
}

function updateTicketHeader(nbrTickets) {
    var output = "<p class='h1 col-md-12'>Takk for din bestilling!</p>";

    if (nbrTickets > 1) output += "<p class='h3 col-md-12'>Her er billettene dine</p>";
    else output += "<p class='h3 col-md-12'>Her er billetten din</p>";
        
    $("#ticket-header").html(output);
}

function formatTicketTable(ticketResponse) {
    var output = formatTableHead();

    for (let ticket of ticketResponse) {
        let composition = ticket.ticketTypeComposition;
        let passengerComposition = "";

        for (var i = 0; i < composition.length; i++) {
            passengerComposition += composition[i][0] + " ";
            passengerComposition += composition[i][1];
            passengerComposition += "<br />";
        }
        
        output +=
            "<tr>" +
            "<td>" + formatDate(ticket.travelDate) + "</td>" +
            "<td>" + ticket.start.split(" ")[0] + "</td>" +
            "<td>" + ticket.end.split(" ")[0] + "</td>" +
            "<td>" + ticket.travelTime + "</td>" +
            "<td>" + ticket.routeLabel.substring(2, 5) + "</td>" +
            "<td>" + passengerComposition + "</td>" +
            "<td>" + ticket.totalPrice + "</td>" +
            "<td>" + ticket.email.split("@")[0] + "\n@" + ticket.email.split("@")[1].split(".")[0] + "\n." + ticket.email.split("@")[1].split(".")[1] + "</td>" +
            "<td>" + formatPhoneNumber(ticket.phoneNumber) + "</td>" +
            "</tr>";
    }
    output +=
        "</tbody>" +
        "</table>";

    $("#ticket-table-location").html(output);
    $("#ticket-table-location").addClass("row");
}

function formatTableHead() {
    return (
        "<table id='ticket-table' class='table table-striped table-dark'>" +
        "<thead>" +
        "<tr>" +
        "<th scope='col'>Dato</th>" +
        "<th scope='col'>Start</th>" +
        "<th scope='col'>Slutt</th>" +
        "<th scope='col'>Tid</th>" +
        "<th scope='col'>Rute</th>" +
        "<th scope='col'>Antall</th>" +
        "<th scope='col'>Pris</th>" +
        "<th scope='col'>Epost</th>" +
        "<th scope='col'>Tlf.Nr</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>");
}

function formatDate(date) {
    var dateStrings = date.split(" ");
    return dateStrings[0].substring(0, 3) + " " + dateStrings[1] + " " + dateStrings[2];
}

function formatPhoneNumber(nbr) {
    return nbr.substring(0, 3) + " " + nbr.substring(3, 5) + " " + nbr.substring(5, 8);
}