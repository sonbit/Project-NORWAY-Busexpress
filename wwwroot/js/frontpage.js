var stops = [];

$(function () {
    getStops();
});

function getStops() {
    $.get("/getStops", function (retrievedStops) {
        stops = retrievedStops;
    }).fail(function () {
        displayError();
    });
}

function print() {
    let msg = "hei";
    for (let stop of stops) {
        msg += stop.name + " ";
    }
    $("#test").html(msg);
}

function printDateTime() {
    hideError();
    print();
    //$.get("/GetTicketTypes", function (ticketTypes) {
    //    let ut = "<table class='table table-striped'>" +
    //        "<tr>" +
    //        "<th>Navn</th><th>Prismodifier</th>" +
    //        "</tr>";
    //    for (let ticketType of ticketTypes) {
    //        ut += "<tr>" +
    //            "<td>" + ticketType.name + "</td>" +
    //            "<td>" + ticketType.priceModifier + "</td>" +
    //            "</tr>";
    //    }
    //    ut += "</table>";
    //    $("#placehere").html(ut);
    //}).fail(function () {
    //    $("").html("Feil på server - prøv igjen senere");
    //});
}

function displayError() {
    let alert =
        "<div class='alert alert-danger alert-dismissible text-center position-fixed w-100' role='alert'>" +
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