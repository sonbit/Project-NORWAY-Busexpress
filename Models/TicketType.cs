using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Models
{
    public class TicketType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public String Label { get; set; }
        public String Clarification { get; set; }
        public double PriceModifier { get; set; }
    }
}
