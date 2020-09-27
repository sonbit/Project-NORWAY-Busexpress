using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class TicketType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public String Label { get; set; }
        public double PriceModifier { get; set; }
    }
}
