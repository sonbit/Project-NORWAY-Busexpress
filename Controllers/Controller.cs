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
    public class Controller : ControllerBase
    {
        private readonly DataHandler _dataHandler;
        private readonly IRepository _db;
        private readonly ILogger<Controller> _log;

        private const String _loggedIn = "LoggedIn";
        private const String _asAdmin = "ADMIN";
        private const String _asUser = "USER";

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

        public async Task<ActionResult> LogIn(User user)
        {
            if (!ModelState.IsValid)
            {
                var invalidMessage = "User info (email, password) failed validation";
                _log.LogInformation(invalidMessage);
                return ValidationProblem(invalidMessage);
            }

            try
            {
                var dbUser = await _db.FindUser(user.Email);
                
                if (dbUser != null)
                {
                    if (Calculate.Hash(user.Password, dbUser.Salt).SequenceEqual(dbUser.HashedPassword))
                    {
                        _log.LogInformation("Found user and password was correct");

                        if (dbUser.Admin)
                        {
                            _log.LogInformation("Logging in " + dbUser.Email + " as admin user");
                            HttpContext.Session.SetString(_loggedIn, _asAdmin);
                            return Ok("administration.html");
                        }
                        else
                        {
                            // Temporary redirect back to mypage.html for any user besides admin
                            _log.LogInformation("Logging in " + dbUser.Email + " as normal user");
                            HttpContext.Session.SetString(_loggedIn, _asUser);
                            return Ok("mypage.html");
                        }
                    } 
                    else
                    {
                        LogOut();
                        _log.LogInformation("Found user, but password was incorrect");
                        return BadRequest("Email or password is incorrect");
                    }
                }
                else
                {
                    _log.LogWarning("Didn't find the user in DB");
                    return NotFound("Email or password is incorrect");
                }
            }
            catch (Exception ex)
            {
                _log.LogError("Unable to get requested User information " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public void LogOut()
        {
            HttpContext.Session.SetString(_loggedIn, "");
        }

        public ActionResult IsAdmin()
        {
            if (IsAdmin(HttpContext)) return Ok();
            else return Unauthorized();
        }

        public static bool IsAdmin(HttpContext httpContext)
        {
            return httpContext.Session.GetString(_loggedIn).Equals(_asAdmin);
        }
    }
}
