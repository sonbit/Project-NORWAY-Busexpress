using Castle.DynamicProxy.Generators.Emitters.SimpleAST;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
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
            try
            {
                List<Stop> stops = await _db.Stops.Select(s => new Stop
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
            catch
            {
                return null;
            }
        }

        public async Task<List<TicketType>> GetTicketTypes()
        {
            try
            {
                List<TicketType> ticketTypes = await _db.TicketTypes.Select(t => new TicketType
                {
                    Label = t.Label,
                    Clarification = t.Clarification,
                    PriceModifier = t.PriceModifier
                }).ToListAsync();

                return ticketTypes;
            } 
            catch
            {
                return null;
            }
        }

        public async Task<List<RouteTable>> GetRouteTables()
        {
            try
            {
                List<RouteTable> routeTables = await _db.RouteTables.Select(t => new RouteTable
                {
                    Label = t.Label,
                    Route = new Models.Route
                    {
                        Label = t.Route.Label,
                        PricePerMin = t.Route.PricePerMin
                    },
                    StartTime = t.StartTime,
                    EndTime = t.EndTime
                }).ToListAsync();

                return routeTables;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> StoreTicket(Ticket ticket)
        {
            try
            {
                _db.Tickets.Add(ticket);
                await _db.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
