using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Models
{
    public class DBData
    {
        public List<Stop> Stops { get; set; }
        public List<Route> Routes { get; set; }
        public List<RouteTable> RouteTables { get; set; }
        public List<Ticket> Tickets { get; set; }
        public List<TicketType> TicketTypes { get; set; }
        public List<TicketTypeComposition> TicketTypeCompositions { get; set; }
        public List<User> Users { get; set; }
    }
}
