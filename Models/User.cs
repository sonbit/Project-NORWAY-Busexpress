using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Models
{
    public class User
    {
        public int Id { get; set; }
        public String Email { get; set; }

        [NotMapped]
        public String Password { get; set; }

        public byte[] HashedPassword { get; set; }
        public byte[] Salt { get; set; }
        public bool Admin { get; set; }

        [NotMapped]
        public bool Edit { get; set; }
    }
}
