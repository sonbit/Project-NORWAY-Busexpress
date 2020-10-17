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
                
            var passengers = ticket.Passengers;
            var travelTime = ticket.TravelTime;
            var stops = _dataHandler.GetAllStops();
            var ticketTypes = _dataHandler.GetAllTicketTypes();
            var routes = _dataHandler.GetAllRoutes();
            var priceRounding = _dataHandler.GetPriceRounding();

            // Verify that the travel time is correct
            if (ticket.TravelTime.CompareTo(Calculate.TravelTime(start, end, stops)) != 0)
                return false;

            // Verify that the total price is correct
            if (ticket.TotalPrice.CompareTo(Calculate.TotalPrice(start, passengers, travelTime, stops, routes, ticketTypes, priceRounding)) != 0)
                return false;

            return true;
        }
    }
}
