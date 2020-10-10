function displayTravelAlteratives() {
    var travelTimestamps = travelResponse.travelTimestamps;

    if (travelTimestamps == "") {
        console.log("Unable to create Route Table Alternatives");
        return false;
    }

    var dateSplit = $("#date-selector").val().split(" ");
    var selectedDate = dateSplit[0] + " " + dateSplit[1] + " " + dateSplit[2];

    $("#route-table-info").html(
        "<div class='row text-center travel-planner-group'>" +
        "<p class='h5 col-md-12'>" + $("#travel-from").val() + " &rarr; " + $("#travel-to").val() + "</p>" +
        "<p class='h5 col-md-12'>" + selectedDate + "</p>" +
        "</div>" +

        "<div id='route-table-alternatives'></div>"
    );

    var output = "";
    for (var i = 0; i < travelTimestamps.length; i++) {
        var timestamp = travelTimestamps[i].split("-");

        output +=
            "<div class='row text-center route-table-alternative'>" +
            "<div class='col-md-3 col-4 route-table-departure'>" +
            "<p>Avreise</p>" +
            "<span class='h5'><strong>" + timestamp[0] + " &rarr;</strong> " + timestamp[1] + "</span>" +
            "</div>" +

            "<div class='col-md-3 col-4 route-table-duration'>" +
            "<p>Reisetid</p>" +
            "<span class='h5'>" + travelResponse.travelTime + "</span>" +
            "</div>" +

            "<div class='col-md-3 col-4 route-table-price'>" +
            "<p>Nettpris</p>" +
            "<span class='h5'>Nok " + travelResponse.totalPrice + "</span>" +
            "</div>" +

            "<div class='col-md-3'>" +
            "<button id='selected-route-table-" + i + "'class='button-styled w-100 mt-3' onclick='createContactForm(this.id)' type='button'>Velg avgang</button>" +
            "</div>" +
            "</div>";
    }
    $("#route-table-alternatives").html(output);
}