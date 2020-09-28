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
                new TicketType 
                { 
                    Label = "Voksen", 
                    Clarification = "Fra 18 år", 
                    PriceModifier = 1.00 
                },
                new TicketType 
                { 
                    Label = "Barn", 
                    Clarification = "6 - 7 år", 
                    PriceModifier = 0.50 
                },
                new TicketType 
                { 
                    Label = "Småbarn", 
                    Clarification = "0 - 5 år", 
                    PriceModifier = 0.00 
                },
                new TicketType 
                { 
                    Label = "Student", 
                    Clarification = "Elev eller student, 18 - 30 år med gyldig skolebevis/studentbevis", 
                    PriceModifier = 0.75 
                },
                new TicketType 
                { 
                    Label = "Honnør", 
                    Clarification = "Fra fylte 67 år og personer med uførebevis fra NAV.", 
                    PriceModifier = 0.75 
                },
                new TicketType 
                { 
                    Label = "Vernepliktig", 
                    Clarification = "Avtjener førstegangstjeneste og kan fremvise forsvarets ID-kort for vernepliktige eller innkallingsbrev til førstegangstjeneste.", 
                    PriceModifier = 0.10 
                },
                new TicketType 
                { 
                    Label = "Ledsager", 
                    Clarification = "Person som ledsager en innehaver av kommunalt ledsagerbevis.", 
                    PriceModifier = 0.50 
                }
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
                            Id = i + 1,
                            Name = lineValues[1],
                            MinutesFromOslo = (timeInMinutes - baselineTimeInMinutes)
                        });
                }
            }
            catch
            {
                int id = 1;
                stops = new List<Stop>()
                {
                    new Stop { Id = id++, Name = "Oslo Bussterminal",      MinutesFromOslo = 0 },
                    new Stop { Id = id++, Name = "Lysaker stasjon",        MinutesFromOslo = 15 },
                    new Stop { Id = id++, Name = "Hagaløkka",              MinutesFromOslo = 30 },
                    new Stop { Id = id++, Name = "Drammen Bangeløkka",     MinutesFromOslo = 45 },
                    new Stop { Id = id++, Name = "Hokksund Langebru",      MinutesFromOslo = 65 },
                    new Stop { Id = id++, Name = "Kongsberg Diseplass",    MinutesFromOslo = 78 },
                    new Stop { Id = id++, Name = "Korbu",                  MinutesFromOslo = 93 },
                    new Stop { Id = id++, Name = "Elgsjø",                 MinutesFromOslo = 106 },
                    new Stop { Id = id++, Name = "Notodden Skysstasjon",   MinutesFromOslo = 120 },
                    new Stop { Id = id++, Name = "Ørvella E134",           MinutesFromOslo = 135 },
                    new Stop { Id = id++, Name = "Gvammen Knutepunkt",     MinutesFromOslo = 153 },
                    new Stop { Id = id++, Name = "Vallar",                 MinutesFromOslo = 164 },
                    new Stop { Id = id++, Name = "Seljord Rutebilstasjon", MinutesFromOslo = 175 },
                    new Stop { Id = id++, Name = "Høydalsmo E134",         MinutesFromOslo = 200 },
                    new Stop { Id = id++, Name = "Rogdeli",                MinutesFromOslo = 210 },
                    new Stop { Id = id++, Name = "Åmot",                   MinutesFromOslo = 225 }
                };
            }

            //Create and add Routes
            List<Route> routes = new List<Route>()
            {
                new Route { Label = "NW180", PricePerKM = 2.5, Stops = stops }
            };

            //Create and add RouteTables
            RouteTable[] routeTables =
            {
                new RouteTable { Label = routes[0].Label + " - Westwards - Morning",    Route = routes[0], StartTime = "10:30", EndTime = "14:15" },
                new RouteTable { Label = routes[0].Label + " - Westwards - Day",        Route = routes[0], StartTime = "13:55", EndTime = "17:45" },
                new RouteTable { Label = routes[0].Label + " - Westwards - Evening",    Route = routes[0], StartTime = "16:15", EndTime = "20:00" }
            };

            context.RouteTables.AddRange(routeTables);

            //Create and add Tickets for testing purposes
            Ticket ticket = new Ticket
            {
                RouteTable = routeTables[0],
                PassengerCombinations = new List<PassengerCombination> 
                { 
                    new PassengerCombination { TicketType = ticketTypes[0], NumberOfPassengers = 2 },
                    new PassengerCombination { TicketType = ticketTypes[1], NumberOfPassengers = 3 } 
                },
                TotalPrice = 540*2 + 270*3,
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
