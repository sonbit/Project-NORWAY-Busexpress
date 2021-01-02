var delStops = [], delRoutes = [], delRouteTables = [], delTickets = [], delTicketTypes = [], delCompositions = [], delUsers = [];
var delPrimaryKeys = [];

var editStops = [], editRoutes = [], editRouteTables = [], editTickets = [], editTicketTypes = [], editCompositions = [], editUsers = [];
var newEntries = [];

var edit = false;
var insert = false;

function purgeTempData() {
    delStops = [], delRoutes = [], delRouteTables = [], delTickets = [], delTicketTypes = [], delCompositions = [], delUsers = [];
    editStops = [], editRoutes = [], editRouteTables = [], editTickets = [], editTicketTypes = [], editCompositions = [], editUsers = [];
    delPrimaryKeys = [];
    newEntries = [];
    console.log("Data purged");
}

function deleteRow(id) {
    var tableId = id.split("@")[0];
    var primaryKey = id.split("@")[1];

    var currentTable = [];
    var currentEditTable = [];
    var attribute = "id";
    var tableIdIndex;

    switch (tableId) {
        case tableIds[Table.Stops]:
            // Might consider a newEdits array to carry edited data to avoid having to iterate through all data, especially Stops that can be large
            for (var i = 0; i < editStops.length; i++) if (editStops[i].id === parseInt(primaryKey)) currentEditTable = editStops;

            tableIdIndex = Table.Stops;
            currentTable = stops; 

            if (!newEntry(tableId, primaryKey)) {
                if (delStops.length === 0) {
                    delStops.push(tableId);
                    delPrimaryKeys.push(delStops);
                }
                delStops.push(parseInt(primaryKey));
            }

            break;
        case tableIds[Table.Routes]:
            for (var i = 0; i < editRoutes.length; i++) if (editRoutes[i].id === parseInt(primaryKey)) currentEditTable = editRoutes;

            tableIdIndex = Table.Routes;
            currentTable = routes;
            attribute = "label"; 

            if (!newEntry(tableId, primaryKey)) {
                if (delRoutes.length === 0) {
                    delRoutes.push(tableId);
                    delPrimaryKeys.push(delRoutes);
                }
                delRoutes.push(primaryKey);
            }

            break;
        case tableIds[Table.RouteTables]:
            for (var i = 0; i < editRouteTables.length; i++) if (editRouteTables[i].id === parseInt(primaryKey)) currentEditTable = editRouteTables;

            tableIdIndex = Table.RouteTables;
            currentTable = routeTables;

            if (!newEntry(tableId, primaryKey)) {
                if (delRouteTables.length === 0) {
                    delRouteTables.push(tableId);
                    delPrimaryKeys.push(delRouteTables);
                }
                delRouteTables.push(parseInt(primaryKey));
            }

            break;
        case tableIds[Table.Tickets]: // Cannot delete entries
            break;
        case tableIds[Table.TicketTypes]:
            for (var i = 0; i < editTicketTypes.length; i++) if (editTicketTypes[i].id === parseInt(primaryKey)) currentEditTable = editTicketTypes;

            tableIdIndex = Table.TicketTypes;
            currentTable = ticketTypes;
            attribute = "label"; 

            if (!newEntry(tableId, primaryKey)) {
                if (delTicketTypes.length === 0) {
                    delTicketTypes.push(tableId);
                    delPrimaryKeys.push(delTicketTypes);
                }
                delTicketTypes.push(primaryKey);
            }

            break;
        case tableIds[Table.Compositions]: // Cannot delete entries
            break;
        case tableIds[Table.Users]:
            for (var i = 0; i < editUsers.length; i++) if (editUsers[i].id === parseInt(primaryKey)) currentEditTable = editUsers;

            tableIdIndex = Table.Users;
            currentTable = users;

            if (!newEntry(tableId, primaryKey)) {
                if (delUsers.length === 0) {
                    delUsers.push(tableId);
                    delPrimaryKeys.push(delUsers);
                }
                delUsers.push(parseInt(primaryKey));
            }

            break;
        default:
            console.log("Error when deleting row: " + tableId);
            return;
    }

    var delIndex = getIndex(currentTable, attribute, primaryKey);
    currentTable.splice(delIndex, 1); // Delete entry from array

    if (currentEditTable.length !== 0) currentEditTable.splice(getIndex(currentEditTable, attribute, primaryKey), 1); // Delete entry from edit table, ie. delete a new entry or an edited entry

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

    var idSplit = tableId.split("*"); // Ex: "edit0stops@1"
    if (idSplit[0] === "add") tableId = idSplit[1];
    else if (idSplit[0] === "edit") {
        idSplit = idSplit[1];
        tableId = idSplit.split("@")[0]; // Table ID => "stops"
        primaryKey = idSplit.split("@")[1]; // Primary Key of row => "1"
        edit = true;
    }

    var tableName = "";
    var placeholders = [];
    var inputTypes = [];

    switch (tableId) {
        case tableIds[Table.Stops]:
            tableNameNor = "stopp";
            placeholders = ["Id", "Stoppnavn", "Minutter", "Rutenavn"];
            inputTypes = ["number", "text", "number", "select"];

            if (edit) {
                for (let stop of stops) {
                    if (stop.id === parseInt(primaryKey)) {
                        inputValues = [stop.id, stop.name, stop.minutesFromHub, stop.route.label];
                    }    
                }
            }     

            break;
        case tableIds[Table.Routes]:
            tableNameNor = "rute";
            placeholders = ["Rutenavn", "Kr per min", "Midtstopp"];
            inputTypes = ["text", "text", "select"];

            if (edit) {
                for (let route of routes) {
                    if (route.label === primaryKey) {
                        inputValues = [route.label, route.pricePerMin, route.midwayStop];
                    }
                }
            }     

            break;
        case tableIds[Table.RouteTables]:
            tableNameNor = "rutetabell";
            placeholders = ["Id", "Rutenavn", "Fra Oslo?", "Full lengde?", "Start tid", "Slutt tid"];
            inputTypes = ["number", "select", "select-bool", "select-bool", "text", "text"];

            if (edit) {
                for (let routeTable of routeTables) {
                    if (routeTable.id === parseInt(primaryKey)) {
                        inputValues = [routeTable.id, routeTable.route.label, boolToNor(routeTable.fromHub),
                            boolToNor(routeTable.fullLength), routeTable.startTime, routeTable.endTime];
                    }
                }
            }     

            break;
        case tableIds[Table.Tickets]:
            return; // Cannot create tickets other than by purchase
        case tableIds[Table.TicketTypes]:
            tableNameNor = "billettype";
            placeholders = ["Type", "Forklaring", "Prisforhold"];
            inputTypes = ["text", "text", "text"];

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
            inputTypes = ["number", "text", "select-bool", "text"];

            if (edit) {
                for (let user of users) {
                    if (user.id === parseInt(primaryKey)) {
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
        "<form id='edit-form'><div id='edit-modal-body' class='row py-3'>";

    // For loop generates the input and select fields when either adding a new entry, or editing and exisitng one
    // Readability could be improved
    for (var i = 0; i < placeholders.length; i++) {
        output +=
            "<div class='col-xl-6 col-lg-12'>" +
            "<label class='mt-1' for='" + tableId + "-" + i + "'>" + placeholders[i] + "</label>";

        if (inputValues.length === 0 && !inputTypes[i].includes("select")) {
            output += "<input id='" + tableId + "-" + i + "' class='form-control' type='" + inputTypes[i] + "' placeholder='" + placeholders[i] + "' />";
        } else if (edit && !inputTypes[i].includes("select") && i > 0) {
            output += "<input id='" + tableId + "-" + i + "' class='form-control' value='" + inputValues[i] + "' type='" + inputTypes[i] + "' placeholder='" + placeholders[i] + "' />";
        } else if (edit && i === 0) {
            output += "<input disabled id='" + tableId + "-" + i + "' class='form-control' value='" + inputValues[i] + "' type='" + inputTypes[i] + "' placeholder='" + placeholders[i] + "' />";
        } else if (edit && inputTypes[i] !== "select-bool" && tableId !== "routes") {
            output += "<select id='" + tableId + "-" + i + "' class='form-control'>";
            for (let route of routes) {
                if (route.label === inputValues[i]) output += "<option selected>" + route.label + "</option>";
                else output += "<option>" + route.label + "</option>";
            }
            output += "</select>";
        } else if (edit && tableId !== "routes") {
            output +=
                "<select id='" + tableId + "-" + i + "' class='form-control'>" +
                reverseBoolNor(inputValues[i]) +
                "</select>";
        } else if (inputTypes[i] === "select-bool" && tableId !== "routes") {
            output +=
                "<select id='" + tableId + "-" + i + "' class='form-control'>" +
                "<option>Ja</option>" +
                "<option selected>Nei</option>" +
                "</select>";
        } else if (inputTypes[i] === "select" && tableId === "routes") {
            output += "<select id='" + tableId + "-" + i + "' class='form-control'>";
            for (let stop of stops) {
                if (stop.name === inputValues[i]) output += "<option selected>" + stop.name + "</option>";
                else output += "<option>" + stop.name + "</option>";
            } 
            output += "</select>";
        } else {
            output += "<select id='" + tableId + "-" + i + "' class='form-control'>";
            for (let route of routes) output += "<option>" + route.label + "</option>";
            output += "</select>";
        }

        output += "<span id='input-error-" + i + "' class='input-error'></span></div>";
    }

    output +=
    "</div>" +
    "<div id='edit-modal-footer' class='row p-1'>" +
    "<button id='" + tableId + "' class='col-xl-2 ml-auto' onclick='finishEdit(this.id)'>Ferdig</button>" +
    "<button type='button' class='col-xl-2 mt-3 mt-xl-0' onclick='hideEditor()'>Avbryt</button>" +
    "</div></form>";

    $("#edit-modal").html(output);

    document.getElementById("edit-modal-overlay").style.display = "block";
    document.getElementById("edit-modal").style.display = "block";

    preventIncorrectNumberInput();

    // Stop page reload on enter key
    $("#edit-form").submit(function (event) {
        event.preventDefault();
    });

    editModalResizeListener();
}

// When done creating a new entry, or editing an existing one, store the input values an add them to temporary arrays
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
            var newStop = { id: primaryKey, name: values[1], minutesFromHub: values[2], route: { label: selects[0].value }, edit };

            if (validateStop(newStop)) {
                if (!edit) newEntries.push(tableId + "-" + newStop.id);
                editStops = checkEdits(editStops, newStop);
                stops = insertAdjustIds(stops, newStop);
                checkDeletes(tableId, newStop);
            } else {
                return;
            }
            break;
        case tableIds[Table.Routes]: // Doesn't require insert into as primary key is a label
            tableIdIndex = Table.Routes; primaryKey = values[0];
            var newRoute = { label: primaryKey, pricePerMin: values[1], midwayStop: selects[0].value, edit };

            if (validateRoute(newRoute)) {
                if (!edit) newEntries.push(tableId + "-" + newRoute.label);
                editRoutes.push(newRoute);
                routes = insertAdjustIds(routes, newRoute);
            } else {
                return;
            }
            
            break;
        case tableIds[Table.RouteTables]:
            tableIdIndex = Table.RouteTables; primaryKey = parseInt(values[0]);
            var newRouteTable = {
                id: primaryKey, route: { label: selects[0].value }, fromHub: norToBool(selects[1].value),
                fullLength: norToBool(selects[2].value), startTime: values[1], endTime: values[2], edit
            };

            if (validateRouteTable(newRouteTable)) {
                if (!edit) newEntries.push(tableId + "-" + newRouteTable.id);
                editRouteTables = checkEdits(editRouteTables, newRouteTable);
                routeTables = insertAdjustIds(routeTables, newRouteTable);
                checkDeletes(tableId, newRouteTable);
            } else {
                return;
            }
            
            break;
        case tableIds[Table.Tickets]:
            return; // Cannot create tickets other than by purchase
        case tableIds[Table.TicketTypes]: // Doesn't require insert into as primary key is a label
            tableIdIndex = Table.TicketTypes; primaryKey = values[0];
            var newTicketType = { label: primaryKey, clarification: values[1], priceModifier: values[2], edit };

            if (validateTicketType(newTicketType)) {
                if (!edit) newEntries.push(tableId + "-" + newTicketType.label);
                editTicketTypes.push(newTicketType);
                ticketTypes = insertAdjustIds(ticketTypes, newTicketType);
            } else {
                return;
            }
           
            break;
        case tableIds[Table.Compositions]:
            return; // These are created during ticket purchase
        case tableIds[Table.Users]:
            tableIdIndex = Table.Users; primaryKey = parseInt(values[0]);

            if (primaryKey === 1) primaryKey = 2;

            var newUser = { id: primaryKey, email: values[1], admin: norToBool(selects[0].value), password: values[2], edit };

            if (validateUser(newUser, edit)) {
                if (!edit) newEntries.push(tableId + "-" + newUser.id);
                editUsers = checkEdits(editUsers, newUser);
                users = insertAdjustIds(users, newUser);
                checkDeletes(tableId, newUser);
            } else {
                return;
            }
            
            break;
        default:
            console.log("Error when finishing edit row: " + tableId);
            return;
    }

    edit = false;

    hideEditor();
    createTable(tableIdIndex);
}

function hideEditor() {
    document.getElementById("edit-modal-overlay").style.display = "none";
    document.getElementById("edit-modal").style.display = "none";
}

// Method inserts new entry into table, by checking whether the id exists
function insertAdjustIds(objects, newObject) {
    var tempTable = [];
    var found = false;
    var fillVoid = false;
    var nextId = 1;
    var skipNext = false;

    for (let object of objects) {
        if (object.id === newObject.id && object.label === newObject.label) { // Inject into row
            tempTable.push(newObject);
            found = true;
            if (edit || insert || object.label !== undefined) skipNext = true;
        }

        // Go through empty spaces and add newObject when correct position is found
        while (object.id > nextId) {
            if (newObject.id === nextId) {
                tempTable.push(newObject);
                fillVoid = true;
            } 
            nextId++;
        }

        if (object.id !== undefined && found && !edit) object.id++; // If injected, increase id for the following rows

        if (!skipNext) tempTable.push(object);
        skipNext = false;

        nextId = object.id + 1;
    }

    if (!found && !fillVoid) { // Id doesn't exist, thus add new entry to straight after last entry
        newObject.id = nextId; 
        tempTable.push(newObject); 
    }
    return tempTable;
}

// Checks whether a new entry has been edited prior to db update, ie editing new entries will only adjust values
function checkEdits(objects, newObject) {
    var tempArray = [];

    if (objects.length === 0) {
        objects.push(newObject);
    } else {
        for (let object of objects) {
            if (object.id === newObject.id && !newObject.edit && object.edit) {
                tempArray.push(newObject);
                insert = true;
                object.id++;
                tempArray.push(object)
            } else if (object.id === newObject.id && !object.edit) {
                newObject.edit = false;
                newObject.id++;
            } else if (object.id !== newObject.id) {
                tempArray.push(object);
            }
        }

        if (!insert) tempArray.push(newObject);

        objects = tempArray;
    }
    console.log(objects);
    return objects;
}

// Checks whether a new entry has an id flagged for delete, then removing it from list of delete requests
function checkDeletes(tableId, object) {
    for (var i = 1; i < delPrimaryKeys.length; i++) {
        if (delPrimaryKeys[0] == tableId) {
            if (delPrimaryKeys[i] === object.id && delPrimaryKeys[i] === object.label) delPrimaryKeys[i].splice(i, 1);
            if (delPrimaryKeys.length === 1) delPrimaryKeys.shift();
        }
    }
}

// Source: #6
function getIndex(array, attribute, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (attribute === "id") value = parseInt(value);
        if (array[i][attribute] === value) return i;
    }
}

function norToBool(norString) {
    switch (norString.toLowerCase()) {
        case "ja":
        case "j":
        case "true":
        case "yes":
        case "y":
            return true;

        case "nei":
        case "ne":
        case "n":
        case "false":
        case "no":
            return false;
    }
}

// Prevent unwanted inputs in number fields 
function preventIncorrectNumberInput() {
    var inputs = document.querySelectorAll("input");
    
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].type === "text") continue;

        inputs[i].addEventListener("keypress", function (event) {
            if (event.which != 8 && event.which != 0 && event.which < 48 || event.which > 57) {
                event.preventDefault();
            }
        });
    }
}

function reverseBoolNor(norString) {
    if (norString === "Ja")
        return "<option selected>Ja</option>" +
            "<option>Nei</option>";
    else
        return "<option>Ja</option>" +
            "<option selected>Nei</option>";
}

function newEntry(tableId, primaryKey) {
    for (var i = 0; i < newEntries.length; i++) if (newEntries[i] === (tableId + "-" + primaryKey)) return true;
}

function editModalResizeListener() {
    editModalResize();

    $(window).on("load resize", function () {
        editModalResize();
    });
}

function editModalResize() {
    var md = (768 - getScrollbarWidth());
    var lg = (992 - getScrollbarWidth());
    var max = (1140 * 2 - getScrollbarWidth());

    if ($(window).width() < md) {
        $("#edit-modal").css("width", "100%");
        $("#edit-modal").css("left", "0%");
    } else if ($(window).width() < lg) {
        $("#edit-modal").css("width", "75%");
        $("#edit-modal").css("left", "12.5%");
    } else {
        $("#edit-modal").css("width", "50%");
        $("#edit-modal").css("left", "25%");
    }
}