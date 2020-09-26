using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualBasic;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Prosjekt_Oppgave_NOR_WAY_Bussekspress.DAL
{
    public class DBInit
    {
        public static void Initialize(IApplicationBuilder app)
        {
            // Get the database and ensure a refresh of the datafields
            var context = app.ApplicationServices.CreateScope().ServiceProvider.GetService<Context>();
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            // Create and add the TicketTypes
            TicketType[] ticketTypes =
            {
                new TicketType { Name = "Voksen",       PriceModifier = 1.00 },
                new TicketType { Name = "Barn",         PriceModifier = 0.50 },
                new TicketType { Name = "Småbarn",      PriceModifier = 0.00 },
                new TicketType { Name = "Student",      PriceModifier = 0.75 },
                new TicketType { Name = "Honnør",       PriceModifier = 0.75 },
                new TicketType { Name = "Vernepliktig", PriceModifier = 0.10 },
                new TicketType { Name = "Ledsager",     PriceModifier = 0.50 }
            };

            context.TicketTypes.AddRange(ticketTypes);

            // Create and add the Locations
            List<Stop> stops = new List<Stop>();
            
            try
            {
                int baselineTimeInMinutes = 0;
                String[] linesFromStopsFile = System.IO.File.ReadAllLines(@"./DAL/Data/NW180_Stops_Oslo_Aamot");
                // Example - Element 0: "10:30\tOslo Bussterminal"

                for (int i = 0; i < linesFromStopsFile.Length; i++)
                {
                    String[] lineValues = linesFromStopsFile[i].Split("\t"); // Example - Element 0: "10:30", Element 1: "Oslo Bussterminal"
                    String[] timeValues = lineValues[0].Split(":"); // Example - Element 0: "10", Element 1: "30"

                    int timeInMinutes = Int32.Parse(timeValues[0]) * 60 + Int32.Parse(timeValues[1]);
                    if (i == 0) baselineTimeInMinutes = timeInMinutes;

                    stops.Add(
                        new Stop
                        {
                            Name = lineValues[1],
                            MinutesFromOslo = (timeInMinutes - baselineTimeInMinutes)
                        });
                }
            }
            catch
            {
                stops = new List<Stop>()
                {
                    new Stop { Name = "Oslo Bussterminal",      MinutesFromOslo = 0 },
                    new Stop { Name = "Lysaker stasjon",        MinutesFromOslo = 15 },
                    new Stop { Name = "Hagaløkka",              MinutesFromOslo = 30 },
                    new Stop { Name = "Drammen Bangeløkka",     MinutesFromOslo = 45 },
                    new Stop { Name = "Hokksund Langebru",      MinutesFromOslo = 65 },
                    new Stop { Name = "Kongsberg Diseplass",    MinutesFromOslo = 78 },
                    new Stop { Name = "Korbu",                  MinutesFromOslo = 93 },
                    new Stop { Name = "Elgsjø",                 MinutesFromOslo = 106 },
                    new Stop { Name = "Notodden Skysstasjon",   MinutesFromOslo = 120 },
                    new Stop { Name = "Ørvella E134",           MinutesFromOslo = 135 },
                    new Stop { Name = "Gvammen Knutepunkt",     MinutesFromOslo = 153 },
                    new Stop { Name = "Vallar",                 MinutesFromOslo = 164 },
                    new Stop { Name = "Seljord Rutebilstasjon", MinutesFromOslo = 175 },
                    new Stop { Name = "Høydalsmo E134",         MinutesFromOslo = 200 },
                    new Stop { Name = "Rogdeli",                MinutesFromOslo = 210 },
                    new Stop { Name = "Åmot",                   MinutesFromOslo = 225 }
                };
            }

            //Create and add Routes
            List<Route> routes = new List<Route>()
            {
                new Route { Stops = stops, PricePerKM = 2.5 }
            };

            //Create and add RouteTables
            RouteTable[] routeTables =
            {
                new RouteTable { Route = routes[0], StartTime = "10:30", EndTime = "14:15" },
                new RouteTable { Route = routes[0], StartTime = "13:55", EndTime = "17:45" },
                new RouteTable { Route = routes[0], StartTime = "16:15", EndTime = "20:00" }
            };

            context.RouteTables.AddRange(routeTables);

            //Create and add Tickets for testing purposes
            Ticket ticket = new Ticket
            {
                RouteTable = routeTables[0],
                NumberOfTicketTypes = "Voksen - 1",
                NumberOfPassengers = 1,
                TotalPrice = 540,
                Email = "email@address.com",
                PhoneNumber = "12345678"
            };

            context.Tickets.Add(ticket);

            // Save the update fields to the database
            context.SaveChanges();
            context.Dispose();
        }
    }
}
