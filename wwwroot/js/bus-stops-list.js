// Code Source: See readme #1

function createBusStopListener(inputField, inputArray) {
    var currentFocus;

    // Listen for text input, create list items that match the query, and append to same div as inputField
    inputField.addEventListener("input", function (e) {
        var outerDIV, innerDIV, inputValue = this.value;
        closeList();

        if (!inputValue || inputValue.length < 2) return false;

        currentFocus = -1;
        outerDIV = document.createElement("DIV");
        outerDIV.setAttribute("id", this.id + "-autocomplete-list");
        outerDIV.setAttribute("class", "col-md-12 autocomplete-items");
        this.parentNode.appendChild(outerDIV);

        // The loop below only checks whether the beginning of the BusStop string is same as the characters the user type in
        // Ex. Drammen Bangeløkka is only searchable by typing d-r-a... and you cannot search for Bangeløkka by itself
        // Not essential, but expected for best possible user experience
        for (var i = 0; i < inputArray.length; i++) {
            if (inputArray[i].substr(0, inputValue.length).toUpperCase() == inputValue.toUpperCase()) {
                innerDIV = document.createElement("DIV");
                innerDIV.setAttribute("class", " autocomplete-item autocomplete-item-border p-2");
                innerDIV.innerHTML = "<strong>" + inputArray[i].substr(0, inputValue.length) + "</strong>";
                innerDIV.innerHTML += inputArray[i].substr(inputValue.length);
                innerDIV.innerHTML += "<input type='hidden' value='" + inputArray[i] + "'>";

                innerDIV.addEventListener("click", function (e) {
                    inputField.value = this.getElementsByTagName("input")[0].value;
                    closeList();
                });

                outerDIV.appendChild(innerDIV);
            }
        }
        if (outerDIV.querySelector("autocomplete-item")) addActive(outerDIV.getElementsByTagName("div")); // Make top alternative active by default
    });

    // Listen for keyboard inputs
    inputField.addEventListener("keydown", function (e) {
        var list = document.getElementById(this.id + "-autocomplete-list");

        if (list) list = list.getElementsByTagName("div");

        if (e.keyCode == 40) { // down-key
            currentFocus++;
            addActive(list);
        } else if (e.keyCode == 38) { // up-key
            currentFocus--;
            addActive(list);
        } else if (e.keyCode == 13) { // enter-key
            e.preventDefault(); // Prevent the submit action
            if (currentFocus > -1) {
                if (list) list[currentFocus].click(); // Make a click action instead
            }
        }
    });

    // Add CSS class to active list item for styling purposes
    function addActive(list) {
        if (!list) return false;

        removeActive(list);

        if (currentFocus >= list.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (list.length - 1);
        list[currentFocus].classList.add("autocomplete-active");
    }

    // Remove CSS class from active list item for styling purposes
    function removeActive(list) {
        for (var i = 0; i < list.length; i++) {
            list[i].classList.remove("autocomplete-active");
        }
    }

    // Remove all list items aside from the selected one and the inputField
    function closeList(elmnt) {
        var listItems = document.getElementsByClassName("autocomplete-items");

        for (var i = 0; i < listItems.length; i++) {
            if (elmnt != listItems[i] && elmnt != inputField) {
                listItems[i].parentNode.removeChild(listItems[i]);
            }
        }
    }

    // Listen for click event on a list item
    document.addEventListener("click", function (e) {
        closeList(e.target);
    });
}