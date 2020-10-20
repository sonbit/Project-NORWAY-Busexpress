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

        public async Task<ActionResult> GetData()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                DBData dbData = new DBData
                {
                    Stops = await _db.GetStops(),
                    Routes = await _db.GetRoutes(),
                    RouteTables = await _db.GetRouteTables(),
                    Tickets = await _db.GetTickets(),
                    TicketTypes = await _db.GetTicketTypes(),
                    TicketTypeCompositions = await _db.GetTicketTypeCompositions(),
                    Users = await _db.GetUsers()
                };

                return Ok(dbData);
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get data from Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> DeleteData(String[][] primaryKeys)
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                await _db.DeleteData(primaryKeys, UserController.GetAdminEmail());
                return Ok();
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to delete data in Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<ActionResult> EditData(DBData dBData)
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                return Ok(await _db.EditData(dBData, UserController.GetAdminEmail()));
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to add data to Database: " + ex);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }
    }
}