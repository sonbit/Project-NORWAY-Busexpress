function checkTravelInputFields() {
    var travelPlannerError = $("#travel-planner-error");
    var compareStops = $("#travel-from").val() === $("#travel-to").val();
    var output = "";

    if (!checkTravelValues() && !compareStops) output = "Vennligst fyll inn alle feltene over";
    else if (compareStops) output = "Til og fra er samme sted"
    
    travelPlannerError.html(output);

    return travelPlannerError.is(":empty");
}

function checkTravelValues() {
    return (checkTravelFromValue() && checkTravelToValue() && checkPassengersComposition());
}

function checkTravelFromValue() {
    var travelFrom = $("#travel-from").val();
    var travelFromError = $("#travel-from-error");

    if (travelFrom === "") travelFromError.html(" (Skriv inn et sted)");
    else if (stopNames.indexOf(travelFrom) > -1) travelFromError.html("");
    else travelFromError.html(" (Velg et sted fra lista");

    return travelFromError.is(":empty");
}

function checkTravelToValue() {
    var travelTo = $("#travel-to").val();
    var travelToError = $("#travel-to-error");

    if (travelTo === "") travelToError.html(" (Skriv inn et sted)");
    else if (stopNames.indexOf(travelTo) > -1) travelToError.html("");
    else travelToError.html(" (Velg et sted fra lista)");

    return travelToError.is(":empty");
}

function checkPassengersComposition() {
    var ticketTypeError = $("#ticket-type-error");
    var emptyComposition = true;

    for (var i = 0; i < ticketTypeComposition.length; i++)
        if (ticketTypeComposition[i][TicketType.Number] !== 0)
            emptyComposition = false;

    if (emptyComposition) ticketTypeError.html(" (Velg minst en billettype)");
    else ticketTypeError.html("");

    return !emptyComposition;
}

function checkEmailAddress() {
    var email = $("#input-email").val();
    var emailError = $("#invalid-email");

    if (email === "") emailError.html(" (Skrive inn en e-post adresse)");
    else if (validateEmail(email)) emailError.html("");
    else emailError.html(" (Adressen er ikke gyldig. Eks. abc@abc.com)");

    return emailError.is(":empty");
}

function checkPhoneNumber() {
    var phone = $("#input-phone").val();;
    var phoneError = $("#invalid-phone");

    if (phone === "") phoneError.html(" (Skriv inn et telefon nummer)");
    else if (validatePhone(phone)) phoneError.html("");
    else phoneError.html(" (Nummeret er ikke gyldig. Norsk nummer 8 siffer)");

    return phoneError.is(":empty");
}

function checkPassword() {
    var password = $("#input-password").val();;
    var passwordError = $("#invalid-password");

    if (password === "") passwordError.html(" (Skriv inn et passord)");
    else if (validatePassword(password)) passwordError.html("");
    else passwordError.html(" (Passordet er ikke gyldig. Minst 6 tegn)");

    return passwordError.is(":empty");
}

function checkLoginDetails() {
    var emailCheck = checkEmailAddress();
    var passwordCheck = checkPassword();
    return emailCheck && passwordCheck;
}

function validateEmail(address) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(address);
}

function validatePhone(number) {
    var regex = /^(0047|\+47|47)?\d{8}$/;
    return regex.test(number);
}

function validatePassword(password) {
    var regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
}