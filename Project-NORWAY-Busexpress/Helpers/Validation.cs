using Castle.Core.Internal;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Logging;
using Project_NORWAY_Busexpress.DAL;
using Project_NORWAY_Busexpress.Helpers;
using Project_NORWAY_Busexpress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Controllers
{
    public class Validation
    {
        // IDEA: Store regex expressions as static constants, use for models and send to client
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

        public static bool ValidateStop(Stop stop)
        {
            return 
                ValidateId(stop.Id) && 
                ValidateStopName(stop.Name) && 
                ValidateMinutesFromHub(stop.MinutesFromHub) && 
                ValidateRouteLabel(stop.Route.Label);
        }

        public static bool ValidateRoute(Route route)
        {
            return
                ValidateRouteLabel(route.Label) &&
                ValidatePriceDouble(route.PricePerMin) &&
                ValidateStopName(route.MidwayStop);
        }

        public static bool ValidateRouteTable(RouteTable routeTable)
        {
            return
                ValidateId(routeTable.Id) &&
                ValidateRouteLabel(routeTable.Route.Label) &&
                ValidateTimeFormat(routeTable.StartTime) &&
                ValidateTimeFormat(routeTable.EndTime);
        }

        public static bool ValidateTicketType(TicketType ticketType)
        {
            return
                ValidateTypeLabel(ticketType.Label) &&
                ValidatePriceDouble(ticketType.PriceModifier);
        }

        public static bool ValidateUser(User user)
        {
            return
                ValidateEmail(user.Email) &&
                ValidatePassword(user.Password);
        }

        private static bool ValidateId(int id)
        {
            var regex = new Regex(@"^[1-9][0-9]{0,2}$");
            return regex.Match(id.ToString()).Success;
        }

        private static bool ValidateStopName(String name)
        {
            var regex = new Regex(@"^[a-zA-ZæøåÆØÅ.() \-]{1,}[0-9a-zA-ZæøåÆØÅ.() \-]{1,}$");
            return regex.Match(name).Success;
        }

        private static bool ValidateMinutesFromHub(int min)
        {
            var regex = new Regex(@"^([0-9]|[1-9][0-9]{1,2})$");
            return regex.Match(min.ToString()).Success;
        }

        private static bool ValidatePriceDouble(double price)
        {
            var regex = new Regex(@"^(([0-9]|[1-9])|([0-9]|[1-9])\.[0-9]{1,2})$");
            return regex.Match(price.ToString()).Success;
        }

        private static bool ValidateTimeFormat(String time)
        {
            var regex = new Regex(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$");
            return regex.Match(time).Success;
        }

        private static bool ValidateRouteLabel(String label)
        {
            var regex = new Regex(@"^[a-zA-ZæøåÆØÅ.() \-]{2,}[0-9a-zA-ZæøåÆØÅ.() \-]{3,}$");
            return regex.Match(label).Success;
        }

        private static bool ValidateTypeLabel(String label)
        {
            var regex = new Regex(@"^[a-zA-ZæøåÆØÅ. \-]{3,10}$");
            return regex.Match(label).Success;
        }

        private static bool ValidateEmail(String email)
        {
            var regex = new Regex(@"^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$");
            return regex.Match(email).Success;
        }

        private static bool ValidatePassword(String password)
        {
            if (password.IsNullOrEmpty()) return true;

            var regex = new Regex(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$");
            return regex.Match(password).Success;
        }
    }
}