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
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Helpers;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Controllers
{
    [Route("[controller]/[action]")]
    public class Controller : ControllerBase
    {
        private readonly DataHandler _dataHandler;
        private readonly IRepository _db;
        private readonly ILogger<Controller> _log;

        public Controller(IRepository db, ILogger<Controller> log)
        {
            _dataHandler = new DataHandler(db);
            _db = db;
            _log = log;
        }

        public async Task<ActionResult> GetInitialData()
        {
            try
            {
                Response response = await _dataHandler.CreateInitialResponse();
                return Ok(response);
            }
            catch (Exception ex)
            {
                String message = "Unable to get Initial Data (Stops, TicketTypes) from Database: ";
                _log.LogError(message + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetTravelAlternatives(TravelData travelData)
        {
            try
            {
                Response response = await _dataHandler.CreateTravelAlternatives(travelData);
                return Ok(response);
            }
            catch (Exception ex)
            {
                String message = "Unable to get Travel Alternatives from Database: ";
                _log.LogError(message + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> StoreTicket(Ticket ticket)
        {
            Console.WriteLine(ticket);

            if (!ModelState.IsValid)
            {
                var invalidMessage = "Contact info (email, phone) failed validation";
                _log.LogInformation(invalidMessage);
                return ValidationProblem(invalidMessage);
            }

            try
            {
                if (Validation.ValidateTotalPrice(ticket, _dataHandler))
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
                List<Response> response = await _dataHandler.CreateTicketResponse(email);
                return Ok(response);

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
