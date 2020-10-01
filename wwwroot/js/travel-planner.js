var emailOK = false;
var phoneOK = false;

function createContactForm(id) {
    selectedRouteTableID = id;

    var index = id.split("-")[3];
    var startTime = getAdjustedRouteTables(index)[0];
    var endTime = getAdjustedRouteTables(index)[1];

    $("#ticket-contact-form").html(
        "<div class='row travel-planner-group'>" +
            "<div class='col-md-12'>" +
                "<p class='h2'>Kontaktinformasjon</p>" +
                "<p>Er du kunde fra før, kan du logge inn her (Ikke implementert)</p>" +

                "<p class='h4 mt-5'>Send billetten til</p>" +

                "<label for='input-email'>E-post</label>" +
                "<span id='invalid-email' class='input-error'></span>" +
                "<input id='input-email' class='form-control' type='text' placeholder='Skriv inn e-post adresse' />" +

                "<label class='mt-4' for='input-phone'>Mobil </label>" +
                "<span id='invalid-phone' class='input-error'></span>" +
                "<input id='input-phone' class='form-control' type='text' placeholder='Skriv inn mobilnummer' />" +

                "<p>Vi tar kun kontakt med viktig informasjon om din reise</p>" +

                "<p class='h3 mt-5 mb-0'>Se over dine reisedetaljer</p>" +
           " </div>" +
       "</div>" +

        "<div class='row travel-planner-group-selected'>" +
            "<div class='col-md-12'>" +
                "<p class='font-weight-bold my-4'>" + $("#date-selector").val() + "</p>" +

        "<p class='mb-0'>Avgang:</p>" +
        "<p class='font-weight-bold mb-5'>" + startTime + " " + selectedTravelFrom + "</p>" +

                "<p class='mb-0'>NW180 Haukeliekspressen</p>" +
                "<p class='mb-5'>Mot</p>" +

        "<p class='mb-0'>Ankomst:</p>" +
        "<p class='font-weight-bold mb-5'>" + endTime + " " + selectedTravelTo + "</p>" +

        "<p class='font-weight-bold'>Nettpris: kr " + totalPrice + "</p>" +
            "</div>" +
        "</div>" +

        "<div class='row travel-planner-group'>" +
            "<div class='col-md-12'>" +
                "<p class='mt-5'>Når jeg kjøper billetten sier jeg meg enig i kjøpsvilkårene</p>" +
                "<p class='mt-4'>Du må angi en epostadresse og et telefonnummer før du kan gå videre til betaling</p>" +
            "</div>" +
            "<button id='button-payment' class='button-disabled col-md-2 mx-3 mt-3' type='button'>Gå til betaling</button>" +
        "</div>"
    );

    $("#input-email").val("abc@123.com");
    $("#input-phone").val("12345678");

    var inputEmail = document.getElementById("input-email");
    var inputPhone = document.getElementById("input-phone");
    var inputEmailClickedOutside = false;
    var inputPhoneClickedOutside = false;

    // Check input from user and display info
    inputEmail.addEventListener("blur", function (e) {
        emailOK = checkEmailAddress();
        togglePaymentButton();
        inputEmailClickedOutside = true;
    });

    inputEmail.addEventListener("input", function (e) {
        if (!inputEmailClickedOutside) return;
        emailOK = checkEmailAddress();
        togglePaymentButton();
    });

    inputPhone.addEventListener("blur", function (e) {
        phoneOK = checkPhoneNumber();
        togglePaymentButton();
        inputPhoneClickedOutside = true;
    });

    inputPhone.addEventListener("input", function (e) {
        if (!inputPhoneClickedOutside) return;
        phoneOK = checkPhoneNumber();
        togglePaymentButton();
    });

    document.getElementById("button-payment").addEventListener("click", function (e) {
        if (this.classList.contains("button-disabled")) {
            this.parentNode.querySelector("div").children[1].classList.add("input-error");
        } else {
            storeTicket($("#input-email").val(), $("#input-phone").val());
        }
    });
}

function togglePaymentButton() {
    var OK = emailOK && phoneOK;
    var buttonPayment = document.getElementById("button-payment");

    if (OK) {
        buttonPayment.parentNode.querySelector("div").children[1].classList.remove("input-error");
        buttonPayment.classList.add("button-styled");
        buttonPayment.classList.remove("button-disabled");
    } else {
        buttonPayment.classList.add("button-disabled");
        buttonPayment.classList.remove("button-styled");
    }
}

