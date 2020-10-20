var delStops = [], delRoutes = [], delRouteTables = [], delTickets = [], delTicketTypes = [], delCompositions = [], delUsers = [];
var delPrimaryKeys = [];

var addObjects = [];
var addTables = [];
var addObject = [];

function purgeTempData() {
    delStops = [], delRoutes = [], delRouteTables = [], delTickets = [], delTicketTypes = [], delCompositions = [], delUsers = [];
    console.log("Data purged");
}

function deleteRow(id) {
    var tableId = id.split("@")[0];
    var primaryKey = id.split("@")[1];

    var currentTable = [];
    var attribute = "id";
    var tableIdIndex;

    switch (tableId) {
        case tableIds[Table.Stops]:
            if (delStops.length === 0) {
                delStops.push(tableId);
                delPrimaryKeys.push(delStops);
            }
            delStops.push(parseInt(primaryKey));
            currentTable = stops; tableIdIndex = Table.Stops; 
            break;
        case tableIds[Table.Routes]:
            if (delRoutes.length === 0) {
                delRoutes.push(tableId);
                delPrimaryKeys.push(delRoutes);
            } 
            delRoutes.push(primaryKey);
            currentTable = routes; tableIdIndex = Table.Routes; attribute = "label"; 
            break;
        case tableIds[Table.RouteTables]:
            if (delRouteTables.length === 0) {
                delRouteTables.push(tableId);
                delPrimaryKeys.push(delRouteTables);
            } 
            delRouteTables.push(parseInt(primaryKey));
            currentTable = routeTables; tableIdIndex = Table.RouteTables;
            break;
        case tableIds[Table.Tickets]:
            if (delTickets.length === 0) {
                delTickets.push(tableId);
                delPrimaryKeys.push(delTickets);
            } 
            delTickets.push(parseInt(primaryKey));
            currentTable = tickets; tableIdIndex = Table.Tickets; 
            break;
        case tableIds[Table.TicketTypes]:
            if (delTicketTypes.length === 0) {
                delTicketTypes.push(tableId);
                delPrimaryKeys.push(delTicketTypes);
            } 
            delTicketTypes.push(primaryKey);
            currentTable = ticketTypes; tableIdIndex = Table.TicketTypes; attribute = "label"; 
            break;
        case tableIds[Table.Compositions]:
            if (delCompositions.length === 0) {
                delCompositions.push(tableId);
                delPrimaryKeys.push(delCompositions);
            } 
            delCompositions.push(parseInt(primaryKey));
            currentTable = ticketTypeCompositions; tableIdIndex = Table.Compositions; 
            break;
        case tableIds[Table.Users]:
            if (delUsers.length === 0) {
                delUsers.push(tableId);
                delPrimaryKeys.push(delUsers);
            } 
            delUsers.push(parseInt(primaryKey));
            currentTable = users; tableIdIndex = Table.Users; 
            break;
        default:
            console.log("Error when deleting row: " + tableId);
            return;
    }
    console.log(delPrimaryKeys);
    currentTable.splice(getIndex(currentTable, attribute, primaryKey), 1); // Delete entry from array
    createTable(tableIdIndex); // Recreate table to reflect change
}

function addRow(tableId) {
    var currentTable = [];
    var tableName = "";
    var placeholders = [];
    var inputTypes = [];

    switch (tableId) {
        case tableIds[Table.Stops]:
            currentTable = stops;
            tableName = "stopp";
            placeholders = ["Id", "Stoppnavn", "Minutter", "Rutenavn"];
            inputTypes = ["number", "text", "number", "select"];
            break;
        case tableIds[Table.Routes]:
            currentTable = routes;
            tableName = "rute";
            placeholders = ["Rutenavn", "Kr per min", "Midtstopp"];
            inputTypes = ["text", "number", "text"];
            break;
        case tableIds[Table.RouteTables]:
            currentTable = routeTables;
            tableName = "rutetabell";
            placeholders = ["Id", "Rutenavn", "Fra Oslo?", "Full lengde?", "Start tid", "Slutt tid"];
            inputTypes = ["number", "select", "text", "text", "text", "text"];
            break;
        case tableIds[Table.Tickets]:
            return; // Cannot create tickets other than by purchase
        case tableIds[Table.TicketTypes]:
            currentTable = ticketTypes;
            tableName = "billettype";
            placeholders = ["Type", "Forklaring", "Prisforhold"];
            inputTypes = ["text", "text", "number"];
            break;
        case tableIds[Table.Compositions]:
            return; // These are created during ticket purchase
        case tableIds[Table.Users]:
            currentTable = users;
            tableName = "bruker";
            placeholders = ["Id", "Email", "Er admin", "Passord"];
            inputTypes = ["number", "email", "text", "text"];
            break;
        default:
            console.log("Error when adding row: " + tableId);
            return;
    }

    var output =
        "<div id='edit-modal-header' class='row p-1'>" +
        "<p class='text-center col mb-0'>Legg til " + tableName + "</p>" +
        "<button class='float-right' onclick='hideEditor()'>&times;</button>" +
        "</div>" + 
        "<div id='edit-modal-body' class='row py-3'>";

    for (var i = 0; i < placeholders.length; i++) {
        output +=
            "<div class='col-xl-3'>" +
            "<label class='mt-1' for='" + tableName + "-" + i + "'>" + placeholders[i] + "</label>";

        if (inputTypes[i] !== "select")
            output += "<input id='" + tableName + "-" + i + "' class='form-control' type='" + inputTypes[i] + "' placeholder='" + placeholders[i] + "' /></div>";
        else {
            output += "<select id='" + tableName + "-" + i + "' class='form-control'>";
            for (let route of routes) output += "<option>" + route.label + "</option>";
            output += "</select></div>";
        }
    }

    output +=
    "</div>" +
    "<div id='edit-modal-footer' class='row p-1'>" +
    "<button id='" + tableId + "' class='col-xl-2 ml-auto' onclick='finishEdit(this.id)'>Ferdig</button>" +
    "<button class='col-xl-2 mt-3 mt-xl-0' onclick='hideEditor()'>Avbryt</button>" +
    "</div>";

    $("#edit-modal").html(output);

    document.getElementById("edit-modal-overlay").style.display = "block";
    document.getElementById("edit-modal").style.display = "block";
}

function finishEdit(tableId) {
    var tableIdIndex;
    var primaryKey;
    var inputs = document.getElementById("edit-modal-body").getElementsByTagName("input");
    var selects = document.getElementById("edit-modal-body").getElementsByTagName("select");
    var values = [];

    for (var i = 0; i < inputs.length; i++) values.push(inputs[i].value);

    switch (tableId) {
        case tableIds[Table.Stops]:
            tableIdIndex = Table.Stops; primaryKey = parseInt(values[0]);
            var newStop = { id: primaryKey, name: values[1], minutesFromHub: values[2], route: { label: selects[0].value } };
            stops = insertToTable(stops, newStop, primaryKey);
            break;
        case tableIds[Table.Routes]: // Doesn't require insert into as primary key is a label
            tableIdIndex = Table.Routes; primaryKey = values[0];
            routes.push({ label: primaryKey, pricePerMin: values[1], midwayStop: values[2] });
            break;
        case tableIds[Table.RouteTables]:
            tableIdIndex = Table.RouteTables; primaryKey = parseInt(values[0]);
            var newRouteTable = { id: primaryKey, route: { label: selects[0].value }, fromHub: values[2], fullLength: values[3], startTIme: values[4], endTime: values[5] };
            routeTables = insertToTable(routeTables, newRouteTable, primaryKey);
            break;
        case tableIds[Table.Tickets]:
            return; // Cannot create tickets other than by purchase
        case tableIds[Table.TicketTypes]: // Doesn't require insert into as primary key is a label
            tableIdIndex = Table.TicketTypes; primaryKey = values[0];
            ticketTypes.push({ label: primaryKey, clarification: values[1], priceModifier: values[2] });
            break;
        case tableIds[Table.Compositions]:
            return; // These are created during ticket purchase
        case tableIds[Table.Users]:
            tableIdIndex = Table.Users; primaryKey = parseInt(values[0]);
            var newUser = { id: primaryKey, email: values[1], admin: norToBool(values[2]) };
            users = insertToTable(users, newUser, primaryKey);
            break;
        default:
            console.log("Error when finishing edit row: " + tableId);
            return;
    }

    if (!addTables.includes(tableId)) addTables.push(tableId);  // Populate array with name of newly edited tables, if this is first edit
    var tableIndex = addTables.indexOf(tableId); // Get the index of the edited table, so that we may add the primary key to the correct row in the 2d array below

    addObjects.push(addObject); // Add the primary key of new additions to corresponding row in 2d array

    console.log(addObjects);

    hideEditor();
    createTable(tableIdIndex);
}

function hideEditor() {
    document.getElementById("edit-modal-overlay").style.display = "none";
    document.getElementById("edit-modal").style.display = "none";
}

// Method inserts new entry into table, by checking whether the id exists
function insertToTable(objects, newObject, primaryKey) {
    var tempTable = [];
    var found = false;
    var lastId = 0;

    for (let object of objects) {
        if (object.id === parseInt(primaryKey)) {
            tempTable.push(newObject);
            found = true;
        }
        if (found) object.id++;
        tempTable.push(object);

        lastId = object.id;
    }

    if (!found) {
        newObject.id = ++lastId;
        tempTable.push(newObject);
    }

    addObject = newObject;

    return tempTable;
}

// Source: #6
function getIndex(array, attribute, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (attribute === "id") value = parseInt(value);
        if (array[i][attribute] === value) return i;
    }
}

function norToBool(norString) {
    return (norString.toLowerCase() === "ja") ? true : false;
}