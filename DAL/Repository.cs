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
                MinutesFromOslo = s.MinutesFromOslo,
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
                Direction = t.Direction,
                FullLength = t.FullLength,
                StartTime = t.StartTime,
                EndTime = t.EndTime
            }).ToListAsync();

            return routeTables;
        }

        public async Task StoreTicket(Ticket ticket)
        {
            var newRoute = new Models.Route
            {
                Label = ticket.Route.Label,
                PricePerMin = ticket.Route.PricePerMin
            };

            var newPassengerComposition = new List<PassengerComposition>
            {
                ticket.PassengerComposition.First()
            };

            var newTicket = new Ticket
            {
                Date = ticket.Date,
                Start = ticket.Start,
                End = ticket.End,
                TravelTime = ticket.TravelTime,
                Route = newRoute,
                TotalPrice = ticket.TotalPrice,
                Email = ticket.Email,
                PhoneNumber = ticket.PhoneNumber
            };

            ticket.Route = _db.Routes.Single(r => r.Label == ticket.Route.Label);
            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();
        }
    }
}
