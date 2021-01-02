using Castle.Core.Internal;
using Castle.DynamicProxy.Generators;
using Castle.DynamicProxy.Generators.Emitters.SimpleAST;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Project_NORWAY_Busexpress.Controllers;
using Project_NORWAY_Busexpress.Helpers;
using Project_NORWAY_Busexpress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.DAL
{
    public class Repository : IRepository
    {
        // Virtual connections that consist of lists are not retrieved from DB as this will increase
        // Data load significantly. Instead, we retrieve only unique data including the primary key.
        // I.E. Route has a list of Stops and RouteTables, but we can already assess the Route from primary key Label

        private readonly Context _db;

        public Repository(Context db)
        {
            _db = db;
        }

        public async Task<List<Stop>> GetStops()
        {
            var stops = await _db.Stops.Select(s => new Stop
            {
                Id = s.Id,
                Name = s.Name,
                MinutesFromHub = s.MinutesFromHub,
                Route = new Models.Route
                {
                    Label = s.Route.Label,
                    MidwayStop = s.Route.MidwayStop
                }
            }).ToListAsync();

            return stops;
        }

        public async Task<List<TicketType>> GetTicketTypes()
        {
            var ticketTypes = await _db.TicketTypes.Select(t => new TicketType
            {
                Label = t.Label,
                Clarification = t.Clarification,
                PriceModifier = t.PriceModifier
            }).ToListAsync();

            return ticketTypes;
        }

        public async Task<List<TicketTypeComposition>> GetPassengerCompositions()
        {
            var passengerCompositions = await _db.TicketTypeCompositions.Select(ttc => new TicketTypeComposition
            {
                Id = ttc.Id,
                Ticket = ttc.Ticket,
                TicketType = ttc.TicketType,
                NumberOfPassengers = ttc.NumberOfPassengers
            }).ToListAsync();

            return passengerCompositions;
        }

        public async Task<List<Models.Route>> GetRoutes()
        {
            var routes = await _db.Routes.Select(r => new Models.Route { 
                Label = r.Label,
                PricePerMin = r.PricePerMin,
                MidwayStop = r.MidwayStop
            }).ToListAsync();

            return routes;
        }

        public async Task<List<RouteTable>> GetRouteTables()
        {
            var routeTables = await _db.RouteTables.Select(rt => new RouteTable
            {
                Id = rt.Id,
                Route = new Models.Route
                {
                    Label = rt.Route.Label
                },
                FromHub = rt.FromHub,
                FullLength = rt.FullLength,
                StartTime = rt.StartTime,
                EndTime = rt.EndTime
            }).ToListAsync();

            return routeTables;
        }

        public async Task StoreTicket(Ticket ticket)
        {
            var ticketTypes = _db.TicketTypes.ToList();

            var counter = 0;
            var passengerComposition = ticket.Passengers
                .Select(p =>
                {
                    var ticketTypeComposition = new TicketTypeComposition()
                    {
                        NumberOfPassengers = p,
                        Ticket = ticket,
                        TicketType = ticketTypes[counter]
                    };
                    counter++;
                    return ticketTypeComposition;
                }
                );
            passengerComposition = passengerComposition.Where(p => p.NumberOfPassengers > 0);

            ticket.TicketTypeCompositions = passengerComposition.ToList();
            ticket.Route = _db.Routes.Single(r => r.Label == ticket.Route.Label);

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();
        }

        public async Task<List<Ticket>> GetTickets(String email)
        {
            return await _db.Tickets.Where(t => t.Email.Equals(email)).ToListAsync();
        }

        public async Task<List<Ticket>> GetTickets()
        {
            var tickets = await _db.Tickets.Select(t => new Ticket
            {
                Id = t.Id,
                Date = t.Date,
                Start = t.Start,
                End = t.End,
                TravelTime = t.TravelTime,
                Route = new Models.Route
                {
                    Label = t.Route.Label
                },
                TicketTypeCompositions = FormatComposition(t.TicketTypeCompositions),
                TotalPrice = t.TotalPrice,
                Email = t.Email,
                PhoneNumber = t.PhoneNumber
            }).ToListAsync();

            return tickets;
        }

        public async Task<List<TicketTypeComposition>> GetTicketTypeCompositions()
        {
            var ticketTypeCompositions = await _db.TicketTypeCompositions.Select(ttc => new TicketTypeComposition
            {
                Id = ttc.Id,
                Ticket = new Ticket 
                { 
                    Id = ttc.Ticket.Id
                },
                TicketType = ttc.TicketType,
                NumberOfPassengers = ttc.NumberOfPassengers
            }).ToListAsync();

            return ticketTypeCompositions;
        }

        public async Task<User> FindUser(User user)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        }

        public async Task<List<User>> GetUsers()
        {
            var users = await _db.Users.Select(u => new User
            {
                Id = u.Id,
                Email = u.Email,
                Admin = u.Admin
            }).ToListAsync();

            return users;
        }

        public async Task<DBData> GetData()
        {
            DBData dbData = new DBData
            {
                Stops = await GetStops(),
                Routes = await GetRoutes(),
                RouteTables = await GetRouteTables(),
                Tickets = await GetTickets(),
                TicketTypes = await GetTicketTypes(),
                TicketTypeCompositions = await GetTicketTypeCompositions(),
                Users = await GetUsers()
            };

            return dbData;
        }

        // Method simply removes the connection to Tickets to avoid duplicate data
        private static List<TicketTypeComposition> FormatComposition(List<TicketTypeComposition> compositions)
        {
            List<TicketTypeComposition> ticketTypeCompositions = new List<TicketTypeComposition>();

            for (var i = 0; i < compositions.Count; i++)
                ticketTypeCompositions.Add(
                    new TicketTypeComposition
                    {
                        Id = compositions[i].Id,
                        NumberOfPassengers = compositions[i].NumberOfPassengers,
                        TicketType = compositions[i].TicketType
                    });

            return ticketTypeCompositions;
        }

        public async Task DeleteData(String[][] primaryKeys, String email)
        {
            List<DatabaseChange> databaseChanges = new List<DatabaseChange>();
            String changeType = "DELETE";
            String changeData = "";

            for (var i = 0; i < primaryKeys.Length; i++)
            {
                for (var j = 1; j < primaryKeys[i].Length; j++)
                {
                    switch (primaryKeys[i][0])
                    {
                        case "stops":
                            Stop foundStop = await _db.Stops.FindAsync(Int32.Parse(primaryKeys[i][j]));

                            if (foundStop == null) break;

                            changeData = "Stop: " + foundStop.Name;
                            _db.Stops.Remove(foundStop);
                            break;
                        case "routes":
                            // Route.Label is a foreign key in several tables, and each connection need be set to null
                            // However, a table in a database may have a "on delete set null" setting
                            Models.Route foundRoute = await _db.Routes.FindAsync(primaryKeys[i][j]);

                            if (foundRoute == null) break;

                            changeData = "Route: " + foundRoute.Label;

                            foreach (var stop in _db.Stops)
                                if (stop.Route.Equals(foundRoute)) stop.Route = null;

                            foreach (var routeTable in _db.RouteTables)
                                if (routeTable.Route.Equals(foundRoute)) routeTable.Route = null;

                            foreach (var tick in _db.Tickets)
                                if (tick.Route.Equals(foundRoute)) tick.Route = null;

                            _db.Routes.Remove(foundRoute);
                            break;
                        case "route-tables":
                            RouteTable foundRouteTable = await _db.RouteTables.FindAsync(Int32.Parse(primaryKeys[i][j]));

                            if (foundRouteTable == null) break;

                            changeData = "RouteTable: " + foundRouteTable.Id + " " + foundRouteTable.StartTime;
                            _db.RouteTables.Remove(foundRouteTable);
                            break;
                        case "tickets": // Disallow remove
                            break;
                        case "ticket-types":
                            TicketType foundTicketType = await _db.TicketTypes.FindAsync(primaryKeys[i][j]);

                            if (foundTicketType == null) break;

                            changeData = "TicketType: " + foundTicketType.Label;
                            _db.TicketTypes.Remove(foundTicketType);
                            break;
                        case "ticket-type-compositions": // Disallow remove
                            break;
                        case "users":
                            // Skip first element as it is a default admin user
                            User foundUser = await _db.Users.FindAsync(Int32.Parse(primaryKeys[i][j]));

                            if (foundUser == null) break;

                            if (foundUser.Id != 1) 
                            {
                                _db.Users.Remove(foundUser);
                                changeData = "User: " + foundUser.Email;
                            } 
                            else
                            {
                                changeType = "INVALID ACTION";
                                changeData = "Tried to delete main admin account";
                            }
                            
                            break;
                        default:
                            throw new Exception();
                    }

                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = changeData });
                }

            }
            await _db.SaveChangesAsync();
            await LogDatabaseAccess(email, changeType, databaseChanges);
        }

        // Only tables with ids (excluding tickets and compositions) have the insert capability
        public async Task<DBData> EditData(DBData dBData, String email, List<String> invalidDBData)
        {
            List<DatabaseChange> databaseChanges = new List<DatabaseChange>();
            String changeType = "";

            if (!dBData.Routes.IsNullOrEmpty())
            {
                foreach (var route in dBData.Routes)
                {
                    if (!Validation.ValidateRoute(route)) 
                    {
                        invalidDBData.Add(route.ToString());
                        continue;
                    }

                    var foundRoute = await _db.Routes.FirstOrDefaultAsync(r => r.Label == route.Label);

                    if (foundRoute == null) // If null, the object doesn't exist, add to table
                    {
                        _db.Routes.Add(route);
                        changeType = "ADD";
                    }
                    else // If not null, the object exists, edit values
                    {
                        foundRoute.PricePerMin = route.PricePerMin;
                        foundRoute.MidwayStop = route.MidwayStop;
                        changeType = "EDIT";
                    }
                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "Route: " + route.Label });
                }

                await _db.SaveChangesAsync(); // Must store changes prior incase needed below
            }

            if (!dBData.Stops.IsNullOrEmpty())
            {
                List<Stop> updatedStops = new List<Stop>();

                List<Stop> allDBStops = await _db.Stops.Select(s => new Stop
                {
                    Id = s.Id,
                    Name = s.Name,
                    MinutesFromHub = s.MinutesFromHub,
                    Route = _db.Routes.FirstOrDefault(r => r.Label == s.Route.Label)
                }).ToListAsync();

                updatedStops = allDBStops;

                _db.Stops.RemoveRange(allDBStops);
                await _db.SaveChangesAsync();

                foreach (var clientStop in dBData.Stops.OrderBy(s => s.Id))
                {
                    if (!Validation.ValidateStop(clientStop))
                    {
                        invalidDBData.Add(clientStop.ToString());
                        continue;
                    }

                    clientStop.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == clientStop.Route.Label);

                    var foundStop = updatedStops.FirstOrDefault(s => s.Id == clientStop.Id);

                    if (foundStop == null)
                    {
                        updatedStops.Add(clientStop);
                        changeType = "ADD";
                    }
                    else if (!clientStop.Edit)
                    {
                        var found = false;
                        var tempList = new List<Stop>();

                        foreach (var stop in updatedStops)
                        {
                            if (stop.Id == clientStop.Id) 
                            {
                                tempList.Add(clientStop);
                                found = true;
                            }

                            if (found) stop.Id++;

                            tempList.Add(stop);
                        }

                        updatedStops = tempList;
                        changeType = "INSERT";
                    }
                    else
                    {
                        foundStop.Name = clientStop.Name;
                        foundStop.MinutesFromHub = clientStop.MinutesFromHub;
                        foundStop.Route = clientStop.Route;
                        changeType = "EDIT";
                    }
                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "Route: " + clientStop.Name });
                }
                _db.Stops.AddRange(updatedStops);
            }

            if (!dBData.RouteTables.IsNullOrEmpty())
            {
                List<RouteTable> updatedRouteTables = new List<RouteTable>();

                List<RouteTable> allDBRouteTables = await _db.RouteTables.Select(rt => new RouteTable
                {
                    Id = rt.Id,
                    Route = rt.Route,
                    FromHub = rt.FromHub,
                    FullLength = rt.FullLength,
                    StartTime = rt.StartTime,
                    EndTime = rt.EndTime
                }).ToListAsync();

                updatedRouteTables = allDBRouteTables;

                _db.RouteTables.RemoveRange(allDBRouteTables);
                await _db.SaveChangesAsync();

                foreach (var clientRouteTable in dBData.RouteTables.OrderBy(rt => rt.Id))
                {
                    if (!Validation.ValidateRouteTable(clientRouteTable)) 
                    {
                        invalidDBData.Add(clientRouteTable.ToString());
                        continue;
                    }

                    clientRouteTable.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == clientRouteTable.Route.Label);

                    var foundRouteTable = updatedRouteTables.FirstOrDefault(rt => rt.Id == clientRouteTable.Id);

                    if (foundRouteTable == null)
                    {
                        _db.RouteTables.Add(clientRouteTable);
                        changeType = "ADD";
                    }
                    else if (!clientRouteTable.Edit)
                    {
                        var found = false;
                        var tempList = new List<RouteTable>();

                        foreach (var routeTable in updatedRouteTables)
                        {
                            if (routeTable.Id == clientRouteTable.Id)
                            {
                                tempList.Add(clientRouteTable);
                                found = true;
                            }

                            if (found) routeTable.Id++;

                            tempList.Add(routeTable);
                        }

                        updatedRouteTables = tempList;
                        changeType = "INSERT";
                    }
                    else
                    {
                        foundRouteTable.Route = clientRouteTable.Route;
                        foundRouteTable.FromHub = clientRouteTable.FromHub;
                        foundRouteTable.FullLength = clientRouteTable.FullLength;
                        foundRouteTable.StartTime = clientRouteTable.StartTime;
                        foundRouteTable.EndTime = clientRouteTable.EndTime;
                        changeType = "EDIT";
                    }
                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "RouteTable: " + clientRouteTable.Id + " " + clientRouteTable.Route.Label + " " + clientRouteTable.StartTime });
                }
                _db.RouteTables.AddRange(updatedRouteTables);
            }

            if (!dBData.Tickets.IsNullOrEmpty()) // Disallow editing of tickets
            { 
            }

            if (!dBData.TicketTypes.IsNullOrEmpty())
            {
                foreach (var ticketType in dBData.TicketTypes)
                {
                    if (!Validation.ValidateTicketType(ticketType)) 
                    {
                        invalidDBData.Add(ticketType.ToString());
                        continue;
                    }

                    var foundTicketType = await _db.TicketTypes.FirstOrDefaultAsync(t => t.Label == ticketType.Label);

                    if (foundTicketType == null)
                    {
                        _db.TicketTypes.Add(ticketType);
                        changeType = "ADD";
                    }
                    else
                    {
                        foundTicketType.Clarification = ticketType.Clarification;
                        foundTicketType.PriceModifier = ticketType.PriceModifier;
                        changeType = "EDIT";
                    }
                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "TicketType: " + ticketType.Label });
                }
            }

            if (!dBData.TicketTypeCompositions.IsNullOrEmpty()) // Disallow ediitng of compositions as it is tightly tied to tickets
            {
            }

            if (!dBData.Users.IsNullOrEmpty())
            {
                List<User> updatedUsers = new List<User>();

                List<User> allDBUsers = await _db.Users.Select(u => new User
                {
                    Id = u.Id,
                    Email = u.Email,
                    Admin = u.Admin,
                    Salt = u.Salt,
                    HashedPassword = u.HashedPassword
                }).Where(u => u.Id > 1 && u.Email != email).ToListAsync(); // Get all Users excepted main admin and logged in user

                updatedUsers = allDBUsers;

                _db.Users.RemoveRange(allDBUsers);
                await _db.SaveChangesAsync();

                foreach (var clientUser in dBData.Users.OrderBy(u => u.Id))
                {
                    if (clientUser.Id == 1)
                    {
                        databaseChanges.Add(new DatabaseChange { Type = "INVALID ACTION", Change = "Tried to change main admin account" });
                        continue;
                    }

                    if (!Validation.ValidateUser(clientUser)) 
                    {
                        invalidDBData.Add(clientUser.ToString());
                        continue;
                    }

                    var foundUser = updatedUsers.FirstOrDefault(u => u.Id == clientUser.Id);

                    if (foundUser == null)
                    {
                        if (clientUser.Password.IsNullOrEmpty()) continue;

                        clientUser.Salt = Calculate.Salt();
                        clientUser.HashedPassword = Calculate.Hash(clientUser.Password, clientUser.Salt);
                        _db.Users.Add(clientUser);
                        changeType = "ADD";
                    }
                    else if (!clientUser.Edit)
                    {
                        var found = false;
                        var tempList = new List<User>();

                        foreach (var user in updatedUsers)
                        {
                            if (user.Id == clientUser.Id)
                            {
                                if (clientUser.Password.IsNullOrEmpty()) continue;

                                clientUser.Salt = Calculate.Salt();
                                clientUser.HashedPassword = Calculate.Hash(clientUser.Password, clientUser.Salt);
                                tempList.Add(clientUser);
                                found = true;
                            }

                            if (found) user.Id++;

                            tempList.Add(user);
                        }

                        updatedUsers = tempList;
                        changeType = "INSERT";
                    }
                    else
                    {
                        // Password has been edited
                        if (!clientUser.Password.IsNullOrEmpty() && !Calculate.Hash(clientUser.Password, foundUser.Salt).SequenceEqual(foundUser.HashedPassword))
                        {
                            foundUser.Salt = Calculate.Salt();
                            foundUser.HashedPassword = Calculate.Hash(clientUser.Password, foundUser.Salt);
                        }
                        foundUser.Email = clientUser.Email;
                        foundUser.Admin = clientUser.Admin;
                        changeType = "EDIT";
                    }
                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "User: " + clientUser.Email });
                }
                _db.Users.AddRange(updatedUsers);
            }

            await _db.SaveChangesAsync();
            await LogDatabaseAccess(email, changeType, databaseChanges);

            return new DBData
            {
                Stops = _db.Stops.ToList(),
                Routes = _db.Routes.ToList(),
                RouteTables = _db.RouteTables.ToList(),
                Tickets = _db.Tickets.ToList(),
                TicketTypes = _db.TicketTypes.ToList(),
                TicketTypeCompositions = _db.TicketTypeCompositions.ToList(),
                Users = _db.Users.ToList()
            };
        }
        public async Task LogDatabaseAccess(String email, String type, List<DatabaseChange> databaseChanges)
        {
            DatabaseAccess databaseAccess = new DatabaseAccess
            {
                User = await FindUser(new User { Email = email }),
                DateTime = DateTime.Now.ToString("dd/MM/yyyy H:mm"),
                Type = type,
                DatabaseChanges = databaseChanges
            };

            _db.DatabaseAccesses.Add(databaseAccess);
            await _db.SaveChangesAsync();
        }
    }
}
