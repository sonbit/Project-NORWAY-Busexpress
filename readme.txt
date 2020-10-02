OBS - Et par ting å nevne angående besvarelsen
1. Oppgaven trenger justeringer for å håndtere reise som går over flere ruter, f.eks. fra Kongsberg -> Skien
2. Oppgaven trenger justeringer i forhold til reisetid. Tid i minutt fra Oslo er lagret i DB, og
dette brukes for å regne ut pris for billett, reisetid (differanse), samt for å justere start og slutt klokkeslett.
I realiteten er det litt variasjon på reisetid avhengig av når på døgnet du drar, men for å oppnå det mååte
jeg ha lagret klokkeslett for hver tid bussen er på en stopp i løpet av et døgn. 

Punktene over mener jeg dog er litt utenfor scopet for oppgaven, ihvertfall mindre viktig. 

////////////////////////////////////////////////////////////////////////////////////////

#1
For å lage dynamisk dropdown meny ved valg av start- og stoppested:
https://www.w3schools.com/howto/howto_js_autocomplete.asp
Javascript koden er stort sett kopiert i sin helhet, dog med endringer for å tilpasse til min løsning. 
Jeg har gått gjennom koden og forstår hvert steg. 
HTML og CSS koden er kopiert med noen få justeringer.

////////////////////////////////////////////////////////////////////////////////////////

#2 - Ikke i bruk akkurat nå, var evt. for avkryss for tur/retur og avkryss for rabattkode
For å lage custom checkbox (Avhuke for returbillett / rabattkode):
https://www.w3schools.com/howto/howto_css_custom_checkbox.asp
HTML og CSS koden er stort sett fullstendig kopiert, med noen få justeringer. 
Lite som ellers kan gjøres for å gjøre den mer egen. 

////////////////////////////////////////////////////////////////////////////////////////

#3
For å flytte på DatePicker(iQuery UI)
https://stackoverflow.com/questions/38399337/force-jquery-ui-datepicker-to-display-below-input-field/38400628

////////////////////////////////////////////////////////////////////////////////////////

#4
For å hente alle indexer fra en tabell som alle har en gitt, lik verdi
https://stackoverflow.com/questions/20798477/how-to-find-index-of-all-occurrences-of-element-in-array

////////////////////////////////////////////////////////////////////////////////////////

#5
For å finne differansen som scrollbar utgjør. Dette fordi resizeListener tar utgangspunkt i når bootstraps klasser er satt opp til å endre seg responsivt,
og denne verdien er annerledes i dokumenter som ikke har scrollbar
https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript