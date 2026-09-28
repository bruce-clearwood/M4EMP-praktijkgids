"""
Bundel de praktijkgids tot één enkel HTML-bestand.

Waarom? De map (index.html + css + js + img) is de werkversie: die zet je
zo online en daarin pas je dingen aan. Soms heb je één los bestand nodig,
bijvoorbeeld om te mailen of op een platform te zetten dat geen mappen
aanvaardt. Dit script maakt dat bestand.

Gebruik (vanuit de map m4emp-gids):
    python3 hulpmiddelen/bundel.py

Resultaat: media-for-empowerment-gebundeld.html in dezelfde map.
Enkel standaard Python nodig (versie 3.8 of hoger), geen extra pakketten.
"""
import base64
import json
import mimetypes
import os

MAP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UIT = os.path.join(MAP, "media-for-empowerment-gebundeld.html")


def lees(pad, binair=False):
    with open(os.path.join(MAP, pad), "rb" if binair else "r", encoding=None if binair else "utf-8") as f:
        return f.read()


def als_data_uri(pad):
    soort = mimetypes.guess_type(pad)[0] or "application/octet-stream"
    if pad.endswith(".svg"):
        soort = "image/svg+xml"
    return "data:%s;base64,%s" % (soort, base64.b64encode(lees(pad, binair=True)).decode("ascii"))


def main():
    html = lees("index.html")
    css = lees("css/stijl.css")

    # Alle beelden in de map img worden in het bestand opgenomen.
    beelden = {}
    for wortel, _, bestanden in os.walk(os.path.join(MAP, "img")):
        for naam in bestanden:
            pad = os.path.relpath(os.path.join(wortel, naam), MAP).replace(os.sep, "/")
            beelden[pad] = als_data_uri(pad)

    # Beelden die rechtstreeks in index.html staan (foto's, partnerlogo's)
    # worden daar vervangen. Het script gids.js heeft de pictogrammen en de
    # logo's voor de colofon nodig; die gaan in window.GIDS_BEELDEN.
    voor_script = {}
    for pad, uri in beelden.items():
        if 'src="%s"' % pad in html:
            html = html.replace('src="%s"' % pad, 'src="%s"' % uri)
        if pad.startswith("img/pictogrammen/") or pad.startswith("img/logo-"):
            voor_script[pad] = uri

    # Downloads (PDF, Word) één keer opnemen; gids.js zet de links er zelf naar.
    dl_map = os.path.join(MAP, "downloads")
    if os.path.isdir(dl_map):
        for naam in sorted(os.listdir(dl_map)):
            pad = "downloads/" + naam
            soort = "application/vnd.openxmlformats-officedocument.wordprocessingml.document" if naam.endswith(".docx") else (mimetypes.guess_type(naam)[0] or "application/octet-stream")
            voor_script[pad] = "data:%s;base64,%s" % (soort, base64.b64encode(lees(pad, binair=True)).decode("ascii"))

    html = html.replace('<link rel="stylesheet" href="css/stijl.css">', "<style>\n%s\n</style>" % css)
    # Beelden voor de scripts, daarna elk script uit de map js inlinen.
    html = html.replace(
        '<script src="js/gids.js"></script>',
        "<script>window.GIDS_BEELDEN = %s;</script>\n<script src=\"js/gids.js\"></script>" % json.dumps(voor_script),
    )
    for naam in sorted(os.listdir(os.path.join(MAP, "js"))):
        if naam.endswith(".js"):
            html = html.replace('<script src="js/%s"></script>' % naam, "<script>\n%s\n</script>" % lees("js/" + naam))

    with open(UIT, "w", encoding="utf-8") as f:
        f.write(html)
    print("Klaar: %s (%d kB)" % (UIT, os.path.getsize(UIT) // 1024))


if __name__ == "__main__":
    main()
