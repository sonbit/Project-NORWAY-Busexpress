var stopNames = [];
var ticketTypeComposition = [];
var ticketPassengers = [];
var travelResponse;

// Enum to better visualize the content in TicketTypeComposition 2d array
const TicketType = { Label: 0, Clarification: 1, Number: 2 }

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
        travelResponse = response;
        displayTravelAlteratives();
    }).fail(function () {
        displayError();
    });
}

function storeTicket(startTime, endTime, email, phone) {
    const ticket = {
        date: $("#date-selector").val(),
        start: startTime + " " + $("#travel-from").val(),
        end: endTime + " " + $("#travel-to").val(),
        travelTime: travelResponse.travelTime,
        route: { label: travelResponse.routeLabel },
        totalPrice: travelResponse.totalPrice,
        email: email,
        phoneNumber: phone,
        passengers: getColumns(ticketTypeComposition, TicketType.Number)
    }

    $.post("/storeTicket", ticket, function () {
        window.location.href = "tickets.html?email=" + email;
    }).fail(function () {
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
    if ($(window).width() < (768 - getScrollbarWidth())) {
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

// Method for getting a specific column from a 2d array
function getColumns(array, columnIndex) {
    var column = [];

    for (var i = 0; i < array.length; i++)
        column.push(array[i][columnIndex]);

    return column;
}