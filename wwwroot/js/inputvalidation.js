function validateEmail(address) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(address);
}

function validatePhone(number) {
    var regex = /^(0047|\+47|47)?\d{8}$/;
    return regex.test(number);
}