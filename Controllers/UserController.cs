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
    public class UserController : ControllerBase
    {
        private readonly IRepository _db;
        private readonly ILogger<UserController> _log;

        private const String _loggedIn = "LoggedIn";
        private const String _asAdmin = "ADMIN";
        private const String _asUser = "USER";
        private const String _notLoggedIn = "";
        private static String _adminEmail = ""; // Either have to keep it static or parse it to the address bar

        public UserController(IRepository db, ILogger<UserController> log)
        {
            _db = db;
            _log = log;
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
                var dbUser = await _db.FindUser(user);

                if (dbUser != null)
                {
                    if (Calculate.Hash(user.Password, dbUser.Salt).SequenceEqual(dbUser.HashedPassword))
                    {
                        _log.LogInformation("Found user and password was correct");

                        if (dbUser.Admin)
                        {
                            _adminEmail = dbUser.Email;
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
            HttpContext.Session.SetString(_loggedIn, _notLoggedIn);
        }

        public ActionResult IsAdmin()
        {
            if (IsAdmin(HttpContext)) return Ok();
            else return Unauthorized();
        }

        public static bool IsAdmin(HttpContext httpContext)
        {
            var str = httpContext.Session.GetString(_loggedIn);
            if (string.IsNullOrEmpty(str)) return false;
            else if (str.Equals(_asAdmin)) return true;
            else return false;
        }

        public static String GetAdminEmail()
        {
            return _adminEmail;
        }
    }
}
