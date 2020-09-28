var stopsName = [];

$(function () {
    preventEnterKey();
    getStops();
});

function preventEnterKey() {
    $("#travel-planner").on("keydown", function (event) {
        if (event.which === 13) event.preventDefault();
    });
}

function getStops() {
    $.get("/getStops", function (stops) {
        for (let stop of stops) {
            stopsName.push(stop.name);
        }

        createAutoCompleteListener(document.getElementById("travel-from"), stopsName);
        createAutoCompleteListener(document.getElementById("travel-to"), stopsName);
    }).fail(function () {
        displayError();
    });
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