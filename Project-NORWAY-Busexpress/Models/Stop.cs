using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Models
{
    public class Stop
    {
        public int Id { get; set; }
        public String Name { get; set; }
        public int MinutesFromHub { get; set; }

        public virtual Route Route { get; set; }

        [NotMapped]
        public bool Edit { get; set; }
    }
}