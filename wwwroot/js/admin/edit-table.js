var delPrimaryKeys = [[],[]];
var delTables = [];
var delIndex = 0;

function deleteRow(classList) {
    var className = classList.value;
    var tableId = className.split("@")[0];
    var primaryKey = className.split("@")[1];
    var table, tableIndex;
    var attribute = "id";

    switch (tableId) {
        case tableIds[Table.Stops]:
            table = stops; tableIndex = Table.Stops;
            break;
        case tableIds[Table.Routes]:
            table = routes; tableIndex = Table.Routes; attribute = "label";
            break;
        case tableIds[Table.RouteTables]:
            table = routeTables; tableIndex = Table.RouteTables;
            break;
        case tableIds[Table.Tickets]:
            table = tickets; tableIndex = Table.Tickets;
            break;
        case tableIds[Table.TicketTypes]:
            table = ticketTypes; tableIndex = Table.TicketTypes; attribute = "label";
            break;
        case tableIds[Table.Compositions]:
            table = ticketTypeCompositions; tableIndex = Table.Compositions;
            break;
        case tableIds[Table.Users]:
            table = users; tableIndex = Table.Users;
            break;
        default:
            console.log("Error when deleteing row");
            return;
    }

    if (!delTables.includes(tableId)) delTables.push(tableId);
    delIndex = delTables.indexOf(tableId);

    if (attribute === "id") delPrimaryKeys[delIndex].push(parseInt(primaryKey));
    else delPrimaryKeys[delIndex].push(primaryKey);

    table.splice(getIndex(table, attribute, primaryKey), 1);
    displayTable(tableIndex);
}

// Source: #6
function getIndex(array, attribute, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attribute] === parseInt(value)) {
            return i;
        }
    }
}