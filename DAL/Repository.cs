using Castle.DynamicProxy.Generators;
using Castle.DynamicProxy.Generators.Emitters.SimpleAST;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
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

        public async Task<User> FindUser(String email)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
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

        public async Task DeleteData(String table, List<String> primaryKeys)
        {
            switch (table)
            {
                case "stops":
                    for (var i = 0; i < primaryKeys.Count; i++) _db.Stops.Remove(await _db.Stops.FindAsync(Int32.Parse(primaryKeys[i])));
                    break;
                case "routes":
                    // Route.Label is a foreign key in several tables, and each connection need be set to null
                    // However, a table in a database may have a "on delete set null" setting
                    for (var i = 0; i < primaryKeys.Count; i++)
                    {
                        Models.Route route = await _db.Routes.FindAsync(primaryKeys[i]);

                        foreach (var stop in _db.Stops)
                            if (stop.Route.Equals(route)) stop.Route = null;

                        foreach (var routeTable in _db.RouteTables)
                            if (routeTable.Route.Equals(route)) routeTable.Route = null;

                        foreach (var ticket in _db.Tickets)
                            if (ticket.Route.Equals(route)) ticket.Route = null;

                        _db.Routes.Remove(route);
                    }
                    break;
                case "route-tables":
                    for (var i = 0; i < primaryKeys.Count; i++) _db.RouteTables.Remove(await _db.RouteTables.FindAsync(Int32.Parse(primaryKeys[i])));
                    break;
                case "tickets":
                    // As above, need to remove depenency prior to removing the object
                    for (var i = 0; i < primaryKeys.Count; i++)
                    {
                        Ticket ticket = await _db.Tickets.FindAsync(Int32.Parse(primaryKeys[i]));

                        foreach (var comp in _db.TicketTypeCompositions) comp.TicketType = null;
                        _db.TicketTypeCompositions.RemoveRange(_db.TicketTypeCompositions.Where(c => c.Ticket.Id.Equals(ticket.Id)).ToList());

                        _db.Tickets.Remove(ticket);
                    }
                    break;
                case "ticket-types":
                    for (var i = 0; i < primaryKeys.Count; i++) _db.TicketTypes.Remove(await _db.TicketTypes.FindAsync(primaryKeys[i]));
                    break;
                case "ticket-type-compositions":
                    // Skip first element as it is a default setting (1 adult)
                    for (var i = 0; i < primaryKeys.Count; i++)
                    {
                        TicketTypeComposition ticketTypeComposition = await _db.TicketTypeCompositions.FindAsync(Int32.Parse(primaryKeys[i]));
                        if (ticketTypeComposition.Id != 1) _db.TicketTypeCompositions.Remove(ticketTypeComposition);
                    } 
                    break;
                case "users":
                    // Skip first element as it is a default admin user
                    for (var i = 0; i < primaryKeys.Count; i++) 
                    {
                        User user = await _db.Users.FindAsync(Int32.Parse(primaryKeys[i]));
                        if (user.Id != 1) _db.Users.Remove(user);
                    }
                    break;
                default:
                    throw new Exception();
            }

            await _db.SaveChangesAsync();
        }

        public async Task LogDatabaseAccess(String email, String changes)
        {
            DatabaseAccess databaseAccess = new DatabaseAccess
            {
                User = await FindUser(email),
                DateTime = DateTime.Now.ToString("dd/MM/yyyy H:mm"),
                Changes = changes
            };

            _db.DatabaseAccesses.Add(databaseAccess);
            await _db.SaveChangesAsync();
        }
    }
}
