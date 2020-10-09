var stopNames = [];
var ticketTypeComposition = [];
var ticketPassengers = [];

// Enums to make fetching data from 2d arrays more readable and easier to add/remove parameters
const TicketType = { Label: 0, Clarification: 1, Number: 2 }
const RouteTables = { RouteLabel: 0, Direction: 1, FullLength: 2, StartTime: 3, EndTime: 4 }

$(function () {
    resizeArticlesListener();
    getInitialData();
});

function getInitialData() {
    $.get("/getInitialData", function (response) {
        stopNames = response.stopNames;
        ticketTypeComposition = response.ticketTypeComposition;

        for (var i = 0; i < ticketTypeComposition.length; i++)
            ticketTypeComposition[i][TicketType.Number] = parseInt(ticketTypeComposition[i][TicketType.Number]);

        $("#travel-from").val(stopNames[0]);
        $("#travel-to").val(stopNames[5]);

        createBusStopListener(document.getElementById("travel-from"), stopNames);
        createBusStopListener(document.getElementById("travel-to"), stopNames);
        createTicketTypesListener();

        createDateSelector();

        preventEnterKey();
    }).fail(function () {
        displayError();
    });
}

function createTravelAlternatives() {
    if (!checkTravelInputFields()) return;

    var travellers = "";
    for (var i = 0; i < ticketTypeComposition.length; i++)
        travellers += ticketTypeComposition[i][TicketType.Number];

    const travelData = {
        travelFrom: $("#travel-from").val(),
        travelTo: $("#travel-to").val(),
        travelDate: $("#date-selector").val(),
        travellers: travellers
    };

    $.get("/getTravelAlternatives", travelData, function (response) {
        displayTravelAlteratives(response.travelTimestamps, response.travelTime, response.totalPrice);
    }).fail(function () {
        displayError();
    });
}

function storeTicket(email, phone) {
    const selDateVal = $("#date-selector").val();
    const selFromVal = $("#travel-from").val();
    const selToVal = $("#travel-to").val();

    const ticket = {
        date: selDateVal,
        start: getAdjustedRouteTables(selectedRouteTableID)[0] + " " + selFromVal,
        end: getAdjustedRouteTables(selectedRouteTableID)[1] + " " + selToVal,
        travelTime: getTravelDiff(selFromVal, selToVal),
        route: {
            label: stopsArray[getStopIndex(selFromVal)][Stops.RouteLabel],
            pricePerMin: stopsArray[getStopIndex(selFromVal)][Stops.RoutePrice]
        },
        totalPrice: totalPrice,
        email: email,
        phoneNumber: phone,
        ticketPassengers: ticketPassengers
    }

    $.post("/storeTicket", ticket, function () {
        window.location.href = "payment.html?email=" + email;
    }).fail(function (reply) {
        displayError();
    });
}

function resizeArticlesListener() {
    resizeArticles();
    $(window).on("load resize", function () {
        resizeArticles();
    });
}

function resizeArticles() {
    var articles = "";
    if ($(window).width() < (768 - scrollBarWidth)) {
        articles = document.getElementById("article-section").getElementsByTagName("DIV");
        for (let article of articles) {
            if (article !== articles[articles.length - 1]) {
                article.style.borderRight = "none";
                article.style.borderBottom = "2px solid #2a347a";
            }
        }
    } else {
        articles = document.getElementById("article-section").getElementsByTagName("DIV");
        for (let article of articles) {
            if (article !== articles[articles.length - 1]) {
                article.style.borderRight = "2px solid #2a347a";
                article.style.borderBottom = "none";
            }
        }
    }
}