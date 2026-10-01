/* =========================================================================
   Media for Empowerment, praktijkgids
   Zoekfunctie (vast rechtsboven op elke pagina).

   Wat dit onderdeel doet
   1. Leest bij het laden alle pagina's in en knipt ze op in stukken per
      tussentitel (h2). Zo kan een zoekresultaat naar de juiste plek op
      een pagina springen, als die tussentitel een id heeft (id="s-...").
   2. Zoekt terwijl je typt. Alle woorden moeten voorkomen; hoofdletters
      en accenten maken niet uit.
   3. Toont maximaal 8 resultaten, met de paginatitel en een stukje tekst.
      Met de pijltjestoetsen en Enter kies je een resultaat, Escape sluit.

   Je hoeft hier niets aan te passen als je pagina's toevoegt: nieuwe
   pagina's worden vanzelf doorzocht.
   ========================================================================= */

(function () {
  'use strict';

  var MAX = 8;
  var veld = document.getElementById('zoekveld');
  var lijst = document.getElementById('zoekresultaten');
  if (!veld || !lijst) return;

  // Tekst vergelijkbaar maken: kleine letters, zonder accenten.
  function plat(t) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function esc(t) {
    return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* 1. Index opbouwen ------------------------------------------------------ */
  // Onderdelen die niet doorzocht worden: navigatie en automatisch toegevoegde blokken.
  var OVERSLAAN = '.voetnoten, .backlinks, .colofon, .back, .bouw, .arc, .pager, sup.fn, script, style';
  var index = [];

  function tekstVan(el) {
    var kopie = el.cloneNode(true);
    kopie.querySelectorAll(OVERSLAAN).forEach(function (x) { x.remove(); });
    // Een spatie na elk blok, zodat woorden uit opeenvolgende blokken niet aan elkaar plakken.
    kopie.querySelectorAll('p, li, h3, h4, dt, dd, td, th, span, div, figcaption').forEach(function (x) {
      x.appendChild(document.createTextNode(' '));
    });
    return kopie.textContent.replace(/\s+/g, ' ').trim();
  }

  function bouwIndex() {
    index = [];
    document.querySelectorAll('article[data-page]').forEach(function (art) {
      var id = art.dataset.page;
      if (id === '__stub' || id === 'project') return;
      var titel = art.dataset.title || id;
      var stuk = { pagina: id, titel: titel, kop: '', anker: '', tekst: [] };
      var bewaar = function () {
        var t = stuk.tekst.join(' ').trim();
        if (t || stuk.kop) index.push({ pagina: stuk.pagina, titel: stuk.titel, kop: stuk.kop, anker: stuk.anker, tekst: t, plat: plat(stuk.titel + ' ' + stuk.kop + ' ' + t) });
      };
      [].forEach.call(art.children, function (el) {
        if (el.matches(OVERSLAAN)) return;
        if (el.tagName === 'H2') {
          bewaar();
          stuk = { pagina: id, titel: titel, kop: el.textContent.trim(), anker: (el.id || '').indexOf('s-') === 0 ? el.id.slice(2) : '', tekst: [] };
        } else if (el.tagName !== 'H1') {
          stuk.tekst.push(tekstVan(el));
        }
      });
      bewaar();
    });
  }

  /* 2. Zoeken --------------------------------------------------------------- */
  function zoek(vraag) {
    var woorden = plat(vraag).split(/\s+/).filter(function (w) { return w.length > 1; });
    if (!woorden.length) return [];
    var treffers = [];
    var heel = plat(vraag.trim());       // de volledige zoekvraag, voor een exacte titel
    index.forEach(function (s) {
      if (!woorden.every(function (w) { return s.plat.indexOf(w) >= 0; })) return;
      var score = 0, t = plat(s.titel), k = plat(s.kop);
      if (t === heel) score += 100;              // exact de titel van een pagina
      else if (t.indexOf(heel) >= 0) score += 30; // titel bevat de volledige zoekvraag
      woorden.forEach(function (w) {
        if (t.indexOf(w) >= 0) score += 10;
        if (k.indexOf(w) >= 0) score += 5;
        score += Math.min(s.plat.split(w).length - 1, 5);
      });
      treffers.push({ s: s, score: score, woorden: woorden });
    });
    treffers.sort(function (a, b) { return b.score - a.score; });
    // Eén resultaat per pagina en tussentitel.
    var gezien = {}, uit = [];
    treffers.forEach(function (x) {
      var sleutel = x.s.pagina + '|' + x.s.kop;
      if (!gezien[sleutel] && uit.length < MAX) { gezien[sleutel] = 1; uit.push(x); }
    });
    return uit;
  }

  // Stukje tekst rond het eerste gevonden woord, met markering.
  function fragment(tekst, woorden) {
    var p = plat(tekst), pos = -1;
    woorden.forEach(function (w) { var i = p.indexOf(w); if (i >= 0 && (pos < 0 || i < pos)) pos = i; });
    var start = Math.max(0, pos - 50), eind = Math.min(tekst.length, start + 150);
    var stuk = (start > 0 ? '\u2026' : '') + tekst.slice(start, eind) + (eind < tekst.length ? '\u2026' : '');
    var html = esc(stuk), pl = plat(stuk);
    // Markeer de woorden (op basis van posities in de accentloze tekst).
    var marks = [];
    woorden.forEach(function (w) {
      var i = 0;
      while ((i = pl.indexOf(w, i)) >= 0) { marks.push([i, i + w.length]); i += w.length; }
    });
    if (!marks.length) return html;
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var r = '', vorige = 0;
    marks.forEach(function (m) {
      if (m[0] < vorige) return;
      r += esc(stuk.slice(vorige, m[0])) + '<mark>' + esc(stuk.slice(m[0], m[1])) + '</mark>';
      vorige = m[1];
    });
    return r + esc(stuk.slice(vorige));
  }

  /* 3. Resultaten tonen ------------------------------------------------------ */
  var actief = -1;

  function toon() {
    var vraag = veld.value.trim();
    actief = -1;
    if (vraag.length < 2) { sluit(); return; }
    if (!index.length) bouwIndex();
    var res = zoek(vraag);
    lijst.innerHTML = res.length
      ? res.map(function (x, i) {
          var doel = '#/' + x.s.pagina + (x.s.anker ? '/' + x.s.anker : '');
          return '<a class="zoek-item" role="option" id="zoek-' + i + '" href="' + doel + '">' +
                 '<b>' + esc(x.s.titel) + (x.s.kop ? ' <span>\u203a ' + esc(x.s.kop) + '</span>' : '') + '</b>' +
                 '<small>' + fragment(x.s.tekst || x.s.kop, x.woorden) + '</small></a>';
        }).join('')
      : '<p class="zoek-leeg">Niets gevonden voor "' + esc(vraag) + '".</p>';
    lijst.hidden = false;
    veld.setAttribute('aria-expanded', 'true');
  }

  function sluit() {
    lijst.hidden = true;
    lijst.innerHTML = '';
    veld.setAttribute('aria-expanded', 'false');
    veld.removeAttribute('aria-activedescendant');
  }

  function markeer(i) {
    var items = lijst.querySelectorAll('.zoek-item');
    if (!items.length) return;
    actief = (i + items.length) % items.length;
    items.forEach(function (a, n) { a.classList.toggle('actief', n === actief); });
    veld.setAttribute('aria-activedescendant', items[actief].id);
    items[actief].scrollIntoView({ block: 'nearest' });
  }

  veld.addEventListener('input', toon);
  veld.addEventListener('focus', function () { if (veld.value.trim().length >= 2) toon(); });
  veld.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); markeer(actief + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); markeer(actief - 1); }
    else if (e.key === 'Enter') {
      var items = lijst.querySelectorAll('.zoek-item');
      var kies = items[actief >= 0 ? actief : 0];
      if (kies) { e.preventDefault(); location.hash = kies.getAttribute('href'); veld.value = ''; sluit(); veld.blur(); }
    }
    else if (e.key === 'Escape') { veld.value = ''; sluit(); veld.blur(); }
  });
  lijst.addEventListener('click', function (e) {
    if (e.target.closest('.zoek-item')) { veld.value = ''; sluit(); }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.zoek')) sluit();
  });
  // Sneltoets: "/" springt naar het zoekveld (behalve als je al in een veld typt).
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); veld.focus(); }
  });
})();
