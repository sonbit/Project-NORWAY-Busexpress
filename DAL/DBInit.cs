using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualBasic;
using Prosjekt_Oppgave_NOR_WAY_Bussekspress.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
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

            // Create and add default PassengerComposition
            context.TicketTypeCompositions.Add(
                new TicketTypeComposition
                {
                    TicketType = ticketTypes[0],
                    NumberOfPassengers = 1
                });

            // Create and add the Locations
            List<Stop> stops = new List<Stop>();
            String midwayStop = "";
            
            try
            {
                int baselineTimeInMinutes = 0;
                String[] linesFromStopsFile = System.IO.File.ReadAllLines(@"./DAL/ExternalData/NW180_Stops_Oslo_Aamot");
                // Example - Element 0: "10:30\tOslo Bussterminal"

                for (int i = 0; i < linesFromStopsFile.Length; i++)
                {
                    String[] lineValues = linesFromStopsFile[i].Split("\t"); // Example - Element 0: "10:30", Element 1: "Oslo Bussterminal"
                    
                    if (i > 0) { 
                        String[] timeValues = lineValues[0].Split(":"); // Example - Element 0: "10", Element 1: "30"

                        int timeInMinutes = Int32.Parse(timeValues[0]) * 60 + Int32.Parse(timeValues[1]);
                        if (i == 1) baselineTimeInMinutes = timeInMinutes;

                        stops.Add(
                            new Stop
                            {
                                Id = i + 1,
                                Name = lineValues[1],
                                MinutesFromHub = (timeInMinutes - baselineTimeInMinutes)
                            });
                    } 
                    else if (i == 0)
                    {
                        midwayStop = lineValues[1];
                    }
                }
            }
            catch
            {
                int stopId = 1;
                stops = new List<Stop>()
                {
                    new Stop { Id = stopId++, Name = "Oslo Bussterminal",      MinutesFromHub = 0 },
                    new Stop { Id = stopId++, Name = "Lysaker stasjon",        MinutesFromHub = 15 },
                    new Stop { Id = stopId++, Name = "Hagaløkka",              MinutesFromHub = 30 },
                    new Stop { Id = stopId++, Name = "Drammen Bangeløkka",     MinutesFromHub = 45 },
                    new Stop { Id = stopId++, Name = "Hokksund Langebru",      MinutesFromHub = 65 },
                    new Stop { Id = stopId++, Name = "Kongsberg Diseplass",    MinutesFromHub = 78 },
                    new Stop { Id = stopId++, Name = "Korbu",                  MinutesFromHub = 93 },
                    new Stop { Id = stopId++, Name = "Elgsjø",                 MinutesFromHub = 106 },
                    new Stop { Id = stopId++, Name = "Notodden Skysstasjon",   MinutesFromHub = 120 },
                    new Stop { Id = stopId++, Name = "Ørvella E134",           MinutesFromHub = 135 },
                    new Stop { Id = stopId++, Name = "Gvammen Knutepunkt",     MinutesFromHub = 153 },
                    new Stop { Id = stopId++, Name = "Vallar",                 MinutesFromHub = 164 },
                    new Stop { Id = stopId++, Name = "Seljord Rutebilstasjon", MinutesFromHub = 175 },
                    new Stop { Id = stopId++, Name = "Høydalsmo E134",         MinutesFromHub = 200 },
                    new Stop { Id = stopId++, Name = "Rogdeli",                MinutesFromHub = 210 },
                    new Stop { Id = stopId++, Name = "Åmot Vinje Kro",         MinutesFromHub = 225 }
                };
                midwayStop = stops[stops.Count - 1].Name;
            }

            //Create and add Routes
            List<Route> routes = new List<Route>()
            {
                new Route { Label = "NW180 Haukeliekspressen", PricePerMin = 2.0, Stops = stops, MidwayStop = midwayStop}
            };

            //Create and add RouteTables (EndTime is not strictly necessary as the time is calculated based on StartTime + Stop.MinutesFromOslo)
            int routeTableId = 1;
            RouteTable[] routeTables =
            {
                new RouteTable { Id = routeTableId++, Route = routes[0], FromHub = true, FullLength = true,  StartTime = "10:30", EndTime = "19:00" },
                new RouteTable { Id = routeTableId++, Route = routes[0], FromHub = true, FullLength = true,  StartTime = "13:55", EndTime = "22:25" },
                new RouteTable { Id = routeTableId++, Route = routes[0], FromHub = true, FullLength = false, StartTime = "16:15", EndTime = "20:00" },

                new RouteTable { Id = routeTableId++, Route = routes[0], FromHub = false, FullLength = false, StartTime = "7:25",  EndTime = "11:10" },
                new RouteTable { Id = routeTableId++, Route = routes[0], FromHub = false, FullLength = true,  StartTime = "10:15", EndTime = "18:45" },
                new RouteTable { Id = routeTableId++, Route = routes[0], FromHub = false, FullLength = true,  StartTime = "13:10", EndTime = "21:40" }
            };

            context.RouteTables.AddRange(routeTables);

            // Create and add Tickets for testing purposes
            List<Ticket> tickets = new List<Ticket>()
            {
                new Ticket
                {
                    Date = "Fredag 1. Okt 2020",
                    Start = "10:30 Oslo bussterminal",
                    End = "14:15 Åmot Vinje Kro",
                    TravelTime = 225,
                    Route = routes[0],
                    TicketTypeCompositions = new List<TicketTypeComposition>
                    {
                        new TicketTypeComposition { TicketType = ticketTypes[0], NumberOfPassengers = 2 },
                        new TicketTypeComposition { TicketType = ticketTypes[1], NumberOfPassengers = 3 }
                    },
                    TotalPrice = 540 * 2 + 270 * 3,
                    Email = "email@address.com",
                    PhoneNumber = "12345678"
                },

                new Ticket
                {
                    Date = "Fredag 1. Okt 2020",
                    Start = "10:30 Oslo bussterminal",
                    End = "11:15 Drammen Bangeløkka",
                    TravelTime = 45,
                    Route = routes[0],
                    TicketTypeCompositions = new List<TicketTypeComposition>
                    {
                        new TicketTypeComposition { TicketType = ticketTypes[0], NumberOfPassengers = 1 },
                        new TicketTypeComposition { TicketType = ticketTypes[1], NumberOfPassengers = 2 }
                    },
                    TotalPrice = 540 * 1 + 270 * 2,
                    Email = "email@address.com",
                    PhoneNumber = "12345678"
                }
            };

            context.Tickets.AddRange(tickets);

            // Save the update fields to the database
            context.SaveChanges();
            context.Dispose();
        }
    }
}
