using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models
{
    public class RouteTable
    {
        public int Id { get; set; }
        public virtual Route Route { get; set; }
        public String Direction { get; set; }
        public String FullLength { get; set; }
        public String StartTime { get; set; }
        public String EndTime { get; set; }
    }
}
