using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class Route
    {
        public int Id { get; set; }
        public double PricePerKM { get; set; }

        public virtual List<Stop> Stops { get; set; }
        public virtual List<RouteTable> RouteTables { get; set; }
    }
}
