﻿using Castle.DynamicProxy.Generators;
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
                    PricePerMin = s.Route.PricePerMin,
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
                Stops = r.Stops,
                MidwayStop = r.MidwayStop,
                RouteTables = r.RouteTables
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
                    Label = rt.Route.Label,
                    PricePerMin = rt.Route.PricePerMin,
                    MidwayStop = rt.Route.MidwayStop
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
                Route = t.Route,
                TicketTypeCompositions = t.TicketTypeCompositions,
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
                Ticket = ttc.Ticket,
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
                Email = u.Email
            }).ToListAsync();

            return users;
        }
    }
}
