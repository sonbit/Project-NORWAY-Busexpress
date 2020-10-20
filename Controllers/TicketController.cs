using Project_NORWAY_Busexpress.DAL;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Project_NORWAY_Busexpress.Models;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using Project_NORWAY_Busexpress.Helpers;

namespace Project_NORWAY_Busexpress.Controllers
{
    [Route("[controller]/[action]")]
    public class TicketController : ControllerBase
    {
        private readonly DataHandler _dataHandler;
        private readonly IRepository _db;
        private readonly ILogger<TicketController> _log;

        public TicketController(IRepository db, ILogger<TicketController> log)
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
                _log.LogError("Unable to get Initial Data (Stops, TicketTypes) from Database: " + ex);
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
                _log.LogError("Unable to get Travel Alternatives from Database: " + ex);
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
                if (Validation.ValidateTotalPrice(ticket, _dataHandler))
                {
                    await _db.StoreTicket(ticket);
                    return Ok("Successfully stored Ticket");
                } 
                else
                {
                    _log.LogError("Ticket validation error");
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

                if (response == null) return NotFound("The email address doesn't equate to any Ticket"); 
                return Ok(response);
            }
            catch (Exception ex)
            {
                var message = "Unable to get requested Tickets: ";
                _log.LogError(message + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
