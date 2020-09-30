// Arrays: Lookup controller.js

function createRouteTableAlternatives() {
    var outerDIV = $("#route-table-info");

    var startName = $("#travel-from").val();
    var endName = $("#travel-to").val();
    var travelDiff = getTravelDiff(startName, endName);

    var time = formatTime(travelDiff);                                          // Ex: 200 (diff in min) => 3:20
    var travelTime = time.split(":")[0] + "t " + time.split(":")[1] + "min";    // Ex: 3:20 => 3t 20min

    var travelPrice = travelDiff * routePrice;
    var totalPrice = 0;

    // Ex: 200 km * 2.5 kr/km * 3 adults * 1.0 price mod + 
    // 200 km * 2.5 kr/km * 1 child * 0.5 mod 
    // => 1500kr + 250kr = 1750kr total
    for (var i = 0; i < ticketTypesArray.length; i++)
        totalPrice += travelPrice * passengersComposition[i] * ticketTypesArray[i][3];

    for (var i = 0; i < routeTablesArray.length; i++) {
        outerDIV.append($(
            "<div class='row text-center route-table-alternative'>" +
            "<div class='col-md-3 route-table-departure'>" +
            "<p>Avreise</p>" +
            "<span class='h5'><strong>" + routeTablesArray[i][1] + " &rarr</strong> " + routeTablesArray[i][2] + "</span>" +
            "</div>" +

            "<div class='col-md-3 route-table-duration'>" +
            "<p>Reisetid</p>" +
            "<span class='h5'>" + travelTime + "</span>" +
            "</div>" +

            "<div class='col-md-3 route-table-price'>" +
            "<p>Nettpris</p>" +
            "<span class='h5'>Nok" + totalPrice + "</span>" +
            "</div>" +

            "<div class='col-md-3'>" +
                "<button id='button-select-route' class='button-styled mt-3' type='button'>Velg avgang</button>" +
            "</div>" +
            "</div>"));
    }
}

function getAdjustedRouteTables(i) {
    var startTime = routeTablesArray[i][1]; // Ex: 10:30
    var stopTime = routeTablesArray[i][2];  // Ex: 14:30



    var minFromOslo = stopsArray[i][1];     // Ex: 120

    var calcStart = formatTime(formatTime(startTime) + minFromOslo); // Turns startTime to minutes, add minFromOslo, then turn to hr:min again
    var calcEnd = formatTime

    return startTime + minFromOslo;
}

function formatTime(time) {
    if (time.includes(":"))
        return time.split(":")[0] * 60 + time.split(":")[1];    // Ex: 10:30 => 10*60 + 30 = 630 (minutes in total)
    else
        return Math.floor(time / 60) + ":" + time % 60;         // Ex: 630 => 600 / 60 = 10 => 10:30
}

function getTravelDiff(startName, endName) {
    return Math.abs(stopsArray[getStopIndex(startName)][1] - stopsArray[getStopIndex(endName)][1]);
}

function getStopIndex(stopName) {
    return stopsArray.indexOf(stopName);
}