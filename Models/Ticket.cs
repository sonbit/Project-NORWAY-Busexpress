using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public String Date { get; set; }
        public String Start { get; set; }
        public String End { get; set; }
        public int TravelTime { get; set; }
        public virtual Route Route { get; set; }
        public virtual List<TicketTypeComposition> TicketTypeCompositions { get; set; }
        public int TotalPrice { get; set; }

        [RegularExpression(@"^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$")]
        public String Email { get; set; }

        [RegularExpression(@"^(0047|\+47|47)?\d{8}$")]
        public String PhoneNumber { get; set; }

        [NotMapped]
        public List<int> Passengers { get; set; }
    }
}