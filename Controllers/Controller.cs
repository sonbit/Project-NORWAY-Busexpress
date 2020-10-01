using Prosjekt_Oppgave_NOR_WAY_Bussekspress.DAL;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System.Linq.Expressions;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Controllers
{
    [Route("[controller]/[action]")]
    public class Controller : ControllerBase
    {
        private readonly IRepository _db;
        private readonly ILogger<Controller> _log;

        public Controller(IRepository db, ILogger<Controller> log)
        {
            _db = db;
            _log = log;
        }

        public async Task<ActionResult> GetStops()
        {
            List<Stop> stops = await _db.GetStops();

            if (stops != null)
            {
                return Ok(stops.OrderBy(s => s.MinutesFromOslo));
            }
            else
            {
                String message = "Unable to get Stops from Database";
                _log.LogInformation(message);
                return NotFound(message);
            }
        }

        public async Task<ActionResult> GetTicketTypes()
        {
            List<TicketType> ticketTypes = await _db.GetTicketTypes();

            if (ticketTypes != null)
            {
                return Ok(ticketTypes);
            }
            else
            {
                String message = "Unable to get TicketTypes from Database";
                _log.LogInformation(message);
                return NotFound(message);
            }
        }

        public async Task<ActionResult> GetRoute(String label)
        {
            Route route = await _db.GetRoute(label);

            if (route != null)
            {
                return Ok(route);
            }
            else
            {
                String message = "Unable to get requested Route";
                _log.LogInformation(message);
                return NotFound(message);
            }
        }

        public async Task<ActionResult> GetRouteTables()
        {
            List<RouteTable> routeTables = await _db.GetRouteTables();

            if (routeTables != null)
            {
                return Ok(routeTables);
            }
            else
            {
                String message = "Unable to get requested RouteTables";
                _log.LogInformation(message);
                return NotFound(message);
            }
        }

        public async Task<ActionResult> StoreTicket(Ticket ticket)
        {
            string message;
            if (ModelState.IsValid)
            {
                bool successful = await _db.StoreTicket(ticket);

                if (successful)
                {
                    return Ok("Successfully stored Ticket");
                }
                else
                {
                    message = "Unable to store Ticket in Database";
                    _log.LogInformation(message);
                    return BadRequest(message);
                }
            }
            message = "Invalid inputs";
            _log.LogInformation(message);
            return BadRequest(message);

        }

        // Async and await _db calls
        // async Task<ActionResult> and return Ok(object) or BadRequest("Message") or NotFound("Message")
        // (ModelState.IsValid) to ensure that required fields are filled correctly
    }
}
