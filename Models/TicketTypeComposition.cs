using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Models
{
    public class TicketTypeComposition
    {
        public int Id { get; set; }
        public virtual Ticket Ticket { get; set; }
        public virtual TicketType TicketType { get; set; }
        public int NumberOfPassengers { get; set; }
    }
}
