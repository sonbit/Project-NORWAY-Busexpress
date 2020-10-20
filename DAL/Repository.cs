using Castle.Core.Internal;
using Castle.DynamicProxy.Generators;
using Castle.DynamicProxy.Generators.Emitters.SimpleAST;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
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
            String type = "DELETE";
            String data = "";

            for (var i = 0; i < primaryKeys.Length; i++)
            {
                for (var j = 1; j < primaryKeys[i].Length; j++)
                {
                    switch (primaryKeys[i][0])
                    {
                        case "stops":
                            Stop foundStop = await _db.Stops.FindAsync(Int32.Parse(primaryKeys[i][j]));
                            data = "Stop: " + foundStop.Name;
                            _db.Stops.Remove(foundStop);
                            break;
                        case "routes":
                            // Route.Label is a foreign key in several tables, and each connection need be set to null
                            // However, a table in a database may have a "on delete set null" setting
                            Models.Route route = await _db.Routes.FindAsync(primaryKeys[i][j]);
                            data = "Route: " + route.Label;

                            foreach (var stop in _db.Stops)
                                if (stop.Route.Equals(route)) stop.Route = null;

                            foreach (var routeTable in _db.RouteTables)
                                if (routeTable.Route.Equals(route)) routeTable.Route = null;

                            foreach (var tick in _db.Tickets)
                                if (tick.Route.Equals(route)) tick.Route = null;

                            _db.Routes.Remove(route);
                            break;
                        case "route-tables":
                            RouteTable foundRouteTable = await _db.RouteTables.FindAsync(Int32.Parse(primaryKeys[i][j]));
                            data = "RouteTable: " + foundRouteTable.Id + " " + foundRouteTable.Route.Label + " " + foundRouteTable.StartTime;
                            _db.RouteTables.Remove(foundRouteTable);
                            break;
                        case "tickets": // Disallow remove
                            // As above, need to remove depenency (foreign keys) prior to removing the object
                            //Ticket ticket = await _db.Tickets.FindAsync(Int32.Parse(primaryKeys[i][j]));

                            //foreach (var comp in _db.TicketTypeCompositions) comp.TicketType = null;
                            //_db.TicketTypeCompositions.RemoveRange(_db.TicketTypeCompositions.Where(c => c.Ticket.Id.Equals(ticket.Id)).ToList());

                            //_db.Tickets.Remove(ticket);
                            break;
                        case "ticket-types":
                            TicketType ticketType = await _db.TicketTypes.FindAsync(primaryKeys[i][j]);
                            data = "TicketType: " + ticketType.Label;
                            _db.TicketTypes.Remove(ticketType);
                            break;
                        case "ticket-type-compositions": // Disallow remove
                            // Skip first element as it is a default setting (1 adult)
                            //TicketTypeComposition ticketTypeComposition = await _db.TicketTypeCompositions.FindAsync(Int32.Parse(primaryKeys[i][j]));
                            //if (ticketTypeComposition.Id != 1) _db.TicketTypeCompositions.Remove(ticketTypeComposition);
                            break;
                        case "users":
                            // Skip first element as it is a default admin user
                            User user = await _db.Users.FindAsync(Int32.Parse(primaryKeys[i][j]));
                            if (user.Id != 1) 
                            {
                                _db.Users.Remove(user);
                                data = "User: " + user.Email;
                            }
                            
                            break;
                        default:
                            throw new Exception();
                    }

                    databaseChanges.Add(new DatabaseChange { Type = type, Change = data });
                }

            }
            await _db.SaveChangesAsync();
            await LogDatabaseAccess(email, type, databaseChanges);
        }


        public async Task<DBData> EditData(DBData dBData, String email)
        {
            List<DatabaseChange> databaseChanges = new List<DatabaseChange>();
            String type = "";

            if (!dBData.Routes.IsNullOrEmpty())
            {
                foreach (var route in dBData.Routes)
                {
                    // Checks only label to check whether it is an edit or a new entry
                    var dbRoute = await _db.Routes.FirstOrDefaultAsync(r => r.Label == route.Label);

                    if (dbRoute == null) // If null, the object doesn't exist, add to table
                    {
                        _db.Routes.Add(route);

                        type = "ADD";
                    }
                    else // If not null, the object exists, edit values
                    {
                        dbRoute.PricePerMin = route.PricePerMin;
                        dbRoute.MidwayStop = route.MidwayStop;

                        type = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = type, Change = "Route: " + route.Label });
                }
            }
            
            if (!dBData.Stops.IsNullOrEmpty())
            {
                foreach (var stop in dBData.Stops)
                {
                    var dbStop = await _db.Stops.FirstOrDefaultAsync(s => s.Id == stop.Id);

                    if (dbStop == null)
                    {
                        stop.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == stop.Route.Label);
                        _db.Stops.Add(stop);

                        type = "ADD";
                    }
                    else
                    {
                        dbStop.Name = stop.Name;
                        dbStop.MinutesFromHub = stop.MinutesFromHub;
                        dbStop.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == stop.Route.Label);
                        // The route should exist as we populate the routes table above prior to this call

                        type = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = type, Change = "Route: " + stop.Name });
                }
            }
            
            if (!dBData.RouteTables.IsNullOrEmpty())
            {
                foreach (var routeTable in dBData.RouteTables)
                {
                    var dbRouteTable = await _db.RouteTables.FirstOrDefaultAsync(rt => rt.Id == routeTable.Id);

                    if (dbRouteTable == null)
                    {
                        _db.RouteTables.Add(routeTable);

                        type = "ADD";
                    }
                    else
                    {
                        dbRouteTable.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == dbRouteTable.Route.Label);
                        dbRouteTable.FromHub = routeTable.FromHub;
                        dbRouteTable.FullLength = routeTable.FullLength;
                        dbRouteTable.StartTime = routeTable.StartTime;
                        dbRouteTable.EndTime = routeTable.EndTime;

                        type = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = type, Change = "RouteTable: " + routeTable.Id + " " + routeTable.Route.Label + " " + routeTable.StartTime });
                }
            }

            if (!dBData.Tickets.IsNullOrEmpty()) // Disallow editing of tickets
            { 
            }

            if (!dBData.TicketTypes.IsNullOrEmpty())
            {
                foreach (var ticketType in dBData.TicketTypes)
                {
                    var dbTicketType = await _db.TicketTypes.FirstOrDefaultAsync(t => t.Label == ticketType.Label);

                    if (dbTicketType == null)
                    {
                        _db.TicketTypes.Add(ticketType);

                        type = "ADD";
                    }
                    else
                    {
                        dbTicketType.Clarification = ticketType.Clarification;
                        dbTicketType.PriceModifier = ticketType.PriceModifier;

                        type = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = type, Change = "TicketType: " + ticketType.Label });
                }
            }

            if (!dBData.TicketTypeCompositions.IsNullOrEmpty()) // Disallow ediitng of compositions as it is tightly tied to tickets
            {
            }

            if (!dBData.Users.IsNullOrEmpty())
            {
                foreach (var user in dBData.Users)
                {
                    var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == user.Id);

                    if (dbUser == null)
                    {
                        user.Salt = Calculate.Salt();
                        user.HashedPassword = Calculate.Hash(user.Password, user.Salt);
                        _db.Users.Add(user);

                        type = "ADD";
                    }
                    else
                    {
                        dbUser.Email = user.Email;
                        dbUser.Admin = user.Admin;

                        type = "EDIT";
                    }

                    databaseChanges.Add(new DatabaseChange { Type = type, Change = "User: " + user.Email });
                }
            }
            await _db.SaveChangesAsync();
            await LogDatabaseAccess(email, type, databaseChanges);

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
