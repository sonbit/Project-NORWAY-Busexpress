function checkEmailAddress() {
    var email = $("#input-email").val();
    var emailError = $("#invalid-email");

    if (email == "") emailError.html(" (Du må skrive inn en e-post adresse)");
    else if (validateEmail(email)) emailError.html("");
    else emailError.html(" (Adressen er ikke gyldig)");

    return emailError.is(":empty");
}

function checkPhoneNumber() {
    var phone = $("#input-phone").val();;
    var phoneError = $("#invalid-phone");

    if (phone == "") phoneError.html(" (Du må skrive inn et telefon nummer)");
    else if (validatePhone(phone)) phoneError.html("");
    else phoneError.html(" (Nummeret er ikke gyldig)");

    return phoneError.is(":empty");
}

function validateEmail(address) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(address);
}

function validatePhone(number) {
    var regex = /^(0047|\+47|47)?\d{8}$/;
    return regex.test(number);
}