using Microsoft.AspNetCore.Routing;
using Project_NORWAY_Busexpress.Helpers;
using Project_NORWAY_Busexpress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace Project_NORWAY_Busexpress.DAL
{
    // Class to store Database data statically, for later access without querying DB and reading from disk
    // However, this solution will require more memory usage
    // An alternative is to set a timeout for the cache: https://stackoverflow.com/questions/40597911/pattern-for-caching-data-in-asp-net-core-ef-core
    public class DataHandler
    {
        private readonly IRepository _db;
        private const double PriceRounding = 5.0;

        private static List<Stop> allStops;
        private static List<TicketType> allTicketTypes;
        private static List<TicketTypeComposition> allPassengerCompositions;

        private static List<Models.Route> allRoutes;
        private static List<RouteTable> allRouteTables;

        //private static List<Ticket> allTickets;

        public DataHandler(IRepository db)
        {
            _db = db;
        }

        private async Task GetStops()
        {
            allStops = await _db.GetStops();
        }

        private async Task GetTickeTypes()
        {
            allTicketTypes = await _db.GetTicketTypes();
        }

        private async Task GetPassengerCompositions()
        {
            allPassengerCompositions = await _db.GetPassengerCompositions();
        }

        public async Task<Response> CreateInitialResponse()
        {
            await GetStops();
            await GetTickeTypes();
            await GetPassengerCompositions();

            return new Response(allStops, allTicketTypes, allPassengerCompositions);
        }

        public async Task GetRoutes()
        {
            allRoutes = await _db.GetRoutes();
        }

        public async Task GetRouteTables()
        {
            allRouteTables = await _db.GetRouteTables();
        }

        public async Task<Response> CreateTravelAlternatives(TravelData travelData)
        {
            await GetRoutes();
            await GetRouteTables();

            Console.WriteLine(allRoutes[0].MidwayStop);

            var travelTimeStamps = CalculateTravelTimeStamps(travelData);
            var travelTime = CalculateTravelTime(travelData);
            var totalPrice = CalculateTotalPrice(travelData, travelTime);
            var routeLabel = GetRouteLabel(travelData);

            return new Response(travelTimeStamps, travelTime, totalPrice, routeLabel);
        }

        private int CalculateTravelTime(TravelData travelData)
        {
            return Calculate.TravelTime(travelData.TravelFrom, travelData.TravelTo, allStops);
        }

        private int CalculateTotalPrice(TravelData travelData, int travelTime)
        {
            return Calculate.TotalPrice(
                travelData.TravelFrom, travelData.Travellers, travelTime,
                allStops, allTicketTypes, PriceRounding);
        }

        private List<String> CalculateTravelTimeStamps(TravelData travelData)
        {
            return Calculate.TravelTimeStamps(travelData.TravelFrom, travelData.TravelTo, allStops, allRouteTables);
        }

        private String GetRouteLabel(TravelData travelData)
        {
            return allStops.Find(s => s.Name == travelData.TravelFrom).Route.Label;
        }

        public async Task<List<Response>> CreateTicketResponse(String email)
        {
            List<Ticket> tickets = await _db.GetTickets(email);

            if (tickets.Count == 0) return null; // Above call may return an empty list, i.e. no ticket has this email address

            List<Response> response = new List<Response>();

            for (var i = 0; i < tickets.Count; i++)
            {
                response.Add(
                    new Response(
                        tickets[i].Date, tickets[i].Start, tickets[i].End, tickets[i].TravelTime, 
                        tickets[i].Route.Label, tickets[i].TotalPrice, tickets[i].TicketTypeCompositions,
                        tickets[i].Email, tickets[i].PhoneNumber));
            }

            return response;
        }

        public List<Stop> GetAllStops()
        {
            return allStops;
        }

        public List<TicketType> GetAllTicketTypes()
        {
            return allTicketTypes;
        }

        public double GetPriceRounding()
        {
            return PriceRounding;
        }
    } 
}
