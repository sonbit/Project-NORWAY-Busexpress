using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Project_NORWAY_Busexpress.Controllers;
using Project_NORWAY_Busexpress.DAL;
using Project_NORWAY_Busexpress.Models;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace XUnitTest_NORWAY_Busexpress
{
    public class AdminControllerTest
    {
        private const String _loggedIn = "LoggedIn";
        private const String _asAdmin = "ADMIN";
        private const String _asUser = "USER";
        private const String _notLoggedIn = "";

        private readonly Mock<IRepository> mockRep = new Mock<IRepository>();
        private readonly Mock<ILogger<AdminController>> mockLog = new Mock<ILogger<AdminController>>();
        private readonly Mock<ILogger<UserController>> uMockLog = new Mock<ILogger<UserController>>();

        private readonly Mock<HttpContext> mockHttpContext = new Mock<HttpContext>();
        private readonly MockHttpSession mockSession = new MockHttpSession();

        [Fact]
        public async Task GetDataAdminLoggedIn()
        {
            mockRep.Setup(k => k.GetData()).ReturnsAsync(It.IsAny<DBData>());

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asAdmin;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.GetData() as OkObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.OK, result.StatusCode);
            Assert.Equal(It.IsAny<DBData>(), result.Value);
        }

        [Fact]
        public async Task GetDataAdminInputError()
        {
            mockRep.Setup(k => k.GetData()).ReturnsAsync(It.IsAny<DBData>());

            var adminController = new AdminController(mockRep.Object, mockLog.Object);
            var userController = new UserController(mockRep.Object, uMockLog.Object);

            userController.ModelState.AddModelError("Email", "User info (email, password) failed validation");

            mockSession[_loggedIn] = _asAdmin;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;
            userController.ControllerContext.HttpContext = mockHttpContext.Object;
            
            // Act
            var adminResult = await adminController.GetData() as OkObjectResult;
            var userResult = await userController.LogIn(It.IsAny<User>()) as BadRequestObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.OK, adminResult.StatusCode);
            Assert.Equal(It.IsAny<User>(), adminResult.Value);

            Assert.Equal((int)HttpStatusCode.BadRequest, userResult.StatusCode);
            Assert.Equal("User info (email, password) failed validation", userResult.Value);
        }

        [Fact]
        public async Task GetDataUserLoggedIn()
        {
            mockRep.Setup(k => k.GetData()).ReturnsAsync(It.IsAny<DBData>());

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asUser;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.GetData() as UnauthorizedObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.Unauthorized, result.StatusCode);
            Assert.Equal("User: Not logged in", result.Value);
        }

        [Fact]
        public async Task GetDataNotLoggedIn()
        {
            mockRep.Setup(k => k.GetData()).ReturnsAsync(It.IsAny<DBData>());

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _notLoggedIn;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.GetData() as UnauthorizedObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.Unauthorized, result.StatusCode);
            Assert.Equal("User: Not logged in", result.Value);
        }

        [Fact]
        public async Task DeleteDataAdminLoggedIn()
        {
            String[] primaries = new String[7];
            for (var i = 0; i < primaries.Length; i++) primaries[i] = "0";

            String[][] primaryKeys = new String[primaries.Length][];
            for (var i = 0; i < primaryKeys.Length; i++) primaryKeys[i] = primaries;

            mockRep.Setup(k => k.DeleteData(primaryKeys, "test@norway.no"));

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asAdmin;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.DeleteData(primaryKeys) as OkObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.OK, result.StatusCode);
            Assert.Equal("Admin: Data was deleted", result.Value);
        }

        [Fact]
        public async Task DeleteDataAdminInputError()
        {
            String[] primaries = new String[7];
            for (var i = 0; i < primaries.Length; i++) primaries[i] = "0";

            String[][] primaryKeys = new String[primaries.Length][];
            for (var i = 0; i < primaryKeys.Length; i++) primaryKeys[i] = primaries;

            mockRep.Setup(k => k.DeleteData(primaryKeys, "test@norway.no"));

            var adminController = new AdminController(mockRep.Object, mockLog.Object);
            var userController = new UserController(mockRep.Object, uMockLog.Object);

            userController.ModelState.AddModelError("Email", "User info (email, password) failed validation");

            mockSession[_loggedIn] = _asAdmin;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;
            userController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var adminResult = await adminController.GetData() as OkObjectResult;
            var userResult = await userController.LogIn(It.IsAny<User>()) as BadRequestObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.OK, adminResult.StatusCode);
            Assert.Equal(It.IsAny<User>(), adminResult.Value);

            Assert.Equal((int)HttpStatusCode.BadRequest, userResult.StatusCode);
            Assert.Equal("User info (email, password) failed validation", userResult.Value);
        }

        [Fact]
        public async Task DeleteDataUserLoggedIn()
        {
            String[] primaries = new String[7];
            for (var i = 0; i < primaries.Length; i++) primaries[i] = "0";

            String[][] primaryKeys = new String[primaries.Length][];
            for (var i = 0; i < primaryKeys.Length; i++) primaryKeys[i] = primaries;

            mockRep.Setup(k => k.DeleteData(primaryKeys, "test@norway.no"));

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asUser;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.GetData() as UnauthorizedObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.Unauthorized, result.StatusCode);
            Assert.Equal("User: Not logged in", result.Value);
        }

        [Fact]
        public async Task DeleteDataNotLoggedIn()
        {
            String[] primaries = new String[7];
            for (var i = 0; i < primaries.Length; i++) primaries[i] = "0";

            String[][] primaryKeys = new String[primaries.Length][];
            for (var i = 0; i < primaryKeys.Length; i++) primaryKeys[i] = primaries;

            mockRep.Setup(k => k.DeleteData(primaryKeys, "test@norway.no"));

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _notLoggedIn;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.GetData() as UnauthorizedObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.Unauthorized, result.StatusCode);
            Assert.Equal("User: Not logged in", result.Value);
        }

        [Fact]
        public async Task EditDataAdminLoggedIn()
        {
            mockRep.Setup(k => k.EditData(It.IsAny<DBData>(), "test@norway.no", It.IsAny<List<String>>())).ReturnsAsync(It.IsAny<DBData>());

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asAdmin;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.EditData(It.IsAny<DBData>()) as OkObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.OK, result.StatusCode);
            Assert.Equal(It.IsAny<DBData>(), result.Value);
        }

        [Fact]
        public async Task EditDataAdminInputError()
        {
            mockRep.Setup(k => k.EditData(It.IsAny<DBData>(), "test@norway.no", It.IsAny<List<String>>())).ReturnsAsync(It.IsAny<DBData>());

            var adminController = new AdminController(mockRep.Object, mockLog.Object);
            var userController = new UserController(mockRep.Object, uMockLog.Object);

            userController.ModelState.AddModelError("Email", "User info (email, password) failed validation");

            mockSession[_loggedIn] = _asAdmin;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;
            userController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var adminResult = await adminController.GetData() as OkObjectResult;
            var userResult = await userController.LogIn(It.IsAny<User>()) as BadRequestObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.OK, adminResult.StatusCode);
            Assert.Equal(It.IsAny<User>(), adminResult.Value);

            Assert.Equal((int)HttpStatusCode.BadRequest, userResult.StatusCode);
            Assert.Equal("User info (email, password) failed validation", userResult.Value);
        }

        [Fact]
        public async Task EditDataUserLoggedIn()
        {
            mockRep.Setup(k => k.EditData(It.IsAny<DBData>(), "test@norway.no", It.IsAny<List<String>>())).ReturnsAsync(It.IsAny<DBData>());

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _asUser;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.GetData() as UnauthorizedObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.Unauthorized, result.StatusCode);
            Assert.Equal("User: Not logged in", result.Value);
        }

        [Fact]
        public async Task EditDataNotLoggedIn()
        {
            mockRep.Setup(k => k.EditData(It.IsAny<DBData>(), "test@norway.no", It.IsAny<List<String>>())).ReturnsAsync(It.IsAny<DBData>());

            var adminController = new AdminController(mockRep.Object, mockLog.Object);

            mockSession[_loggedIn] = _notLoggedIn;
            mockHttpContext.Setup(s => s.Session).Returns(mockSession);
            adminController.ControllerContext.HttpContext = mockHttpContext.Object;

            // Act
            var result = await adminController.GetData() as UnauthorizedObjectResult;

            // Assert 
            Assert.Equal((int)HttpStatusCode.Unauthorized, result.StatusCode);
            Assert.Equal("User: Not logged in", result.Value);
        }
    }
}
