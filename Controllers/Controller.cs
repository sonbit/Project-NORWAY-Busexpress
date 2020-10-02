using Prosjekt_Oppgave_NOR_WAY_Bussekspress.DAL;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;

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
            try
            {
                var stops = await _db.GetStops();
                return Ok(stops.OrderBy(s => s.MinutesFromOslo));
            }
            catch (Exception ex)
            {
                String message = "Unable to get Stops from Database: ";
                _log.LogError(message + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetTicketTypes()
        {
            try
            {
                var ticketTypes = await _db.GetTicketTypes();
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                String message = "Unable to get TicketTypes from Database: ";
                _log.LogError(message + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetRouteTables()
        {
            try
            {
                var routeTables = await _db.GetRouteTables();
                return Ok(routeTables);

            }
            catch (Exception ex)
            {
                var message = "Unable to get requested RouteTables: ";
                _log.LogError(message + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> StoreTicket(Ticket ticket)
        {
            

            if (!ModelState.IsValid)
            {
                var invalidMessage = "Contact info (email, phone) failed validation";
                _log.LogInformation(invalidMessage);
                return ValidationProblem(invalidMessage);
            }

            try
            {
                if (await Validation.ValidateTotalPrice(ticket, _db))
                {
                    await _db.StoreTicket(ticket);
                    return Ok("Successfully stored Ticket");
                } 
                else
                {
                    return ValidationProblem("Ticket object is invalid");
                }
                
            }
            catch (Exception ex)
            {
                _log.LogError("Unable to store Ticket in Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);

            }
        }

        public async Task<ActionResult> GetTickets(String email)
        {
            try
            {
                var tickets = await _db.GetTickets(email);
                return Ok(tickets);

            }
            catch (Exception ex)
            {
                var message = "Unable to get requested Routes: ";
                _log.LogError(message + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
