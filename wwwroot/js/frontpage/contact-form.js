var emailOK = false;
var phoneOK = false;
var selectedRouteTableID;
var startTime;
var endTime;

function createContactForm(buttonId) {
    selectedRouteTableID = buttonId.split("-")[3];

    var timestamp = travelResponse.travelTimestamps[selectedRouteTableID].split("-");
    startTime = timestamp[0];
    endTime = timestamp[1];

    $("#ticket-contact-form").html(
        "<div class='row travel-planner-group'>" +
            "<div class='col-md-12'>" +
                "<p class='h2'>Kontaktinformasjon</p>" +
                "<p class='text-color-gray'><del>Er du kunde fra før, kan du logge inn her<del></p>" +

                "<p class='h4 mt-5'>Send billetten til</p>" +

                "<label for='input-email'>E-post</label>" +
                "<span id='invalid-email' class='input-error'></span>" +
                "<input id='input-email' class='form-control' type='text' placeholder='Skriv inn e-post adresse' />" +

                "<label class='mt-4' for='input-phone'>Mobil </label>" +
                "<span id='invalid-phone' class='input-error'></span>" +
                "<input id='input-phone' class='form-control' type='text' placeholder='Skriv inn mobilnummer' />" +

                "<p class='text-color-gray'>Vi tar kun kontakt med viktig informasjon om din reise</p>" +

                "<p class='h3 mt-5 mb-0'>Se over dine reisedetaljer</p>" +
           " </div>" +
       "</div>" +

        "<div class='row travel-planner-group-selected'>" +
            "<div class='col-md-12'>" +
                "<p class='font-weight-bold my-4'>" + $("#date-selector").val() + "</p>" +

        "<p class='mb-0'>Avgang:</p>" +
        "<p id='contact-form-from' class='font-weight-bold mb-5'>" + startTime + " " + $("#travel-from").val() + "</p>" +

        "<p class='mb-0'>" + travelResponse.routeLabel + "</p>" +
                "<p class='mb-5'>Mot</p>" +

        "<p class='mb-0'>Ankomst:</p>" +
        "<p id='contact-form-to' class='font-weight-bold mb-5'>" + endTime + " " + $("#travel-to").val() + "</p>" +

        "<p class='font-weight-bold'>Nettpris: kr " + travelResponse.totalPrice + "</p>" +
            "</div>" +
        "</div>" +

        "<div class='row travel-planner-group'>" +
            "<div class='col-md-12'>" +
                "<p class='mt-5'>Når jeg kjøper billetten sier jeg meg enig i <a href='https://www.nor-way.no/reiseinfo/kjoepsvilkaar/'><u>kjøpsvilkårene</u></a></p>" +
                "<p class='mt-4'>Du må angi en epostadresse og et telefonnummer før du kan gå videre til betaling</p>" +
            "</div>" +
            "<button id='button-payment' class='button-disabled col-lg-3 mx-3 mt-3' type='button'>Gå til betaling</button>" +
        "</div>"
    );

    var inputEmail = document.getElementById("input-email");
    var inputPhone = document.getElementById("input-phone");
    var buttonPayment = document.getElementById("button-payment");

    // Check input from user and display info
    inputEmail.addEventListener("input", function (e) {
        emailOK = checkEmailAddress();
        togglePaymentButton();
    });

    inputPhone.addEventListener("input", function (e) {
        phoneOK = checkPhoneNumber();
        togglePaymentButton();
    });

    buttonPayment.addEventListener("click", function (e) {
        if (this.classList.contains("button-disabled")) {
            this.parentNode.querySelector("div").children[1].classList.add("input-error");
        } else {
            if (checkTravelInputFields()) storeTicket(startTime, endTime, $("#input-email").val(), $("#input-phone").val());
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