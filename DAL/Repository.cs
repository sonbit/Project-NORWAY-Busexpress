using Castle.DynamicProxy.Generators;
using Castle.DynamicProxy.Generators.Emitters.SimpleAST;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.DAL
{
    public class Repository : IRepository
    {
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
                    PricePerMin = s.Route.PricePerMin
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
            var passengerCompositions = await _db.PassengerCompositions.Select(p => new TicketTypeComposition
            {
                Id = p.Id,
                Ticket = p.Ticket,
                TicketType = p.TicketType,
                NumberOfPassengers = p.NumberOfPassengers
            }).ToListAsync();

            return passengerCompositions;
        }

        public async Task<List<Models.Route>> GetRoutes()
        {
            var routes = await _db.Routes.Select(r => new Models.Route { 
                Label = r.Label,
                PricePerMin = r.PricePerMin,
                Stops = r.Stops,
                RouteTables = r.RouteTables
            }).ToListAsync();

            return routes;
        }

        public async Task<List<RouteTable>> GetRouteTables()
        {
            var routeTables = await _db.RouteTables.Select(t => new RouteTable
            {
                Id = t.Id,
                Route = new Models.Route
                {
                    Label = t.Route.Label,
                    PricePerMin = t.Route.PricePerMin
                },
                FromHub = t.FromHub,
                FullLength = t.FullLength,
                StartTime = t.StartTime,
                EndTime = t.EndTime
            }).ToListAsync();

            return routeTables;
        }

        public async Task StoreTicket(Ticket ticket)
        {
            var ticketTypes = _db.TicketTypes.ToList();

            var counter = 0;
            var passengerComposition = ticket.TicketPassengers
                .Select(p =>
                {
                    var passenger = new TicketTypeComposition()
                    {
                        NumberOfPassengers = p,
                        Ticket = ticket,
                        TicketType = ticketTypes[counter]
                    };
                    counter++;
                    return passenger;
                }
                );
            passengerComposition = passengerComposition.Where(p => p.NumberOfPassengers > 0);

            ticket.PassengerCompositions = passengerComposition.ToList();
            ticket.Route = _db.Routes.Single(r => r.Label == ticket.Route.Label);

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();
        }

        public async Task<List<Ticket>> GetTickets(String email)
        {
            return await _db.Tickets.Where(t => t.Email.Equals(email)).ToListAsync();
        }
    }
}
