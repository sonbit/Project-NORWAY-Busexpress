const wId = "Hele tall innenfor 1-999";
const wMin = "Hele tall innenfor 0-999";
const wName = "Minst 2 bokstaver";
const wRoute = "Feil med rutenavn";
const wLabel = "Minst 5 bokstaver";
const wDouble = "Mellom 0 og 9, opptil 2 desimal";
const wBool = "Feil med bool";
const wTime = "Format - 9:00";
const wType = "Mellom 3 og 10 bokstaver";
const wEmail = "Format: abc@abc.com";
const wPassword = "Minst 6 tegn (tall, stor bokstav)";

function validateStop(stop) {
    var passed = true;

    if (!validateId(stop.id)) {
        $("#input-error-0").html(wId);
        passed = false;
    } else $("#input-error-0").html("");

    if (!validateStopName(stop.name)) {
        $("#input-error-1").html(wName);
        passed = false;
    } else $("#input-error-1").html("");

    if (!validateMinutes(stop.minutesFromHub)) {
        $("#input-error-2").html(wMin);
        passed = false;
    } else $("#input-error-2").html("");

    if (!validateRouteExistence(stop.route.label)) {
        $("#input-error-3").html(wRoute);
        passed = false;
    } else $("#input-error-3").html("");

    return passed;
}

function validateRoute(route) {
    var passed = true;

    if (!validateRouteLabel(route.label)) {
        $("#input-error-0").html(wLabel);
        passed = false;
    } else $("#input-error-0").html("");

    if (!validateDouble(route.pricePerMin)) {
        $("#input-error-1").html(wDouble);
        passed = false;
    } else $("#input-error-1").html("");

    if (!validateStopExistence(route.midwayStop)) {
        $("#input-error-2").html(wName);
        passed = false;
    } else $("#input-error-2").html("");

    return passed;
}

function validateRouteTable(routeTable) {
    var passed = true;

    if (!validateId(routeTable.id)) {
        $("#input-error-0").html(wId);
        passed = false;
    } else $("#input-error-0").html("");

    if (!validateRouteExistence(routeTable.route.label)) {
        $("#input-error-1").html(wRoute);
        passed = false;
    } else $("#input-error-1").html("");

    if (!validateBool(routeTable.fromHub)) {
        $("#input-error-2").html(wBool);
        passed = false;
    } else $("#input-error-2").html("");

    if (!validateBool(routeTable.fullLength)) {
        $("#input-error-3").html(wBool);
        passed = false;
    } else $("#input-error-3").html("");

    if (!validateTimeFormat(routeTable.startTime)) {
        $("#input-error-4").html(wTime);
        passed = false;
    } else $("#input-error-4").html("");

    if (!validateTimeFormat(routeTable.endTime)) {
        $("#input-error-5").html(wTime);
        passed = false;
    } else $("#input-error-5").html("");

    return passed;
}

function validateTicketType(ticketType) {
    var passed = true;

    if (!validateTypeLabel(ticketType.label)) {
        $("#input-error-0").html(wType);
        passed = false;
    } else $("#input-error-0").html("");

    //if (!validateDouble(ticketType.clarification)) {
    //    $("#input-error-1").html();
    //    passed = false;
    //} else $("#input-error-1").html("");

    if (!validateDouble(ticketType.priceModifier)) {
        $("#input-error-2").html(wDouble);
        passed = false;
    } else $("#input-error-2").html("");

    return passed;
}

function validateUser(user, edit) {
    var passed = true;

    if (!validateId(user.id)) {
        $("#input-error-0").html(wId);
        passed = false;
    } else $("#input-error-0").html("");

    if (!validateEmail(user.email)) {
        $("#input-error-1").html(wEmail);
        passed = false;
    } else $("#input-error-1").html("");

    if (!validateBool(user.admin)) {
        $("#input-error-2").html(wBool);
        passed = false;
    } else $("#input-error-2").html("");

    if (!validatePassword(user.password, edit)) {
        $("#input-error-3").html(wPassword);
        passed = false;
    } else $("#input-error-3").html("");

    return passed;
}

// At least 2 letters an can contain numbers => "Kongsberg E134"
function validateStopName(name) {
    var regex = /^[a-zA-ZæøåÆØÅ.() \-]{1,}[0-9a-zA-ZæøåÆØÅ.() \-]{1,}$/;
    return regex.test(name);
}

// Not a regex, but this is prior to storing value in temparray and sending to server
function validateStopExistence(name) {
    for (let stop of stops) {
        if (stop.name === name) return true;
    }
    return false;
}

// At least 5 characters
function validateRouteLabel(label) {
    var regex = /^[a-zA-ZæøåÆØÅ.() \-]{2,}[0-9a-zA-ZæøåÆØÅ.() \-]{3,}$/;
    return regex.test(label);
}

// Not a regex, but this is prior to storing value in temparray and sending to server
function validateRouteExistence(label) {
    for (let route of routes) {
        if (route.label === label) return true;
    }
    return false;
}

// Between 1 and 3 numbers 1-999
function validateId(id) {
    var regex = /^[1-9][0-9]{0,2}$/;
    return regex.test(id);
}

// Between 1 and 3 numbers 0-999
function validateMinutes(min) {
    var regex = /^([0-9]|[1-9][0-9]{1,2})$/;
    return regex.test(min);
}

// Ensure valid double
function validateDouble(double) {
    var regex = /^(([0-9]|[1-9])|([0-9]|[1-9])\.[0-9]{1,2})$/;
    return regex.test(double);
}

// Ensure valid selector
function validateBool(string) {
    var regex = /^(true|false)$/;
    return regex.test(string);
}

// Without a beginning with zero => 09:00
function validateTimeFormat(time) {
    var regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
}

// Label for tickettype: => "barn" "voksen"
function validateTypeLabel(label) {
    var regex = /^[a-zA-ZæøåÆØÅ. \-]{3,10}$/;
    return regex.test(label);
}

// Validate email when editing / adding user  - matches inputvalidation.js
function validateEmail(address) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(address);
}

// Validate new / edited password - matches inputvalidation.js
function validatePassword(password, edit) {
    var regex;

    if (edit) regex = /^(\s*|(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,})$/;
    else regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    return regex.test(password);
}