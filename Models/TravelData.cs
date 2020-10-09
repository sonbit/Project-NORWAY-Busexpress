using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class TravelData
    {
        public String TravelFrom { get; set; }
        public String TravelTo { get; set; }
        public String TravelDate { get; set; }

        // Represents composition with a string of 7 int values, instead of using an array
        public String Travellers { get; set; }
    }
}
