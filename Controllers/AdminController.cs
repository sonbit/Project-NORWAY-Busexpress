using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Project_NORWAY_Busexpress.DAL;
using Project_NORWAY_Busexpress.Models;
using Project_NORWAY_Busexpress.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Controllers
{
    // NOTE: Session timeout isn't being handled, which means after timeout, the call to Controller.IsAdmin() will throw NullPointerException
    [Route("[controller]/[action]")]
    public class AdminController : ControllerBase
    {
        private readonly IRepository _db;
        private readonly ILogger<AdminController> _log;

        public AdminController(IRepository db, ILogger<AdminController> log)
        {
            _db = db;
            _log = log;
        }

        public async Task<ActionResult> GetStops()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                return Ok(await _db.GetStops());
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get Stops from Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetRoutes()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                return Ok(await _db.GetRoutes());
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get Routes from Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetRouteTables()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                return Ok(await _db.GetRouteTables());
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get RouteTables from Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetTickets()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                return Ok(await _db.GetTickets());
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get Tickets from Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetTicketTypes()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                return Ok(await _db.GetTicketTypes());
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get TicketTypes from Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetTicketTypeCompositions()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                return Ok(await _db.GetTicketTypeCompositions());
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get TicketTypeCompositions from Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> GetUsers()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                return Ok(await _db.GetUsers());
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get Users from Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> DeleteData(String[][] primaryKeys)
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                await _db.DeleteData(primaryKeys);
                return Ok();
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to delete data from client: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }
    }
}