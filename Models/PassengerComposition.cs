using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class PassengerComposition
    {
        public int Id { get; set; }
        public virtual Ticket Ticket { get; set; }
        public virtual TicketType TicketType { get; set; }
        public int NumberOfPassengers { get; set; }
    }
}
