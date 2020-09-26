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