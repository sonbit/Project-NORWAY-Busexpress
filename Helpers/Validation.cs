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

        //public static bool ValidateDBData(DBData dBData)
        //{
        //    if (!dBData.Routes.IsNullOrEmpty())
        //    {
        //        foreach (var route in dBData.Routes)
        //        {
        //            if (route.Label.GetType() != typeof(string)) return false;
        //            if (route.MidwayStop.GetType() != typeof(string)) return false;
        //            if (route.PricePerMin.GetType() != typeof(double)) return false;
        //            if (route.Stops.GetType() != typeof(Stop)) return false;
        //            if (route.RouteTables.GetType() != typeof(RouteTable)) return false;   
        //        }
        //    }

        //    if (!dBData.Stops.IsNullOrEmpty())
        //    {
        //        foreach (var stop in dBData.Stops)
        //        {
        //            var dbStop = await _db.Stops.FirstOrDefaultAsync(s => s.Id == stop.Id);

        //            if (dbStop == null)
        //            {
        //                _db.Stops.Add(stop);
        //            }
        //            else
        //            {
        //                dbStop.Name = stop.Name;
        //                dbStop.MinutesFromHub = stop.MinutesFromHub;
        //                dbStop.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == stop.Route.Label);
        //                // The route should exist as we populate the routes table above prior to this call
        //            }
        //        }
        //    }

        //    if (!dBData.RouteTables.IsNullOrEmpty())
        //    {
        //        foreach (var routeTable in dBData.RouteTables)
        //        {
        //            var dbRouteTable = await _db.RouteTables.FirstOrDefaultAsync(rt => rt.Id == routeTable.Id);

        //            if (dbRouteTable == null)
        //            {
        //                _db.RouteTables.Add(routeTable);
        //            }
        //            else
        //            {
        //                dbRouteTable.Route = await _db.Routes.FirstOrDefaultAsync(r => r.Label == dbRouteTable.Route.Label);
        //                dbRouteTable.FromHub = routeTable.FromHub;
        //                dbRouteTable.FullLength = routeTable.FullLength;
        //                dbRouteTable.StartTime = routeTable.StartTime;
        //                dbRouteTable.EndTime = routeTable.EndTime;
        //            }
        //        }
        //    }
        //}
    }
}
