// Source: #7
function displayDeleteDialog(classList) {
    $("#dialog-confirm").html(
        "<p>Ønsker du å slette denne raden?</p>" +
        "<p>Obs: Endringer må lagres før databasen oppdateres.</p>"
    );

    $("#dialog-confirm").dialog({
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