# Handleiding: praktijkgids Media for Empowerment

Deze handleiding is bedoeld voor wie de gids online zet of later aanpast. Je hoeft geen programmeur te zijn. Wel handig: een teksteditor die code kleurt, zoals Visual Studio Code (gratis). Word of Kladblok zijn niet geschikt.

## 1. Wat zit waar

```
m4emp-gids/
├── index.html                  alle pagina's van de gids
├── css/stijl.css               opmaak: kleuren, lettertypes, marges
├── js/gids.js                  werking: menu, voetnoten, terugknop
├── js/projectbouwer.js         bouwmodule "Mijn project"
├── img/
│   ├── logo-howest.png
│   ├── logo-quindo.png
│   ├── praktijken/             één beeld per praktijk
│   └── pictogrammen/           de pictogrammen (SVG)
├── downloads/                  formulier, gesprekskaart en rechtenkaart (PDF en Word)
├── hulpmiddelen/bundel.py      maakt er één los bestand van (zie punt 9)
├── hulpmiddelen/downloads-bron bronbestanden om de PDF's opnieuw te maken (zie punt 14)
└── HANDLEIDING.md              dit bestand
```

Tekst aanpassen doe je bijna altijd in `index.html`. De twee andere bestanden (`stijl.css` en `gids.js`) raak je enkel aan als je de opmaak of de werking wil veranderen.

## 2. De gids bekijken

Dubbelklik op `index.html`. De gids opent in je browser, ook zonder internet (alleen de lettertypes hebben internet nodig; zonder internet zie je een standaardlettertype).

## 3. De gids online zetten

Zet de volledige map `m4emp-gids` (met alles erin) op een webserver. `index.html` is de startpagina. Mogelijkheden:

- **Op de website van Quindo of Howest**, als een aparte map (bijvoorbeeld `quindo.be/praktijkgids/`). Vraag dit aan jullie webbouwer: het gaat om gewone bestanden, er is geen database of server-software nodig.
- **Gratis hosting** zoals Netlify (map slepen in het venster) of GitHub Pages.

Voor je publiceert: zie de controlelijst in punt 10.

## 4. Hoe een pagina in elkaar zit

Elke pagina is één blok in `index.html`:

```html
<article data-page="fase-4" data-title="Fase 4 Post-productie" hidden>
  ... inhoud ...
</article>
```

- `data-page` is het adres: deze pagina opent via `index.html#/fase-4`.
- `data-title` is de titel die in het browsertabblad en in verwijzingen verschijnt.
- `hidden` moet er staan (behalve bij de startpagina). Het script toont telkens de juiste pagina.

Zoek een pagina snel met Zoeken (Ctrl+F of Cmd+F) op `data-page="` plus het adres.

## 5. Tekst aanpassen

Zoek de zin en pas ze aan. Let er alleen op dat je de tekens tussen `<` en `>` laat staan. Zie je `<strong>`, `<a href="...">` of `<sup class="fn" ...></sup>`, laat die intact.

Enkele bouwstenen die je vaak tegenkomt:

**Een werkvorm** (rode lijn links):

```html
<section class="wv">
  <h3>Titel van de werkvorm</h3>
  <p>Wat het is.</p>
  <p class="cond"><strong>Werkt het best</strong> wanneer ...</p>
  <div class="grond"><span>Uit: <a href="#/praktijk/foscast">FOScast</a></span><span>Meer: <a href="#/waarom/duo">Twee begeleiders, twee rollen</a></span></div>
</section>
```

**Een tip of afweging** (wit kader):

```html
<div class="callout">
  <h3>Tip: titel</h3>
  <p>Tekst van de tip.</p>
</div>
```

**Een uitgelicht citaat** (enkel echte citaten van informanten):

```html
<figure class="quote"><blockquote>Het letterlijke citaat.</blockquote><figcaption>Wie het zei</figcaption></figure>
```

## 6. Links en voetnoten

**Link naar een andere pagina:** `<a href="#/praktijk/rupture">Rupture</a>`. Het adres is de `data-page` van die pagina, met `#/` ervoor.

**Link naar een plek binnen een pagina:** geef de titel een id die met `s-` begint, bijvoorbeeld `<h2 id="s-rechten">`, en link naar `#/ethiek/rechten`.

**Voetnoot:** zet in de tekst `<sup class="fn" data-ref="couldry2010"></sup>`. De tekst van de voetnoot komt automatisch uit de bronnenpagina, uit de regel `<li id="b-couldry2010">`. Voor een nieuwe bron voeg je dus eerst een regel toe op de bronnenpagina (in `<ul class="refs">`), met een id die begint met `b-`. Het nummer van de voetnoot wordt automatisch berekend.

De lijst "Pagina's die hiernaar verwijzen" onderaan elke pagina maakt het script zelf. Die hoef je niet bij te houden.

## 7. Een praktijk toevoegen

1. **Beeld:** zet een liggend of staand beeld (JPG, ongeveer 1000 pixels breed) in `img/praktijken/`, bijvoorbeeld `mijn-praktijk.jpg`.
2. **Pagina:** kopieer een bestaande praktijkpagina (van `<article data-page="praktijk/...` tot en met `</article>`), plak ze onder de laatste praktijk en pas het adres, de titel en de inhoud aan.
3. **Menu:** voeg onder `<h2><a href="#/praktijken">Praktijken</a></h2>` een regel toe: `<li><a href="#/praktijk/mijn-praktijk">Mijn praktijk</a></li>`.
4. **Overzichtspagina:** voeg op de pagina `praktijken` een ingang toe in `<div class="entries">`.
5. **Bron:** voeg op de bronnenpagina een regel toe onder "Negen praktijken" met `id="b-p-mijnpraktijk"`, en zet in de inleiding van de praktijkpagina `<sup class="fn" data-ref="p-mijnpraktijk"></sup>`.

Een werkvorm toevoegen aan een fase gaat op dezelfde manier: kopieer een bestaande `<section class="wv">` op de fasepagina en pas ze aan.

## 8. Pictogrammen en huisstijl

**Pictogram vervangen:** vervang het bestand in `img/pictogrammen/` door een nieuw SVG-bestand met exact dezelfde naam. De namen zijn `fase-1.svg` tot `fase-6.svg`, `waarom-zeggenschap.svg` enzovoort, en `media-for-empowerment.svg` voor de startpagina. De huidige pictogrammen zijn voorlopig.

**Kleuren en lettertypes:** bovenaan `css/stijl.css`, onder "1. Kleuren en lettertypes". Verander je daar het rood, dan verandert het overal. Voor de donkere modus staan de kleuren onder "11. Donkere modus".

## 9. Eén los bestand maken

Heb je één bestand nodig in plaats van een map (om te mailen, of voor een platform dat geen mappen aanvaardt)? Voer dan vanuit de map `m4emp-gids` uit:

```
python3 hulpmiddelen/bundel.py
```

Dat maakt `media-for-empowerment-gebundeld.html` (ongeveer 1 MB), met alle opmaak en beelden erin. Pas nooit dat bestand aan: pas de map aan en bundel opnieuw.

## 10. Controlelijst voor publicatie

- [ ] De regel `<meta name="robots" content="noindex, nofollow">` in de `<head>` van `index.html` verwijderd, zodat zoekmachines de gids vinden.
- [ ] De prototypebalk bovenaan verwijderd (het blok `<div class="proto" ...>` in `index.html`). De printknoppen verdwijnen dan mee; zet ze eventueel elders terug, of laat lezers printen via hun browser.
- [ ] Toestemming van de partners voor tekst, beelden en links per praktijk (zie het tabblad Partnercheck in het werkbestand van ronde 1).
- [ ] De voorlopige pictogrammen vervangen, of bewust behouden.
- [ ] De onvolledige bronvermeldingen aangevuld (zie het interne document met de bronverantwoording).
- [ ] Alle externe links nog eens aangeklikt.

## 11. Goed om te weten

- **Adressen met een #.** Elke pagina heeft een adres zoals `.../index.html#/fase-4`. Delen en bladwijzers werken, maar zoekmachines zien de hele gids als één pagina. Wil je dat pagina's afzonderlijk vindbaar zijn in Google, dan moet de gids later in een beheersysteem of een sitegenerator met gewone adressen.
- **Lettertypes.** De lettertypes worden van de servers van Google geladen. Sommige organisaties zetten die liever op hun eigen server, omdat de bezoeker daarbij contact maakt met Google. Vraag dat na bij jullie webbouwer of privacyverantwoordelijke; het aanpassen gebeurt in de `<head>` van `index.html` en in `stijl.css`.
- **Donkere modus.** De gids volgt automatisch de instelling van het toestel van de lezer.

## 12. De bouwmodule "Mijn project"

Lezers kunnen werkvormen, werkzame factoren en de drie rechten toevoegen aan een eigen project, met de knop "Voeg toe aan mijn project". Op de pagina "Mijn project" zien ze alles per fase, met de samenvatting van de fase, een denkvraag en ruimte voor notities. Ze kunnen hun project printen, downloaden als bestand, naar zichzelf mailen, kopiëren als tekst of delen via een link.

**Waar wordt het bewaard?** In de browser van de lezer zelf (localStorage). Er gaat niets naar een server, en jullie zien de projecten van lezers niet. Wie van computer of browser wisselt, neemt het project mee via de deellink of het gedownloade bestand. De deellink bevat het volledige project, ook de notities. De pagina waarschuwt lezers daarom om geen namen of persoonlijke gegevens van jongeren te noteren.

**Een werkvorm toevoegbaar maken.** Elke werkvorm op een fasepagina heeft een vaste naam, bijvoorbeeld:

```html
<section class="wv" data-wv="fase-2/storyboard-en-script">
```

Nieuwe werkvorm? Geef ze een nieuwe, unieke naam in dezelfde vorm (`fase-nummer/korte-naam`). De knop verschijnt dan vanzelf. Staat een werkvorm niet op een fasepagina (zoals op de pagina Toestemming als doorlopend proces), geef dan ook de fase mee, zodat ze in het project onder de juiste fase komt:

```html
<section class="wv" data-wv="toestemming/stopsignaal" data-fase="fase-3">
```

Dat geldt ook voor de blokken op de praktijkpagina's: concrete werkvormen hebben daar een knop, principes en uitkomsten niet. Hoort een werkvorm bij een werking die jaren doorloopt, gebruik dan `data-fase="doorlopend"`; ze komt dan in het project onder "Als je werking doorloopt".

Staat dezelfde werkvorm ook op een fasepagina, geef ze dan exact dezelfde naam als daar (en laat `data-fase` weg). Dan telt ze als één keuze: wie ze aanklikt op de ene pagina, ziet ze ook op de andere aangevinkt. Moet je ooit toch een naam veranderen, zet de oude naam dan in de lijst `ALIASSEN` bovenaan `js/projectbouwer.js`, zodat oude projecten blijven werken. Verander de naam van een bestaande werkvorm niet meer: opgeslagen projecten en deellinks verwijzen ernaar. De titel en de tekst mag je wel aanpassen.

**Denkvragen en startvragen aanpassen.** Bovenaan `js/projectbouwer.js` staan `DENKVRAGEN` (één per fase, overgenomen van de pagina Ethiek en toestemming) en `STARTVRAGEN` (de vragen bovenaan het project). Pas daar de tekst aan tussen de aanhalingstekens.

**In de gebundelde versie op claude.ai** werken toevoegen, invullen en bewaren. Downloaden, printen, mailen en kopiëren kunnen daar geblokkeerd zijn door de omgeving waarin de pagina getoond wordt. Op een gewone website werken ze wel.

## 13. De gids op GitHub Pages zetten en bijwerken

**Eerste keer**
1. Maak een account op github.com.
2. Kies **New repository**. Geef het een naam (bijvoorbeeld `m4emp-praktijkgids`) en kies **Public** (GitHub Pages is gratis enkel voor publieke repositories).
3. Klik op **uploading an existing file** en sleep de inhoud van de map `m4emp-gids` in het venster (dus `index.html`, `css`, `js`, `img`, ... en niet de map zelf). Klik op **Commit changes**.
4. Controleer of het bestand `.nojekyll` mee is. Zie je het niet, maak het dan aan via **Add file > Create new file**, met als naam `.nojekyll` en zonder inhoud. (Op een Mac zijn bestanden die met een punt beginnen verborgen en worden ze soms niet mee gesleept.)
5. Ga naar **Settings > Pages**. Kies bij **Source** voor **Deploy from a branch**, bij **Branch** voor `main` en `/ (root)`, en klik op **Save**.
6. Na een à twee minuten staat de gids op `https://JOUWGEBRUIKERSNAAM.github.io/m4emp-praktijkgids/`. Het adres verschijnt bovenaan de pagina **Settings > Pages**.

**Iets aanpassen**
- Een tekst: open `index.html` op GitHub, klik op het potlood, pas aan en klik op **Commit changes**.
- Een beeld of meerdere bestanden: open de map op GitHub, kies **Add file > Upload files** en sleep de nieuwe versie erin. Een bestand met dezelfde naam wordt vervangen.
- Werk je vaak aan de gids, gebruik dan het gratis programma **GitHub Desktop**: je werkt in een map op je computer en stuurt de wijzigingen met één klik door.

Na elke wijziging staat de nieuwe versie binnen een paar minuten online. Zie je de oude versie nog, herlaad dan de pagina zonder cache (Ctrl+Shift+R, op een Mac Cmd+Shift+R).

**Een oude versie terugzetten** kan altijd: GitHub bewaart elke wijziging onder **History**.

## 14. De downloads aanpassen

Op de pagina Ethiek en toestemming staan drie hulpmiddelen om te downloaden. De bestanden staan in de map `downloads`:

- `sjabloon-toestemmingsformulier.docx` en `.pdf`
- `gesprekskaart-kernvragen.pdf`
- `drie-rechten-voor-jongeren.pdf`

**Het Word-sjabloon** pas je gewoon aan in Word en bewaar je opnieuw onder dezelfde naam. Maak daarna ook een nieuwe PDF (in Word: Bestand, Opslaan als, PDF), of maak de PDF opnieuw via het bronbestand hieronder.

**De PDF's opnieuw maken.** De map `hulpmiddelen/downloads-bron` bevat per download een HTML-bestand met de tekst en de opmaak, en de lettertypes in `fonts`. Pas de tekst aan in het HTML-bestand, open het in Chrome of Edge en kies **Afdrukken**, dan **Opslaan als PDF**, met papier **A4**, marges **Geen** en **Achtergrondafbeeldingen** aangevinkt. Bewaar de PDF in de map `downloads` onder dezelfde naam.

**Een nieuwe download toevoegen.** Zet het bestand in `downloads` en maak een link zoals:

```html
<a class="download" href="downloads/mijn-bestand.pdf" download>Mijn bestand (PDF, 120 kB)</a>
```

Het bundelscript neemt alle bestanden uit `downloads` automatisch mee in de gebundelde versie.

De lettertypes Archivo en Figtree vallen onder de SIL Open Font License en mogen mee verspreid worden.
