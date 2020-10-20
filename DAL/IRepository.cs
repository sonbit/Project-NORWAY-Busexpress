using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Project_NORWAY_Busexpress.Models;

namespace Project_NORWAY_Busexpress.DAL
{
    public interface IRepository
    {
        Task<List<Stop>> GetStops();
        Task<List<TicketType>> GetTicketTypes();
        Task<List<TicketTypeComposition>> GetPassengerCompositions();
        Task<List<Route>> GetRoutes();
        Task<List<RouteTable>> GetRouteTables();
        Task StoreTicket(Ticket ticket);
        Task<List<Ticket>> GetTickets(String email);
        Task<List<Ticket>> GetTickets();
        Task<List<TicketTypeComposition>> GetTicketTypeCompositions();
        Task<User> FindUser(User user);
        Task<List<User>> GetUsers();
        Task<DBData> GetData();
        Task DeleteData(String[][] primaryKeys, String email);
        Task<DBData> EditData(DBData dBData, String email);
        //Task LogDatabaseAccess(String email, String changes);
    }
}
