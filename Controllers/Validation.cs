using Microsoft.Extensions.Logging;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.DAL;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Controllers
{
    public class Validation
    {
        public static async Task<bool> ValidateTotalPrice(Ticket ticket, IRepository _db)
        {
            var ticketTypes = await _db.GetTicketTypes();

            String[] startSplit = ticket.Start.Split(" ");
            int startTime = Int32.Parse(startSplit[0].Split(":")[0]) * 60 + Int32.Parse(startSplit[0].Split(":")[1]);

            String[] endSplit = ticket.End.Split(" ");
            int endTime = Int32.Parse(endSplit[0].Split(":")[0]) * 60 + Int32.Parse(endSplit[0].Split(":")[1]);

            int travelTime = Math.Abs(startTime - endTime);
            if (travelTime.CompareTo(ticket.TravelTime) != 0) return false;

            double pricePerMin = ticket.Route.PricePerMin;
            double totalPrice = 0;

            for (int i = 0; i < ticket.TicketPassengers.Count; i++)
            {
                totalPrice += travelTime * pricePerMin * ticket.TicketPassengers[i] * ticketTypes[i].PriceModifier;
            }
            if (totalPrice.CompareTo(ticket.TotalPrice) != 0) return false;

            return true;
        }
    }
}
