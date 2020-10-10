using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.Helpers
{
    // Helper class used for creating objects that contain only the necessary data to send to client
    public class Response
    {
        public List<String> StopNames { get; }
        public String[,] TicketTypeComposition { get; }

        // Initial Response that contains StopNames and TicketTypeComposition, to allow client to select Stops and number of passengers
        public Response(List<Stop> allStops, List<TicketType> allTicketTypes, List<TicketTypeComposition> allPassengerCompositions)
        {
            StopNames = new List<String>();

            foreach (Stop stop in allStops)
            {
                StopNames.Add(stop.Name);
            }

            TicketTypeComposition = new String[allTicketTypes.Count, 3];

            for (int i = 0; i < allTicketTypes.Count; i++)
            {
                TicketTypeComposition[i, 0] = allTicketTypes[i].Label;
                TicketTypeComposition[i, 1] = allTicketTypes[i].Clarification;
                if (i == 0) TicketTypeComposition[i, 2] = allPassengerCompositions[i].NumberOfPassengers.ToString();
                else TicketTypeComposition[i, 2] = "0";
            }
        }

        public List<String> TravelTimestamps { get; }
        public int TotalPrice { get; }
        public String TravelTime { get; }
        public String RouteLabel { get; }

        public Response(List<String> travelTimestamps, String travelTime, int totalPrice, String routeLabel)
        {
            TravelTimestamps = travelTimestamps;
            TravelTime = FormatTime(travelTime);
            TotalPrice = totalPrice;
            RouteLabel = routeLabel;
        }

        // Formats time (10:30) to a more user friendly format (10t 30min)
        private String FormatTime(String travelTime)
        {
            var splitTime = travelTime.Split(":");
            var tempHours = Int32.Parse(splitTime[0]);
            var tempMinutes = Int32.Parse(splitTime[1]);
            
            string hours = tempHours > 0 ? tempHours + "t " : "";

            string minutes = "";
            if (tempMinutes >= 10) minutes = tempMinutes + "min";
            else if (Enumerable.Range(1, 9).Contains(tempMinutes)) minutes = tempMinutes.ToString().Substring(1);
            else if (tempMinutes == 0) minutes = "";

            return hours + minutes;
        }
    }
}
