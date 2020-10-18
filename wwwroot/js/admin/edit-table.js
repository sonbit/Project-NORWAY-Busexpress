var delPrimaryKeys = [];
var delTables = [];

$(function () {
    purgeDeletedDataSets();
})

function purgeDeletedDataSets() {
    delPrimaryKeys = [];
    delTables = [];
}

function deleteRow(classList) {
    var className = classList.value;
    var tableId = className.split("@")[0];
    var primaryKey = className.split("@")[1];
    var table = [], delTable = [];
    var attribute = "id";

    var index;

    switch (tableId) {
        case tableIds[Table.Stops]:
            table = stops; index = Table.Stops;
            break;
        case tableIds[Table.Routes]:
            table = routes; index = Table.Routes; attribute = "label";
            break;
        case tableIds[Table.RouteTables]:
            table = routeTables; index = Table.RouteTables;
            break;
        case tableIds[Table.Tickets]:
            table = tickets; index = Table.Tickets;
            break;
        case tableIds[Table.TicketTypes]:
            table = ticketTypes; index = Table.TicketTypes; attribute = "label";
            break;
        case tableIds[Table.Compositions]:
            table = ticketTypeCompositions; index = Table.Compositions;
            break;
        case tableIds[Table.Users]:
            table = users; index = Table.Users;
            break;
        default:
            console.log("Error when deleting row: " + tableId);
            return;
    }

    if (attribute.includes("id")) delTable.push(parseInt(primaryKey));
    else if (attribute.includes("label")) delTable.push(primaryKey);

    if (!delTables.includes(tableId)) delTables.push(tableId);

    delPrimaryKeys[delTables.indexOf(tableId)] = delTable;
    table.splice(getIndex(table, attribute, primaryKey), 1);
    createTable(index);
}

function addRow() {
    var output = "";


    $("#new-row").html();
}

// Source: #6
function getIndex(array, attribute, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attribute] === parseInt(value)) {
            return i;
        }
    }
}