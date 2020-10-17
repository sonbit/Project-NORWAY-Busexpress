using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Project_NORWAY_Busexpress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.Helpers
{
    public class Calculate
    {
        // Get correct RouteTables based on user input, and adjust the start and end times according to selected Stop locations
        public static List<String> TravelTimeStamps(String startName, String endName, List<Stop> allStops, List<RouteTable> allRouteTables)
        {
            // Find which Route the user has selected
            Route relevantRoute = allStops.FirstOrDefault(s => s.Name.Equals(startName)).Route;

            // Find all RouteTables that correspond to this Route
            List<RouteTable> relevantRouteTables = allRouteTables.FindAll(rt => rt.Route.Label.Equals(relevantRoute.Label));

            // Remove all RouteTables that go in the opposite direction
            relevantRouteTables = relevantRouteTables.FindAll(
                rt => rt.FromHub.Equals(Direction(startName, endName, allStops)));

            // Remove all RouteTables that don't go as far as the selected end Stop
            if (IsFullLength(endName, allStops))
                relevantRouteTables = relevantRouteTables.FindAll(rt => rt.FullLength.Equals(true));

            var travelTimes = new List<String>();
            var startTimeAdjusted = "";
            var endTimeAdjusted = "";

            foreach (RouteTable rt in relevantRouteTables)
            {
                var tavelTimeOrigins = TravelTimeOrigins(startName, endName, allStops);

                startTimeAdjusted = MinutesToTime(TimeToMinutes(rt.StartTime) + tavelTimeOrigins[0]);
                endTimeAdjusted = MinutesToTime(TimeToMinutes(rt.StartTime) + tavelTimeOrigins[1]);
                travelTimes.Add(startTimeAdjusted + "-" + endTimeAdjusted);
            }

            return travelTimes;
        }

        // Adjust the start and end time according to what start and end stops the user has selected
        public static int[] TravelTimeOrigins(String startName, String endName, List<Stop> allStops)
        {
            var routeStart = (Direction(startName, endName, allStops)) ? allStops[0].Name : allStops[allStops.Count - 1].Name;

            return new int[] {
                TravelTime(routeStart, startName, allStops),
                TravelTime(routeStart, endName, allStops)
            };
                
        }

        // Calculate how long it takes to travel between two Stops based on their MinutesFromHub value
        public static int TravelTime(String startName, String endName, List<Stop> allStops)
        {
            int startValue = allStops.FirstOrDefault(s => s.Name.StartsWith(startName)).MinutesFromHub;
            int endValue = allStops.FirstOrDefault(s => s.Name.StartsWith(endName)).MinutesFromHub;

            return Math.Abs(startValue - endValue);
        }

        // Check the direction of the selected Stop locations, to determine which RouteTables to fetch
        public static bool Direction(String startName, String endName, List<Stop> allStops)
        {
            int startIndex = allStops.FindIndex(stop => stop.Name.StartsWith(startName));
            int endIndex = allStops.FindIndex(stop => stop.Name.StartsWith(endName));

            return startIndex < endIndex;
        }

        // Check whether the selected Stops indicate user is travelling the full length, to determine which RouteTables to fetch
        public static bool IsFullLength(String endName, List<Stop> allStops)
        {
            int endIndex = allStops.FindIndex(stop => stop.Name.StartsWith(endName));

            String midwayName = allStops[endIndex].Route.MidwayStop;
            int midwayIndex = allStops.FindIndex(stop => stop.Name.StartsWith(midwayName));

            return endIndex > midwayIndex;
        }

        // Calculate total price for the trip based on user selected Stops and passengers
        public static int TotalPrice(String startName, String travellers, int travelDifference,
            List<Stop> allStops, List<Route> allRoutes, List<TicketType> allTicketTypes, double priceRounding)
        {
            double totalPrice = 0.0;

            //var standardPrice = travelDifference *
            //    allStops.FirstOrDefault(s => s.Name.Equals(startName)).Route.PricePerMin;

            var standardPrice = travelDifference *
                allRoutes.FirstOrDefault(r => r.Label.Equals(
                    allStops.Where(s => s.Name.Equals(startName)).Select(s => s.Route.Label))).PricePerMin;

            for (var i = 0; i < allTicketTypes.Count; i++)
            {
                totalPrice += standardPrice * Int32.Parse(travellers[i].ToString()) * allTicketTypes[i].PriceModifier;
            }

            return (int)(Math.Ceiling(totalPrice / priceRounding) * priceRounding);
        }

        public static int TotalPrice(String startName, List<int> travellers, int travelDifference,
            List<Stop> allStops, List<Route> allRoutes, List<TicketType> allTicketTypes, double priceRounding)
        {
            double totalPrice = 0.0;

            var standardPrice = travelDifference *
                allRoutes.FirstOrDefault(r => r.Label.Equals(
                    allStops.Where(s => s.Name.Equals(startName)).Select(s => s.Route.Label))).PricePerMin;

            for (var i = 0; i < allTicketTypes.Count; i++)
            {
                totalPrice += standardPrice * Int32.Parse(travellers[i].ToString()) * allTicketTypes[i].PriceModifier;
            }

            return (int)(Math.Ceiling(totalPrice / priceRounding) * priceRounding);
        }

        // Turn time on 24 hour format to total minutes
        public static int TimeToMinutes(String clockTime)
        {
            var timeSplit = clockTime.Split(":"); // 10:30 => E0: 10, E1: 30
            var hours = Int32.Parse(timeSplit[0]);
            var minutes = Int32.Parse(timeSplit[1]);

            return hours * 60 + minutes; // 10 * 60 + 30
        }

        // Turn total minutes to time on 24 hour format
        public static String MinutesToTime(int totalMinutes)
        {
            var tempMinutes = totalMinutes % 60;
            String minutes;

            if (Enumerable.Range(0, 9).Contains(tempMinutes))
                minutes = "0" + tempMinutes; // 9 minutes => 09
            else
                minutes = tempMinutes.ToString();

            return totalMinutes / 60 + ":" + minutes;
        }

        // Hash incoming password a 1000 times using a salt
        public static byte[] Hash(String password, byte[] salt)
        {
            return KeyDerivation.Pbkdf2(
                password,
                salt,
                prf: KeyDerivationPrf.HMACSHA512,
                iterationCount: 1000,
                numBytesRequested: 32);
        }

        // Create a salt of byte array length 24
        public static byte[] Salt()
        {
            var salt = new byte[24];
            new RNGCryptoServiceProvider().GetBytes(salt);

            return salt;
        }
    }
}
