var delPrimaryKeys = [];
var delTables = [];

$(function () {
    purgeDeletedDataSets();
})

function purgeDeletedDataSets() {
    delPrimaryKeys = [];
    delTables = [];
}

function deleteRow(id) {
    var tableId = id.split("@")[0];
    var primaryKey = id.split("@")[1];
    var currentTable = [];
    var attribute = "id";

    var tableIdIndex;

    switch (tableId) {
        case tableIds[Table.Stops]:
            currentTable = stops; tableIdIndex = Table.Stops;
            break;
        case tableIds[Table.Routes]:
            currentTable = routes; tableIdIndex = Table.Routes; attribute = "label";
            break;
        case tableIds[Table.RouteTables]:
            currentTable = routeTables; tableIdIndex = Table.RouteTables;
            break;
        case tableIds[Table.Tickets]:
            currentTable = tickets; tableIdIndex = Table.Tickets;
            break;
        case tableIds[Table.TicketTypes]:
            currentTable = ticketTypes; tableIdIndex = Table.TicketTypes; attribute = "label";
            break;
        case tableIds[Table.Compositions]:
            currentTable = ticketTypeCompositions; tableIdIndex = Table.Compositions;
            break;
        case tableIds[Table.Users]:
            currentTable = users; tableIdIndex = Table.Users;
            break;
        default:
            console.log("Error when deleting row: " + tableId);
            return;
    }

    if (attribute.includes("id")) primaryKey = parseInt(primaryKey); // Primary keys are both numbers and strings

    if (!delTables.includes(tableId)) delTables.push(tableId);  // Populate array with name of newly edited tables, if this is first edit
    var tableIndex = delTables.indexOf(tableId); // Get the index of the edited table, so that we may add the primary key to the correct row in the 2d array below

    delPrimaryKeys[tableIndex] = primaryKey; // Add the primary key of new deletions to corresponding row in 2d array
    currentTable.splice(getIndex(currentTable, attribute, primaryKey), 1); // Delete entry from array
    createTable(tableIdIndex); // Recreate table to reflect change
}

function addRow(tableId) {
    var placeholders = [];
    var dataType = [];

    switch (tableId) {
        case tableIds[Table.Stops]:
            placeholders = ["Id", "Stoppnavn", "Minutter", "Rutenavn"];
            break;
        case tableIds[Table.Routes]:
            placeholders = ["Rutenavn", "Kr per min", "Midtstopp"];
            break;
        case tableIds[Table.RouteTables]:
            placeholders = ["Id", "Rutenavn", "Fra Oslo?", "Full lengde?", "Start tid", "Slutt tid"];
            break;
        case tableIds[Table.Tickets]:
            placeholders = []; // Cannot create tickets other than by purchase
            break;
        case tableIds[Table.TicketTypes]:
            placeholders = ["Type", "Forklaring", "Prisforhold"];
            break;
        case tableIds[Table.Compositions]:
            placeholders = []; // These are created during ticket purchase
            break;
        case tableIds[Table.Users]:
            placeholders = ["Id", "Email", "Er admin", "Passord"];
            break;
        default:
            console.log("Error when adding row: " + tableId);
            return;
    }

    //var output =
    //    "<div class='modal fade' id='myModal' role='dialog'>" +
    //    "<div class='modal-dialog'>" +
    //    "<div class='modal-content'>" +
    //    "<div class='modal-header'>" +
    //    "<button type='button' class='close' data-dismiss='modal'>&times;</button>" +
    //    "<h4 class='modal-title'>Modal Header</h4>" +
    //    "</div>" +
    //    "<div class='modal-body'>" +
    //    "<p>Some text in the modal.</p>" +
    //    "</div>" +
    //    "<div class='modal-footer'>" +
    //    "<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>" +
    //    "</div>" +
    //    "</div>" +
    //    "</div>" +
    //    "</div>";
    var output = "";
    for (var i = 0; i < placeholders.length; i++)
        output += placeholders[i] + " ";

    $("#new-row").html(output);
}

// Source: #6
function getIndex(array, attribute, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (typeof value === "number") value = parseInt(value);
        if (array[i][attribute] === value) return i;
    }
}