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
        Task<List<RouteTable>> GetRouteTablesFromRouteID(int routeID);
        Task<bool> StoreTicket(Ticket ticket);
    }
}
