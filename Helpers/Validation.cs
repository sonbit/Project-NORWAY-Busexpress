using Castle.Core.Internal;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Logging;
using Project_NORWAY_Busexpress.DAL;
using Project_NORWAY_Busexpress.Helpers;
using Project_NORWAY_Busexpress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Controllers
{
    public class Validation
    {
        public static bool ValidateTotalPrice(Ticket ticket, DataHandler _dataHandler)
        {
            // Start and End variables of Ticket contains the time + the stop name. Extract the stop names first
            var startSplit = ticket.Start.Split(" ");
            var start = "";
            for (var i = 1; i < startSplit.Length; i++)
            {
                if (i > 1) start += " ";
                start += startSplit[i];
            }
                
            var endSplit = ticket.End.Split(" ");
            var end = "";
            for (var i = 1; i < endSplit.Length; i++)
            {
                if (i > 1) end += " ";
                end += endSplit[i];
            }

            TravelData travelData = new TravelData
            {
                TravelFrom = start,
                TravelTo = end,
                Travellers = FormatPassengers(ticket.Passengers)
            };

            // Verify that the travel time is correct
            if (ticket.TravelTime.CompareTo(_dataHandler.CalculateTravelTime(travelData)) != 0)
                return false;

            // Verify that the total price is correct
            if (ticket.TotalPrice.CompareTo(_dataHandler.CalculateTotalPrice(travelData, ticket.TravelTime)) != 0)
                return false;

            return true;
        }

        private static String FormatPassengers(List<int> passengers)
        {
            var travellers = "";
            for (var i = 0; i < passengers.Count; i++) travellers += passengers[i];
            return travellers;
        }

        //public static bool ValidateDBData(DBData dbData)
        //{
        //    ValidateType(dbData);
        //}

        //private static bool ValidateType(DBData dbData)
        //{
        //    if (!dbData.Routes.IsNullOrEmpty())
        //    {
        //        foreach (var route in dbData.Routes)
        //        {
        //            if (route.Label.GetType() != typeof(String)) return false;
        //            if (route.MidwayStop.GetType() != typeof(String)) return false;
        //            if (route.PricePerMin.GetType() != typeof(double)) return false;
        //            if (route.Stops.GetType() != typeof(Stop)) return false;
        //            if (route.RouteTables.GetType() != typeof(RouteTable)) return false;
        //        }
        //    }

        //    if (!dbData.Stops.IsNullOrEmpty())
        //    {
        //        foreach (var stop in dbData.Stops)
        //        {
        //            if (stop.Id.GetType() != typeof(int)) return false;
        //            if (stop.Name.GetType() != typeof(String)) return false;
        //            if (stop.MinutesFromHub.GetType() != typeof(int)) return false;
        //            if (stop.Route.Label.GetType() != typeof(String)) return false;
        //        }
        //    }

        //    if (!dbData.RouteTables.IsNullOrEmpty())
        //    {
        //        foreach (var routeTable in dbData.RouteTables)
        //        {
        //            if (routeTable.Id.GetType() != typeof(int)) return false;
        //            if (routeTable.FromHub.GetType() != typeof(bool)) return false;
        //            if (routeTable.FullLength.GetType() != typeof(bool)) return false;
        //            if (routeTable.Route.Label.GetType() != typeof(string)) return false;
        //            if (routeTable.StartTime.GetType() != typeof(string)) return false;
        //            if (routeTable.EndTime.GetType() != typeof(string)) return false;
        //        }
        //    }

        //    return true;
        //}
    }
}
