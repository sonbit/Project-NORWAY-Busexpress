var delStops = [], delRoutes = [], delRouteTables = [], delTickets = [], delTicketTypes = [], delCompositions = [], delUsers = [];
var delPrimaryKeys = [];

var editStops = [], editROutes = [], editRouteTables = [], editTickets = [], editTicketTypes = [], editCompositions = [], editUsers = [];

var edit = false;

function purgeTempData() {
    delStops = [], delRoutes = [], delRouteTables = [], delTickets = [], delTicketTypes = [], delCompositions = [], delUsers = [];
    editStops = [], editROutes = [], editRouteTables = [], editTickets = [], editTicketTypes = [], editCompositions = [], editUsers = [];
    delPrimaryKeys = [];
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
            //if (delTickets.length === 0) {
            //    delTickets.push(tableId);
            //    delPrimaryKeys.push(delTickets);
            //} 
            //delTickets.push(parseInt(primaryKey));
            //currentTable = tickets; tableIdIndex = Table.Tickets; 
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
            //if (delCompositions.length === 0) {
            //    delCompositions.push(tableId);
            //    delPrimaryKeys.push(delCompositions);
            //} 
            //delCompositions.push(parseInt(primaryKey));
            //currentTable = ticketTypeCompositions; tableIdIndex = Table.Compositions; 
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

    var delIndex = getIndex(currentTable, attribute, primaryKey);
    currentTable.splice(delIndex, 1); // Delete entry from array
    deleteAdjustIds(currentTable, delIndex);
   
    createTable(tableIdIndex); // Recreate table to reflect change
}

// Method readjusts table ids to reflect deletion, ie: if id 5 is deleted, id 6=> will have their ids decreased by one
function deleteAdjustIds(objects) {
    return; //DISABLED for the time being

    var tempTable = [];
    var found = false;
    var nextId = 1;

    for (let object of objects) {
        if (object.id !== nextId) found = true;
        if (found) object.id--;
        tempTable.push(object);
        nextId = object.id + 1;
    }
}

// Method handles both edits to entries and adding new entries
function editRow(tableId) {
    var primaryKey;
    var inputValues = [];

    var idSplit = tableId.split("0"); // Ex: "edit0stops@1"
    if (idSplit[0] === "add") tableId = idSplit[1];
    else if (idSplit[0] === "edit") {
        idSplit = idSplit[1];
        tableId = idSplit.split("@")[0]; // Table ID => "stops"
        primaryKey = parseInt(idSplit.split("@")[1]); // Primary Key of row => "1"
        edit = true;
    }

    var tableName = "";
    var placeholders = [];
    var inputTypes = [];

    switch (tableId) {
        case tableIds[Table.Stops]:
            tableName = "stopp";
            placeholders = ["Id", "Stoppnavn", "Minutter", "Rutenavn"];
            inputTypes = ["number", "text", "number", "select"];

            if (edit) {
                for (let stop of stops) {
                    if (stop.id === primaryKey) {
                        inputValues = [stop.id, stop.name, stop.minutesFromHub, stop.route.label];
                    }    
                }
            }     

            break;
        case tableIds[Table.Routes]:
            tableName = "rute";
            placeholders = ["Rutenavn", "Kr per min", "Midtstopp"];
            inputTypes = ["text", "number", "text"];

            if (edit) {
                for (let route of routes) {
                    if (route.label === primaryKey) {
                        inputValues = [route.label, route.pricePerMin, route.midwayStop];
                    }
                }
            }     

            break;
        case tableIds[Table.RouteTables]:
            tableName = "rutetabell";
            placeholders = ["Id", "Rutenavn", "Fra Oslo?", "Full lengde?", "Start tid", "Slutt tid"];
            inputTypes = ["number", "select", "text", "text", "text", "text"];

            if (edit) {
                for (let routeTable of routeTables) {
                    if (routeTable.id === primaryKey) {
                        inputValues = [routeTable.id, routeTable.route.label, boolToNor(routeTable.fromHub),
                            boolToNor(routeTable.fullLength), routeTable.startTime, routeTable.endTime];
                    }
                }
            }     

            break;
        case tableIds[Table.Tickets]:
            return; // Cannot create tickets other than by purchase
        case tableIds[Table.TicketTypes]:
            tableName = "billettype";
            placeholders = ["Type", "Forklaring", "Prisforhold"];
            inputTypes = ["text", "text", "number"];

            if (edit) {
                for (let ticketType of ticketTypes) {
                    if (ticketType.label === primaryKey) {
                        inputValues = [ticketType.label, ticketType.clarification, ticketType.priceModifier];
                    }
                }
            }     

            break;
        case tableIds[Table.Compositions]:
            return; // These are created during ticket purchase
        case tableIds[Table.Users]:
            tableName = "bruker";
            placeholders = ["Id", "Email", "Er admin", "Passord"];
            inputTypes = ["number", "email", "text", "text"];

            if (edit) {
                for (let user of users) {
                    if (user.id === primaryKey) {
                        inputValues = [user.id, user.email, boolToNor(user.admin), ""];
                    }
                }
            }     

            break;
        default:
            console.log("Error when adding row: " + tableId);
            return;
    }

    var output =
        "<div id='edit-modal-header' class='row p-1'>";

    if (inputValues.length === 0) output += "<p class='text-center col mb-0'>Legg til " + tableName + "</p>";
    else output += "<p class='text-center col mb-0'>Endre " + tableName + "</p>";

    output+=
        "<button class='float-right' onclick='hideEditor()'>&times;</button>" +
        "</div>" + 
        "<div id='edit-modal-body' class='row py-3'>";

    for (var i = 0; i < placeholders.length; i++) {
        output +=
            "<div class='col-xl-6 col-lg-12'>" +
            "<label class='mt-1' for='" + tableName + "-" + i + "'>" + placeholders[i] + "</label>";

        if (inputValues.length === 0 && inputTypes[i] !== "select") {
            output += "<input id='" + tableName + "-" + i + "' class='form-control' type='" + inputTypes[i] + "' placeholder='" + placeholders[i] + "' /></div>";
        } else if (edit && inputTypes[i] !== "select" && i > 0) {
            output += "<input id='" + tableName + "-" + i + "' class='form-control' value='" + inputValues[i] + "' type='" + inputTypes[i] + "' placeholder='" + placeholders[i] + "' /></div>";
        } else if (edit && i === 0) {
            output += "<input disabled id='" + tableName + "-" + i + "' class='form-control' value='" + inputValues[i] + "' type='" + inputTypes[i] + "' placeholder='" + placeholders[i] + "' /></div>";
        } else if (edit) {
            output += "<select id='" + tableName + "-" + i + "' class='form-control'>";
            for (let route of routes) {
                if (route.label === inputValues[i])
                    output += "<option selected>" + route.label + "</option>";
                else output += "<option>" + route.label + "</option>";
            }
            output += "</select></div>";
        } else {
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

    preventIncorrectNumberInput();
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
            editStops.push(newStop);
            stops = insertAdjustIds(stops, newStop, primaryKey);
            break;
        case tableIds[Table.Routes]: // Doesn't require insert into as primary key is a label
            tableIdIndex = Table.Routes; primaryKey = values[0];
            var newRoute = { label: primaryKey, pricePerMin: values[1], midwayStop: values[2] };
            editROutes.push(newRoute);
            routes.push(newRoute);
            break;
        case tableIds[Table.RouteTables]:
            tableIdIndex = Table.RouteTables; primaryKey = parseInt(values[0]);
            var newRouteTable = { id: primaryKey, route: { label: selects[0].value }, fromHub: values[1], fullLength: values[2], startTime: values[3], endTime: values[4] };
            editRouteTables.push(newRouteTable);
            routeTables = insertAdjustIds(routeTables, newRouteTable, primaryKey);
            break;
        case tableIds[Table.Tickets]:
            return; // Cannot create tickets other than by purchase
        case tableIds[Table.TicketTypes]: // Doesn't require insert into as primary key is a label
            tableIdIndex = Table.TicketTypes; primaryKey = values[0];
            var newTicketType = { label: primaryKey, clarification: values[1], priceModifier: values[2] };
            editTicketTypes.push(newTicketType);
            ticketTypes.push(newTicketType);
            break;
        case tableIds[Table.Compositions]:
            return; // These are created during ticket purchase
        case tableIds[Table.Users]:
            tableIdIndex = Table.Users; primaryKey = parseInt(values[0]);
            var newUser = { id: primaryKey, email: values[1], admin: norToBool(values[2]) };
            editUsers.push(newUser);
            users = insertAdjustIds(users, newUser, primaryKey);
            break;
        default:
            console.log("Error when finishing edit row: " + tableId);
            return;
    }
    hideEditor();
    createTable(tableIdIndex);
}

function hideEditor() {
    document.getElementById("edit-modal-overlay").style.display = "none";
    document.getElementById("edit-modal").style.display = "none";
}

// Method inserts new entry into table, by checking whether the id exists
function insertAdjustIds(objects, newObject, primaryKey) {
    var tempTable = [];
    var found = false;
    var fillEmpty = false;
    var nextId = 1;
    var skip = false;

    for (let object of objects) {
        if (object.id === parseInt(primaryKey)) { // Inject into row if admin desires
            tempTable.push(newObject);
            found = true;
            if(edit) skip = true; 
        } else if (object.id !== nextId && newObject.id === nextId) { // Fill empty row if admin desires
            tempTable.push(newObject);
            fillEmpty = true;
        }

        if (found && !edit) object.id++; // If injected, increase id for the following rows

        if (!skip) tempTable.push(object);
        skip = false;

        nextId = object.id + 1;
    }

    if (!found && !fillEmpty) { // Id doesn't exist, thus add new entry to straight after last entry
        newObject.id = nextId; 
        tempTable.push(newObject); 
    }
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

function preventIncorrectNumberInput() {
    document.querySelector("input").addEventListener("keypress", function (event) {
        if (event.which != 8 && event.which != 0 && event.which < 48 || event.which > 57) {
            event.preventDefault();
        } 
    });
}