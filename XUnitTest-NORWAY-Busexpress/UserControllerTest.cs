using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Project_NORWAY_Busexpress.Controllers;
using Project_NORWAY_Busexpress.DAL;
using Project_NORWAY_Busexpress.Helpers;
using Project_NORWAY_Busexpress.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace XUnitTest_NORWAY_Busexpress
{
    public class UserControllerTest
    {
        private const String _loggedIn = "LoggedIn";
        private const String _asAdmin = "ADMIN";
        private const String _asUser = "USER";
        private const String _notLoggedIn = "";

        private readonly Mock<IRepository> mockRep = new Mock<IRepository>();
        private readonly Mock<ILogger<UserController>> mockLog = new Mock<ILogger<UserController>>();

        private readonly Mock<HttpContext> mockHttpContext = new Mock<HttpContext>();
        private readonly MockHttpSession mockSession = new MockHttpSession();

        [Fact]
        public async Task LogInUser()
        {
            // Arrange
            var salt = Calculate.Salt();
            var password = "abc";

            User testUser = new User { Id = 1, Email = "test@norway.no", Admin = false, Password = password, Salt = salt, HashedPassword = Calculate.Hash(password, salt)};

            mockRep.Setup(r => r.FindUser(It.IsAny<User>())).ReturnsAsync(testUser);

            var userController = new UserController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asUser;
            mockHttpContext.Setup(c => c.Session).Returns(mockSession);
            userController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await userController.LogIn(testUser) as OkObjectResult;

            // Assert
            Assert.Equal((int)HttpStatusCode.OK, result.StatusCode);
            Assert.Equal("mypage.html", result.Value);
        }

        [Fact]
        public async Task LogInAdmin()
        {
            // Arrange
            var salt = Calculate.Salt();
            var password = "abc";

            User adminUser = new User { Id = 1, Email = "admin@norway.no", Admin = true, Password = password, Salt = salt, HashedPassword = Calculate.Hash(password, salt) };
            
            mockRep.Setup(r => r.FindUser(It.IsAny<User>())).ReturnsAsync(adminUser);

            var userController = new UserController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asAdmin;
            mockHttpContext.Setup(c => c.Session).Returns(mockSession);
            userController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await userController.LogIn(adminUser) as OkObjectResult;

            // Assert
            Assert.Equal((int)HttpStatusCode.OK, result.StatusCode);
            Assert.Equal("administration.html", result.Value);
        }

        [Fact]
        public async Task LogInInccorectDetails()
        {
            // Arrange
            var salt = Calculate.Salt();
            var password = "abc";
            var incorrectPW = "incorrect";

            User testUser = new User { Id = 1, Email = "test@norway.no", Admin = false, Password = password, Salt = salt, HashedPassword = Calculate.Hash(incorrectPW, salt) };
            
            mockRep.Setup(r => r.FindUser(It.IsAny<User>())).ReturnsAsync(testUser);

            var userController = new UserController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asUser;
            mockHttpContext.Setup(c => c.Session).Returns(mockSession);
            userController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await userController.LogIn(testUser) as UnauthorizedObjectResult;

            // Assert
            Assert.Equal((int)HttpStatusCode.Unauthorized, result.StatusCode);
            Assert.Equal("Email or password is incorrect", result.Value);
        }

        [Fact]
        public async Task LogInInputError()
        {
            // Arrange
            mockRep.Setup(r => r.FindUser(It.IsAny<User>())).ReturnsAsync(It.IsAny<User>());

            var userController = new UserController(mockRep.Object, mockLog.Object);

            userController.ModelState.AddModelError("Email", "User info (email, password) failed validation");

            mockSession[_loggedIn] = _asUser;
            mockHttpContext.Setup(c => c.Session).Returns(mockSession);
            userController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await userController.LogIn(It.IsAny<User>()) as BadRequestObjectResult;

            // Assert
            Assert.Equal((int)HttpStatusCode.BadRequest, result.StatusCode);
            Assert.Equal("User info (email, password) failed validation", result.Value);
        }

        [Fact]
        public void LogOutUser()
        {
            var userController = new UserController(mockRep.Object, mockLog.Object);

            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            mockSession[_loggedIn] = _asUser;
            userController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            userController.LogOut();

            // Assert
            Assert.Equal(_notLoggedIn, mockSession[_loggedIn]);
        }

        [Fact]
        public void LogOutAdmin()
        {
            var userController = new UserController(mockRep.Object, mockLog.Object);

            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            mockSession[_loggedIn] = _asAdmin;
            userController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            userController.LogOut();

            // Assert
            Assert.Equal(_notLoggedIn, mockSession[_loggedIn]);
        }
    }
}
