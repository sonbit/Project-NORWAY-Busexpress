// Source: #7
function displayDeleteDialog(classList) {
    $("#dialog-confirm").html(
        "<p>Ønsker du å slette denne raden?</p>" +
        "<p>Husk å lagre endringene når du er ferdig</p>"
    );

    $("#dialog-confirm").dialog({
        title: "Slett rad",
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Slett rad": function () {
                $(this).dialog("close");
                deleteRow(classList);
            }, 
            "Avbryt": function () {
                $(this).dialog("close");
            }
        }
    });
}

function displaySendToDBDialog(index) {
    $("#dialog-confirm").html(
        "<p>Ønsker du å sende endringene til databasen?</p>" +
        "<p>Husk at de nye dataene vil da overskrive de gamle. Refresh siden eller logg ut for å angre endringene</p>"
    );

    $("#dialog-confirm").dialog({
        title: "Send til database",
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Ja": function () {
                $(this).dialog("close");
                deleteData(index);
            },
            "Avbryt": function () {
                $(this).dialog("close");
            }
        }
    });
}

function displayDBConfirmationDialog() {
    $("#dialog-confirm").html(
        "<p>Dataene ble lagret i databasen</p>"
    );

    $("#dialog-confirm").dialog({
        title: "Fullført database endring",
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Ok": function () {
                $(this).dialog("close");
                deleteData(index);
            }
        }
    });
}

function displayLogOutDialog() {
    $("#dialog-confirm").html(
        "<p>Ønsker du å logge ut?</p>" +
        "<p>Data som ikke er lagret til databasen blir forkastet</p>"
    );

    $("#dialog-confirm").dialog({
        title: "Logg ut",
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Ja": function () {
                $(this).dialog("close");
                logOut();
            },
            "Avbryt": function () {
                $(this).dialog("close");
            }
        }
    });
}