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
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Project_NORWAY_Busexpress.Controllers
{
    [Route("[controller]/[action]")]
    public class AdminController : ControllerBase
    {
        private readonly IRepository _db;
        private readonly ILogger<AdminController> _log;
        public List<String> InvalidDBData { get; set; }

        public AdminController(IRepository db, ILogger<AdminController> log)
        {
            _db = db;
            _log = log;
            InvalidDBData = new List<String>();
        }

        public async Task<ActionResult> GetData()
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized("User: Not logged in");

            try
            {
                return Ok(await _db.GetData());
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to get data from Database: " + ex);
                return NotFound("Admin: Unable to get data from Database");
            }
        }

        public async Task<ActionResult> DeleteData(String[][] primaryKeys)
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                await _db.DeleteData(primaryKeys, UserController.GetAdminEmail());
                return Ok("Admin: Data was deleted");
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to delete data in Database: " + ex);
                return NotFound("Admin: Unable to delete data in Database");
            }
        }

        public async Task<ActionResult> EditData(DBData dBData)
        {
            if (!UserController.IsAdmin(HttpContext)) return Unauthorized();

            try
            {
                // Validation occurs in Repository for each object in each list in DBData
                // All data that is valid will be added or edited
                DBData newData = await _db.EditData(dBData, UserController.GetAdminEmail(), InvalidDBData);
                
                foreach (var data in InvalidDBData)
                {
                    _log.LogError("Invalid Data: " + data);
                }

                return Ok(newData);
            }
            catch (Exception ex)
            {
                _log.LogError("Admin: Unable to add data to Database: " + ex);
                return NotFound("Admin: Unable to add data to Database");
            }
        }
    }
}