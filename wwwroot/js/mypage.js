$(function () {
    $("form").submit(function () {
        return false;
    });
});

function logIn() {
    if (checkLoginDetails()) {
        $("#invalid-login").html("");

        const user = {
            email: $("#input-email").val(),
            password: $("#input-password").val()
        }

        $.post("/logIn", user, function (response) {
            window.location.href = response;
        }).fail(function (response) {
            if (response.status === 500) $("#invalid-login").html("<strong> Ikke kontakt med databasen!</strong> Feilen er loggført. Prøv igjen senere.");
            else $("#invalid-login").html("Epost eller passord er feil");
        });
    } else {
        $("#invalid-login").html("Vennligst fyll inn i feltene over");
    }
}

function logOut() {
    $.get("/LogOut", function () {
        window.location.href = "mypage.html";
    });
}