using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class TicketType
    {
        public int Id { get; set; }
        public String Name { get; set; }
        public double PriceModifier { get; set; }
    }
}
