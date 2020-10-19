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

function addRow() {
    var output = "";


    $("#new-row").html();
}

// Source: #6
function getIndex(array, attribute, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (typeof value === "number") value = parseInt(value);
        if (array[i][attribute] === value) return i;
    }
}