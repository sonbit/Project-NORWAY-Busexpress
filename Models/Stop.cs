using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class Stop
    {
        public int Id { get; set; }
        public String Name { get; set; }
        public int MinutesFromOslo { get; set; }

        public virtual Route Route { get; set; }
    }
}
