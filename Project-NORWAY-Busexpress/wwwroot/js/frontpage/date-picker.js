// Create Datepicker (jQuery UI) to allow user to pick a date

var dateCounter;

function createDateSelector() {
    dateCounter = 0;

    const options = $.extend({},
        $.datepicker.regional["no"], {
        dateFormat: "DD d. M yy",
        minDate: 0,

        // Source: See readme #3
        beforeShow: function (input, inst) {
            setTimeout(function () {
                inst.dpDiv.css({
                    top: $("#date-selector").offset().top - 250,
                    left: $("#date-selector").offset().left
                });
            }, 0);
        }
    });

    $("#date-selector").datepicker(options);
    updateDate();
}

// Create a Date object and set the input value to this (until Datapicker updates it dynamically)
function updateDate() {
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }

    const dateStrings = (new Date())
        .toLocaleDateString("nb-NO", dateOptions)
        .split(" ");
    // Ex: Element 0: "tirsdag", Element 1: "24.", Element 2: "sep.", Element 3: "2020"

    $("#date-selector").val(
        captLetter(dateStrings[0]) + " " + // => "Tirsdag "
        dateStrings[1] + " " +
        captLetter(dateStrings[2]).split(".")[0] + " " + // => "Sep"
        dateStrings[3]);
}

function captLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function setDate(increase) {
    if (increase) {
        dateCounter++;
        if (dateCounter == 0) dateCounter = 1;
    } else {
        dateCounter--;
        if (dateCounter <= 0) dateCounter = -1;
    }

    $("#date-selector").datepicker("setDate", dateCounter);
}