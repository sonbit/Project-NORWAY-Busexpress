using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public virtual RouteTable RouteTable { get; set; }
        public virtual List<PassengerCombination> PassengerCombinations { get; set; }
        public int TotalPrice { get; set; }
        public String Email { get; set; }
        public String PhoneNumber { get; set; }
    }
}
