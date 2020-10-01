using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public virtual RouteTable RouteTable { get; set; }
        public virtual List<PassengerComposition> PassengerComposition { get; set; }
        public int TotalPrice { get; set; }

        [RegularExpression(@"^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$")]
        public String Email { get; set; }

        [RegularExpression(@"^(0047|\+47|47)?\d{8}$")]
        public String PhoneNumber { get; set; }
    }
}