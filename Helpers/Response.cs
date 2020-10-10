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
        public int TravelTime { get; }
        public String RouteLabel { get; }

        public Response(List<String> travelTimestamps, int travelTime, int totalPrice, String routeLabel)
        {
            TravelTimestamps = travelTimestamps;
            TravelTime = travelTime;
            TotalPrice = totalPrice;
            RouteLabel = routeLabel;
        }

        public String TravelDate { get; }
        public String Start { get; }
        public String End { get; }
        public String Email { get; }
        public String PhoneNumber { get; }
        public Response(String travelDate, String start, String end, int travelTime, String routeLabel, 
            int totalPrice, List<TicketTypeComposition> ticketTypeCompositions, String email, String phoneNumber)
        {
            TravelDate = travelDate;
            Start = start;
            End = end;
            TravelTime = travelTime;
            RouteLabel = routeLabel;
            TotalPrice = totalPrice;

            TicketTypeComposition = new String[ticketTypeCompositions.Count, 2];
            for (int i = 0; i < ticketTypeCompositions.Count; i++)
            {
                TicketTypeComposition[i, 0] = ticketTypeCompositions[i].NumberOfPassengers.ToString();
                TicketTypeComposition[i, 1] = ticketTypeCompositions[i].TicketType.Label;
            }

            Email = email;
            PhoneNumber = phoneNumber;
        }
    }
}