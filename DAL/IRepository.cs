using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.DAL
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
    }
}
