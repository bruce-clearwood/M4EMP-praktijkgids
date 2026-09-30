/* =========================================================================
   Media for Empowerment, praktijkgids
   Bouwmodule "Mijn project".

   Wat dit onderdeel doet
   1. Zet een knop "Voeg toe aan mijn project" bij elke werkvorm
      (elk blok met data-wv="..."), bij elke werkzame factor en bij de
      drie rechten.
   2. Bewaart de keuzes en notities in de browser van de lezer
      (localStorage). Er gaat niets naar een server.
   3. Toont op de pagina "Mijn project" een overzicht per fase:
      samenvatting van de fase, gekozen werkvormen, een denkvraag en
      ruimte voor notities.
   4. Laat het project printen, downloaden, mailen, kopiëren of delen via
      een link (het volledige project zit dan in de link zelf).

   Werkvormen toevoegen aan de bouwmodule: geef het blok in index.html een
   vaste naam, bijvoorbeeld <section class="wv" data-wv="fase-2/mijn-werkvorm">.
   Staat de werkvorm niet op een fasepagina, geef dan ook de fase mee:
   <section class="wv" data-wv="toestemming/mijn-werkvorm" data-fase="fase-4">.
   Hoort ze bij een werking die jaren doorloopt, gebruik dan data-fase="doorlopend".
   Staat dezelfde werkvorm ook op een fasepagina, gebruik dan gewoon dezelfde
   naam als daar (zonder data-fase): dan telt ze als één keuze.
   Verander een naam later niet: opgeslagen projecten verwijzen ernaar. Moet het
   toch, zet de oude naam dan in ALIASSEN.
   ========================================================================= */

(function () {
  'use strict';

  var OPSLAG = 'm4emp-mijn-project';

  var FASEN = ['Voorbereiding', 'Pre-productie', 'Productie', 'Post-productie', 'Toonmoment', 'Nazorg'];

  // Denkvraag per fase, overgenomen van de pagina Ethiek en toestemming.
  var DENKVRAGEN = {
    'fase-1': 'Kan een jongere nee zeggen tegen het project zonder nee te zeggen tegen de persoon die het vraagt?',
    'fase-2': 'Wat wil onze organisatie hiermee, en zeggen we dat aan de jongeren in dezelfde woorden als aan de subsidiegever?',
    'fase-3': 'Wie is op welk moment waarvoor verantwoordelijk, en weten de jongeren dat?',
    'fase-4': 'Wat betekent "jij beslist" concreet: over je eigen fragmenten, over de volgorde, over het geheel?',
    'fase-5': 'Wat gebeurt er de week na het toonmoment, en wie is er dan?',
    'fase-6': 'Wanneer is het traject voor de jongeren klaar?'
  };

  // Vragen bovenaan het project.
  var STARTVRAGEN = [
    { veld: 'naam', label: 'Naam van je project', lang: false },
    { veld: 'wat', label: 'Wat wil je maken? (podcast, radio, film, ...)', lang: false },
    { veld: 'wie', label: 'Met welke jongeren, en in welke setting?', lang: true },
    { veld: 'waarom', label: 'Waarom wil je dit project doen, en wat willen de jongeren ermee?', lang: true }
  ];

  // Oude namen die intussen gekoppeld zijn aan een werkvorm op een fasepagina.
  // Zo blijven projecten en deellinks van vroeger werken. Voeg hier een regel toe
  // als je ooit de naam (data-wv) van een werkvorm moet veranderen.
  var ALIASSEN = {
    "toestemming/duidelijke-afspraken-voor-elk-interview": "fase-2/voorgesprek-met-een-duidelijke-afspraak",
    "toestemming/praten-over-publiceren": "fase-2/praten-over-publiceren",
    "toestemming/zichtbaarheid-per-moment-kiezen": "fase-3/zelf-kiezen-wat-zichtbaar-is",
    "toestemming/eigen-versie-met-een-vraag": "fase-4/eigen-versie-terugsturen",
    "toestemming/testvisie-met-beslissingsrecht": "fase-4/testvisie-met-beslissingsrecht",
    "toestemming/ruwe-montage-met-twee-vragen": "fase-4/ruwe-montage-tonen-met-twee-vragen",
    "toestemming/laatste-check": "fase-4/laatste-check-met-hernieuwde-toestemming",
    "toestemming/stap-voor-stap-opschalen": "fase-5/stap-voor-stap-opschalen-met-toestemming-per-sta",
    "toestemming/de-maker-deelt-zelf": "fase-5/jongeren-delen-zelf",
    "toestemming/afspraken-per-jongere-na-de-evaluatie": "fase-6/samen-evalueren-dan-afspraken-per-jongere",
    "toestemming/het-ruwe-materiaal-is-opvraagbaar": "fase-6/het-ruwe-materiaal-is-van-de-maker"
  };

  function zonderAliassen(keuzes) {
    var uit = [];
    keuzes.forEach(function (id) {
      var echt = ALIASSEN[id] || id;
      if (uit.indexOf(echt) < 0) uit.push(echt);
    });
    return uit;
  }

  /* ---------------------------------------------------------------------
     Opslag
     --------------------------------------------------------------------- */
  function leeg() { return { naam: '', wat: '', wie: '', waarom: '', keuzes: [], notities: {} }; }

  function lees() {
    try {
      var ruw = localStorage.getItem(OPSLAG);
      if (!ruw) return leeg();
      var p = JSON.parse(ruw);
      var basis = leeg();
      Object.keys(basis).forEach(function (k) { if (p[k] === undefined) p[k] = basis[k]; });
      p.keuzes = zonderAliassen(p.keuzes);
      return p;
    } catch (e) { return leeg(); }
  }
  function bewaar() {
    try { localStorage.setItem(OPSLAG, JSON.stringify(project)); } catch (e) { /* opslag niet beschikbaar */ }
  }

  var project = lees();
  var gedeeld = null; // een project dat via een link geopend werd

  /* ---------------------------------------------------------------------
     Catalogus: alles wat je kan toevoegen
     --------------------------------------------------------------------- */
  function tekst(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }

  var catalogus = {}; // id -> {id, groep, titel, tekst, voorwaarde, pagina}
  var TITELS = {};    // pagina -> titel, om de herkomst van een werkvorm te tonen
  document.querySelectorAll('article[data-page]').forEach(function (a) { TITELS[a.dataset.page] = a.dataset.title; });

  // Staat dezelfde werkvorm (zelfde data-wv) op meer pagina's, dan telt ze als één
  // keuze. Voor de tekst in het project geldt de versie op de fasepagina.
  document.querySelectorAll('[data-wv]').forEach(function (blok) {
    var id = blok.dataset.wv;
    var pagina = blok.closest('article').dataset.page;
    if (catalogus[id] && catalogus[id].pagina.indexOf('fase-') === 0) return;
    var p = blok.querySelector('p:not(.cond)');
    catalogus[id] = {
      id: id,
      // Groep: de fase uit data-fase, anders de fasepagina waarop het blok staat.
      groep: blok.dataset.fase || (id.indexOf('recht/') === 0 ? 'recht' : (pagina === 'fasen' ? 'doorlopend' : pagina)),
      titel: tekst(blok.querySelector('h3')),
      tekst: tekst(p),
      voorwaarde: tekst(blok.querySelector('.cond')),
      pagina: pagina
    };
  });

  document.querySelectorAll('article[data-page^="waarom/"]').forEach(function (art) {
    var id = 'factor/' + art.dataset.page.split('/')[1];
    catalogus[id] = {
      id: id, groep: 'factor', titel: art.dataset.title,
      tekst: tekst(art.querySelector('.lead')).replace(/\d+$/, ''),
      voorwaarde: '', pagina: art.dataset.page
    };
  });

  /* ---------------------------------------------------------------------
     Knoppen "Voeg toe aan mijn project"
     --------------------------------------------------------------------- */
  function maakKnop(id) {
    var knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'bouw';
    knop.dataset.bouw = id;
    knop.addEventListener('click', function () { wissel(id); });
    return knop;
  }

  document.querySelectorAll('[data-wv]').forEach(function (blok) {
    blok.appendChild(maakKnop(blok.dataset.wv));
  });
  document.querySelectorAll('article[data-page^="waarom/"]').forEach(function (art) {
    var lead = art.querySelector('.lead');
    var knop = maakKnop('factor/' + art.dataset.page.split('/')[1]);
    knop.classList.add('bouw-factor');
    lead.parentNode.insertBefore(knop, lead.nextSibling);
  });

  function gekozen(id) { return project.keuzes.indexOf(id) >= 0; }

  function wissel(id) {
    var i = project.keuzes.indexOf(id);
    if (i >= 0) project.keuzes.splice(i, 1); else project.keuzes.push(id);
    bewaar();
    werkKnoppenBij();
  }

  function werkKnoppenBij() {
    document.querySelectorAll('button[data-bouw]').forEach(function (k) {
      var aan = gekozen(k.dataset.bouw);
      k.classList.toggle('aan', aan);
      k.setAttribute('aria-pressed', aan ? 'true' : 'false');
      k.textContent = aan ? '\u2713 In mijn project' : '+ Voeg toe aan mijn project';
    });
    var n = project.keuzes.filter(function (id) { return catalogus[id]; }).length;
    document.querySelectorAll('[data-teller]').forEach(function (t) {
      t.textContent = n; t.hidden = n === 0;
    });
  }

  /* ---------------------------------------------------------------------
     Hulpfuncties
     --------------------------------------------------------------------- */
  function esc(t) {
    return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function kortVan(fase) {
    var art = document.querySelector('article[data-page="' + fase + '"]');
    return art ? [].map.call(art.querySelectorAll('.kort li'), tekst) : [];
  }
  function keuzesIn(p, groep) {
    return p.keuzes.map(function (id) { return catalogus[id]; })
      .filter(function (w) { return w && w.groep === groep; });
  }
  function beeld(pad) { return (window.GIDS_BEELDEN && window.GIDS_BEELDEN[pad]) || pad; }

  // Project omzetten naar tekst en terug (voor de deellink), veilig voor alle tekens.
  function naarCode(p) {
    var json = JSON.stringify({ n: p.naam, a: p.wat, w: p.wie, r: p.waarom, k: p.keuzes, t: p.notities });
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function vanCode(code) {
    try {
      var b = code.replace(/-/g, '+').replace(/_/g, '/');
      while (b.length % 4) b += '=';
      var d = JSON.parse(decodeURIComponent(escape(atob(b))));
      return { naam: d.n || '', wat: d.a || '', wie: d.w || '', waarom: d.r || '', keuzes: zonderAliassen(d.k || []), notities: d.t || {} };
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------------
     De pagina "Mijn project"
     --------------------------------------------------------------------- */
  var houder = document.getElementById('projectbouwer');

  function lijstWerkvormen(items, alleenLezen) {
    return '<ul class="pb-lijst">' + items.map(function (w) {
      // Staat de werkvorm op een andere pagina dan de fase zelf, toon dan waar ze vandaan komt.
      var thuis = w.groep === 'doorlopend' ? 'fasen' : w.groep;
      var herkomst = ((w.groep.indexOf('fase-') === 0 || w.groep === 'doorlopend') && w.pagina !== thuis && TITELS[w.pagina])
        ? '<span class="pb-herkomst">Uit: ' + esc(TITELS[w.pagina]) + '</span>' : '';
      return '<li><div class="pb-item"><strong><a href="#/' + esc(w.pagina) + '">' + esc(w.titel) + '</a></strong>' + herkomst +
        (w.tekst ? '<p>' + esc(w.tekst) + '</p>' : '') +
        (w.voorwaarde ? '<p class="cond">' + esc(w.voorwaarde) + '</p>' : '') + '</div>' +
        (alleenLezen ? '' : '<button type="button" class="pb-weg" data-weg="' + esc(w.id) + '">Verwijder</button>') + '</li>';
    }).join('') + '</ul>';
  }

  function toonProject() {
    if (!houder) return;
    var p = gedeeld || project;
    var ro = !!gedeeld;
    var html = '';

    if (ro) {
      html += '<div class="callout pb-gedeeld"><h3>Je bekijkt een gedeeld project</h3>' +
        '<p>Iemand deelde dit project met jou via een link. Wil je ermee verder werken, bewaar het dan als jouw project. Een project dat je al had, wordt dan vervangen.</p>' +
        '<p><button type="button" class="pb-knop" data-actie="bewaar-gedeeld">Bewaar als mijn project</button> ' +
        '<button type="button" class="pb-knop pb-licht" data-actie="sluit-gedeeld">Terug naar mijn eigen project</button></p></div>';
    } else if (!project.keuzes.length && !project.naam) {
      html += '<div class="callout"><h3>Zo begin je</h3><p>Vul hieronder de vragen in. Ga daarna naar <a href="#/fasen">de fasen</a> en de <a href="#/waarom">werkzame factoren</a>, en klik bij wat je wil gebruiken op "Voeg toe aan mijn project". Alles wordt bewaard in deze browser.</p></div>';
    }

    // Startvragen
    html += '<h2>Je project</h2><div class="pb-velden">';
    STARTVRAGEN.forEach(function (v) {
      var waarde = esc(p[v.veld]);
      var veld = v.lang
        ? '<textarea id="pb-' + v.veld + '" data-veld="' + v.veld + '" rows="3"' + (ro ? ' readonly' : '') + '>' + waarde + '</textarea>'
        : '<input id="pb-' + v.veld + '" data-veld="' + v.veld + '" type="text" value="' + waarde + '"' + (ro ? ' readonly' : '') + '>';
      html += '<label for="pb-' + v.veld + '">' + esc(v.label) + '</label>' + veld +
        '<div class="pb-print" data-print="' + v.veld + '">' + waarde + '</div>';
    });
    html += '</div>';

    // Werkzame factoren
    var factoren = keuzesIn(p, 'factor');
    html += '<h2>Werkzame factoren</h2>';
    html += factoren.length ? lijstWerkvormen(factoren, ro)
      : '<p class="pb-leeg">Nog geen factoren gekozen. Bekijk de <a href="#/waarom">werkzame factoren</a>.</p>';

    // Per fase
    FASEN.forEach(function (naam, i) {
      var fase = 'fase-' + (i + 1);
      var gekozenHier = keuzesIn(p, fase);
      html += '<section class="pb-fase"><h2><span class="ico ico-md"><img src="' + beeld('img/pictogrammen/' + fase + '.svg') + '" alt=""></span>' +
        '<a href="#/' + fase + '"><span class="nr">' + (i + 1) + '</span>' + esc(naam) + '</a></h2>';
      var kort = kortVan(fase);
      if (kort.length) html += '<div class="kort"><h3>In het kort</h3><ul>' + kort.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul></div>';
      html += '<h3>Jouw werkvormen</h3>';
      html += gekozenHier.length ? lijstWerkvormen(gekozenHier, ro)
        : '<p class="pb-leeg">Nog geen werkvormen gekozen. Bekijk de werkvormen bij <a href="#/' + fase + '">' + esc(naam) + '</a>.</p>';
      html += '<h3>Denkvraag</h3><p class="pb-vraag">' + esc(DENKVRAGEN[fase]) + '</p>';
      html += '<label for="pb-n-' + fase + '">Jouw notities bij deze fase</label>' +
        '<textarea id="pb-n-' + fase + '" data-notitie="' + fase + '" rows="4"' + (ro ? ' readonly' : '') + '>' + esc(p.notities[fase]) + '</textarea>' +
        '<div class="pb-print" data-print="n-' + fase + '">' + esc(p.notities[fase]) + '</div></section>';
    });

    // Doorlopend en afspraken
    var doorlopend = keuzesIn(p, 'doorlopend');
    if (doorlopend.length) html += '<h2>Als je werking doorloopt</h2>' + lijstWerkvormen(doorlopend, ro);
    var rechten = keuzesIn(p, 'recht');
    html += '<h2>Afspraken met de jongeren</h2>';
    html += rechten.length ? lijstWerkvormen(rechten, ro)
      : '<p class="pb-leeg">Nog geen afspraken gekozen. Bekijk de <a href="#/ethiek/rechten">drie rechten voor elke jongere</a>.</p>';

    // Acties
    html += '<div class="pb-acties"><h2>Bewaren en delen</h2>' +
      '<p>Je project wordt automatisch bewaard in deze browser. Op een andere computer of in een andere browser zie je het niet. Wil je het bewaren of delen, gebruik dan een van deze knoppen.</p>' +
      '<p><strong>Let op:</strong> wie de deellink krijgt, kan alles lezen, ook je notities. Schrijf daarom geen namen of persoonlijke gegevens van jongeren in je project.</p>' +
      '<p class="pb-knoppen">' +
      '<button type="button" class="pb-knop" data-actie="print">Print of bewaar als PDF</button>' +
      '<button type="button" class="pb-knop" data-actie="download">Download</button>' +
      '<button type="button" class="pb-knop" data-actie="mail">Mail naar mezelf</button>' +
      '<button type="button" class="pb-knop" data-actie="kopieer">Kopieer als tekst</button>' +
      '<button type="button" class="pb-knop" data-actie="link">Kopieer deellink</button>' +
      (ro ? '' : '<button type="button" class="pb-knop pb-licht" data-actie="wis">Begin opnieuw</button>') +
      '</p><p class="pb-melding" role="status" aria-live="polite"></p></div>';

    houder.innerHTML = html;
  }

  function melding(t) {
    var m = houder.querySelector('.pb-melding');
    if (m) m.textContent = t;
  }

  // Invullen: bewaren bij elke toetsaanslag.
  if (houder) {
    houder.addEventListener('input', function (e) {
      if (gedeeld) return;
      var el = e.target;
      if (el.dataset.veld) project[el.dataset.veld] = el.value;
      if (el.dataset.notitie) project.notities[el.dataset.notitie] = el.value;
      var pr = houder.querySelector('[data-print="' + (el.dataset.veld || 'n-' + el.dataset.notitie) + '"]');
      if (pr) pr.textContent = el.value;
      bewaar();
    });

    houder.addEventListener('click', function (e) {
      var weg = e.target.closest('[data-weg]');
      if (weg) { wissel(weg.dataset.weg); toonProject(); return; }
      var knop = e.target.closest('[data-actie]');
      if (!knop) return;
      var actie = knop.dataset.actie;
      if (actie === 'print') window.print();
      if (actie === 'download') download();
      if (actie === 'mail') mail();
      if (actie === 'kopieer') kopieer(alsTekst(gedeeld || project), 'Je project is gekopieerd als tekst.');
      if (actie === 'link') kopieer(deellink(gedeeld || project), 'De deellink is gekopieerd. Wie de link opent, ziet je project.');
      if (actie === 'wis') {
        if (knop.dataset.zeker) {
          project = leeg(); bewaar(); werkKnoppenBij(); toonProject();
        } else {
          knop.dataset.zeker = '1';
          knop.textContent = 'Klik nog eens om alles te wissen';
        }
      }
      if (actie === 'bewaar-gedeeld') { project = gedeeld; gedeeld = null; bewaar(); werkKnoppenBij(); location.hash = '#/project'; }
      if (actie === 'sluit-gedeeld') { gedeeld = null; location.hash = '#/project'; }
    });
  }

  /* ---------------------------------------------------------------------
     Exporteren
     --------------------------------------------------------------------- */
  function alsTekst(p) {
    var r = [];
    r.push('MIJN MEDIAPROJECT' + (p.naam ? ': ' + p.naam : ''));
    r.push('Gemaakt met de praktijkgids Media for Empowerment (Howest en Quindo)');
    r.push('');
    STARTVRAGEN.forEach(function (v) { if (v.veld !== 'naam' && p[v.veld]) r.push(v.label + '\n' + p[v.veld] + '\n'); });
    var f = keuzesIn(p, 'factor');
    if (f.length) { r.push('WERKZAME FACTOREN'); f.forEach(function (w) { r.push('- ' + w.titel); }); r.push(''); }
    FASEN.forEach(function (naam, i) {
      var fase = 'fase-' + (i + 1);
      r.push((i + 1) + '. ' + naam.toUpperCase());
      kortVan(fase).forEach(function (k) { r.push('  In het kort: ' + k); });
      keuzesIn(p, fase).forEach(function (w) { r.push('- ' + w.titel + (w.tekst ? ': ' + w.tekst : '')); });
      if (p.notities[fase]) r.push('  Notities: ' + p.notities[fase]);
      r.push('');
    });
    var d = keuzesIn(p, 'doorlopend');
    if (d.length) { r.push('ALS JE WERKING DOORLOOPT'); d.forEach(function (w) { r.push('- ' + w.titel); }); r.push(''); }
    var a = keuzesIn(p, 'recht');
    if (a.length) { r.push('AFSPRAKEN MET DE JONGEREN'); a.forEach(function (w) { r.push('- ' + w.titel + ': ' + w.tekst); }); r.push(''); }
    return r.join('\n');
  }

  function deellink(p) {
    return location.href.split('#')[0] + '#/project?p=' + naarCode(p);
  }

  function kopieer(t, ok) {
    function reserve() {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var gelukt = false;
      try { gelukt = document.execCommand('copy'); } catch (e) { gelukt = false; }
      document.body.removeChild(ta);
      melding(gelukt ? ok : 'Kopiëren lukte niet in deze browser. Gebruik Download of Print.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { melding(ok); }, reserve);
    } else { reserve(); }
  }

  function mail() {
    var p = gedeeld || project;
    var t = alsTekst(p);
    var max = 1500; // e-mailprogramma's aanvaarden geen onbeperkt lange mailto-links
    if (t.length > max) t = t.slice(0, max) + '\n\n(Ingekort. Open je volledige project via deze link:)\n' + deellink(p);
    else t += '\n\nOpen je project opnieuw via deze link:\n' + deellink(p);
    location.href = 'mailto:?subject=' + encodeURIComponent('Mijn mediaproject' + (p.naam ? ': ' + p.naam : '')) +
      '&body=' + encodeURIComponent(t);
    melding('Je e-mailprogramma wordt geopend. Gebeurt er niets, gebruik dan Kopieer als tekst.');
  }

  function download() {
    var p = gedeeld || project;
    var blokken = function (items) {
      return items.length ? '<ul>' + items.map(function (w) {
        return '<li><strong>' + esc(w.titel) + '</strong>' + (w.tekst ? '<br>' + esc(w.tekst) : '') + (w.voorwaarde ? '<br><em>' + esc(w.voorwaarde) + '</em>' : '') + '</li>';
      }).join('') + '</ul>' : '<p class="leeg">Nog niets gekozen.</p>';
    };
    var h = '<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Mijn mediaproject' + (p.naam ? ': ' + esc(p.naam) : '') + '</title><style>' +
      'body{font-family:Arial,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;line-height:1.55;color:#1d1d1b}' +
      'h1{color:#b72634}h2{border-top:2px solid #1d1d1b;padding-top:.6rem;margin-top:2rem}li{margin:.4rem 0}' +
      '.kort{background:#f9edf3;padding:.5rem 1rem}.vraag{font-style:italic}.leeg{color:#5c5660}.notitie{white-space:pre-wrap;border-left:3px solid #b72634;padding-left:.8rem}' +
      '</style></head><body>';
    h += '<h1>Mijn mediaproject' + (p.naam ? ': ' + esc(p.naam) : '') + '</h1>';
    h += '<p>Gemaakt met de praktijkgids Media for Empowerment (Howest en Quindo).</p>';
    STARTVRAGEN.forEach(function (v) { if (v.veld !== 'naam' && p[v.veld]) h += '<h3>' + esc(v.label) + '</h3><p class="notitie">' + esc(p[v.veld]) + '</p>'; });
    h += '<h2>Werkzame factoren</h2>' + blokken(keuzesIn(p, 'factor'));
    FASEN.forEach(function (naam, i) {
      var fase = 'fase-' + (i + 1);
      h += '<h2>' + (i + 1) + '. ' + esc(naam) + '</h2>';
      var kort = kortVan(fase);
      if (kort.length) h += '<div class="kort"><strong>In het kort</strong><ul>' + kort.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul></div>';
      h += '<h3>Jouw werkvormen</h3>' + blokken(keuzesIn(p, fase));
      h += '<p class="vraag">Denkvraag: ' + esc(DENKVRAGEN[fase]) + '</p>';
      if (p.notities[fase]) h += '<h3>Notities</h3><p class="notitie">' + esc(p.notities[fase]) + '</p>';
    });
    var d = keuzesIn(p, 'doorlopend');
    if (d.length) h += '<h2>Als je werking doorloopt</h2>' + blokken(d);
    h += '<h2>Afspraken met de jongeren</h2>' + blokken(keuzesIn(p, 'recht'));
    h += '<p style="margin-top:2rem">Open je project opnieuw in de gids: <a href="' + esc(deellink(p)) + '">deellink</a></p></body></html>';

    var bestand = new Blob([h], { type: 'text/html' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(bestand);
    a.download = 'mijn-mediaproject.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    melding('Je project wordt gedownload als mijn-mediaproject.html. Je kan het openen in elke browser en ook printen.');
  }

  /* ---------------------------------------------------------------------
     Reageren op paginawissels (seintje uit js/gids.js)
     --------------------------------------------------------------------- */
  document.addEventListener('gids:pagina', function (e) {
    if (e.detail.id !== 'project') { gedeeld = null; return; }
    var m = /(?:^|&)p=([^&]+)/.exec(e.detail.vraag || '');
    gedeeld = m ? vanCode(m[1]) : null;
    toonProject();
  });

  werkKnoppenBij();
})();
