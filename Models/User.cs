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

        [RegularExpression(@"^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$")]
        public String Email { get; set; }

        [NotMapped]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$")]
        public String Password { get; set; }

        public byte[] HashedPassword { get; set; }
        public byte[] Salt { get; set; }
        public bool Admin { get; set; }

    }
}
