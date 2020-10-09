using Microsoft.AspNetCore.Routing;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Helpers;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.DAL
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

            return new Response(travelTimeStamps, Calculate.MinutesToTime(travelTime), totalPrice);
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
    } 
}
