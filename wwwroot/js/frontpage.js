var stops = [];

$(function () {
    getStops();
});

function getStops() {
    $.get("/getStops", function (retrievedStops) {

        stops = retrievedStops;
        //let index = 0;
        
        //for (let stop of retrievedStops) {
        //    stops[index++] = stop.name + " " + stop.distanceFromOslo;
        //}

    }).fail(function () {
        displayError();
    });
}

function print() {
    let msg = "hei";
    //$("#test").html(msg);

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

function getDateTime() {
    displayError();
}