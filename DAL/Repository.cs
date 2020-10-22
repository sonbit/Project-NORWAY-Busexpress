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
                            TicketType ticketType = await _db.TicketTypes.FindAsync(primaryKeys[i][j]);

                            if (ticketType == null) break;

                            changeData = "TicketType: " + ticketType.Label;
                            _db.TicketTypes.Remove(ticketType);
                            break;
                        case "ticket-type-compositions": // Disallow remove
                            break;
                        case "users":
                            // Skip first element as it is a default admin user
                            User user = await _db.Users.FindAsync(Int32.Parse(primaryKeys[i][j]));

                            if (user == null) break;

                            if (user.Id != 1 || user.Admin) 
                            {
                                _db.Users.Remove(user);
                                changeData = "User: " + user.Email;
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

                    var dbRoute = await _db.Routes.FirstOrDefaultAsync(r => r.Label == route.Label);

                    if (dbRoute == null) // If null, the object doesn't exist, add to table
                    {
                        _db.Routes.Add(route);

                        changeType = "ADD";
                    }
                    else // If not null, the object exists, edit values
                    {
                        dbRoute.PricePerMin = route.PricePerMin;
                        dbRoute.MidwayStop = route.MidwayStop;

                        changeType = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "Route: " + route.Label });
                }

                await _db.SaveChangesAsync(); // Must store changes prior incase needed below
            }
            
            if (!dBData.Stops.IsNullOrEmpty())
            {
                foreach (var stop in dBData.Stops)
                {
                    if (!Validation.ValidateStop(stop)) 
                    {
                        invalidDBData.Add(stop.ToString());
                        continue;
                    }

                    List<Stop> allDBStops = await _db.Stops.Select(s => new Stop
                    {
                        Id = s.Id,
                        Name = s.Name,
                        MinutesFromHub = s.MinutesFromHub,
                        Route = _db.Routes.FirstOrDefault(r => r.Label == s.Route.Label)
                    }).ToListAsync();

                    Stop foundStop = null;
                    List<Stop> updatedStops = new List<Stop>();
                    var found = false;

                    foreach (var dbStop in allDBStops)
                    {
                        if (dbStop.Id == stop.Id)
                        {
                            foundStop = dbStop;

                            if (stop.Edit) break;

                            updatedStops.Add(stop);
                            found = true;
                        }

                        if (found)
                        {
                            Stop updatedStop = new Stop()
                            {
                                Id = dbStop.Id + 1,
                                Name = dbStop.Name,
                                MinutesFromHub = dbStop.MinutesFromHub,
                                Route = dbStop.Route
                            };

                            updatedStops.Add(updatedStop);
                        }
                        else
                        {
                            updatedStops.Add(dbStop);
                        }
                    }

                    //var foundStop = await _db.Stops.FirstOrDefaultAsync(s => s.Id == stop.Id);

                    stop.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == stop.Route.Label);

                    

                    if (foundStop == null)
                    {
                        _db.Stops.Add(stop);
                        changeType = "ADD";
                    }
                    else if (!stop.Edit)
                    {
                        _db.Stops.RemoveRange(allDBStops);
                        await _db.SaveChangesAsync();

                        _db.Stops.AddRange(updatedStops);

                        //List<Stop> updatedStops = new List<Stop>();
                        //var found = false;

                        //foreach (var dbStop in _db.Stops)
                        //{
                        //    Console.WriteLine(dbStop.Id);
                        //    if (dbStop.Id != foundStop.Id) _db.Stops.Remove(dbStop);

                        //    else
                        //    {
                        //        foundStop.Name = stop.Name;
                        //        foundStop.MinutesFromHub = stop.MinutesFromHub;
                        //        foundStop.Route = stop.Route;
                        //        found = true;
                        //    }

                        //    if (found)
                        //    {
                        //        updatedStops.Add(new Stop()
                        //        {
                        //            Id = dbStop.Id + 1,
                        //            Name = dbStop.Name,
                        //            MinutesFromHub = dbStop.MinutesFromHub,
                        //            Route = dbStop.Route
                        //        });
                        //    } 
                        //    else
                        //    {
                        //        updatedStops.Add(dbStop);
                        //    }
                        //}

                        //await _db.SaveChangesAsync();

                        //allStops.Insert(stop.Id - 1, stop);
                        //_db.Stops.AddRange(updatedStops);

                        changeType = "INSERT";
                    }
                    else
                    {
                        foundStop.Name = stop.Name;
                        foundStop.MinutesFromHub = stop.MinutesFromHub;
                        foundStop.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == stop.Route.Label);
                        // The route should exist as we populate the routes table above prior to this call

                        changeType = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "Route: " + stop.Name });
                }
            }
            
            if (!dBData.RouteTables.IsNullOrEmpty())
            {
                foreach (var routeTable in dBData.RouteTables)
                {
                    if (!Validation.ValidateRouteTable(routeTable)) 
                    {
                        invalidDBData.Add(routeTable.ToString());
                        continue;
                    }

                    var dbRouteTable = await _db.RouteTables.FirstOrDefaultAsync(rt => rt.Id == routeTable.Id);

                    if (dbRouteTable == null)
                    {
                        _db.RouteTables.Add(routeTable);

                        changeType = "ADD";
                    }
                    else
                    {
                        dbRouteTable.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == dbRouteTable.Route.Label);
                        dbRouteTable.FromHub = routeTable.FromHub;
                        dbRouteTable.FullLength = routeTable.FullLength;
                        dbRouteTable.StartTime = routeTable.StartTime;
                        dbRouteTable.EndTime = routeTable.EndTime;

                        changeType = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "RouteTable: " + routeTable.Id + " " + routeTable.Route.Label + " " + routeTable.StartTime });
                }
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

                    var dbTicketType = await _db.TicketTypes.FirstOrDefaultAsync(t => t.Label == ticketType.Label);

                    if (dbTicketType == null)
                    {
                        _db.TicketTypes.Add(ticketType);

                        changeType = "ADD";
                    }
                    else
                    {
                        dbTicketType.Clarification = ticketType.Clarification;
                        dbTicketType.PriceModifier = ticketType.PriceModifier;

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
                foreach (var user in dBData.Users)
                {
                    if (!Validation.ValidateUser(user)) 
                    {
                        invalidDBData.Add(user.ToString());
                        continue;
                    }

                    if (user.Id == 1)
                    {
                        databaseChanges.Add(new DatabaseChange { Type = "INVALID ACTION", Change = "Tried to change main admin account" });
                        continue;
                    }

                    var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == user.Id);

                    if (dbUser == null)
                    {
                        if (user.Password.IsNullOrEmpty()) continue;

                        user.Salt = Calculate.Salt();
                        user.HashedPassword = Calculate.Hash(user.Password, user.Salt);
                        _db.Users.Add(user);

                        changeType = "ADD";
                    }
                    else
                    {
                        // Password has been edited
                        if (!user.Password.IsNullOrEmpty() && !Calculate.Hash(user.Password, dbUser.Salt).SequenceEqual(dbUser.HashedPassword))
                        { 
                            dbUser.Salt = Calculate.Salt();
                            dbUser.HashedPassword = Calculate.Hash(user.Password, dbUser.Salt);
                        }

                        dbUser.Email = user.Email;
                        dbUser.Admin = user.Admin;

                        changeType = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = changeType, Change = "User: " + user.Email });
                }
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
