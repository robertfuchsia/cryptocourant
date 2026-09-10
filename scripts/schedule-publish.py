"""
Plant het publiceren van artikelen in Sanity in, op Nederlandse tijd.

Robert geeft tijden in Nederlandse tijd (Europe/Amsterdam). Dit script rekent
die om naar UTC — zomertijd en wintertijd gaan automatisch goed — en maakt er
een Sanity-schedule van. Die draait bij Sanity zelf, dus er hoeft niemand
online te zijn op het moment van publiceren.

    python3 scripts/schedule-publish.py post-nl-mijn-artikel "2026-09-11 09:00"
    python3 scripts/schedule-publish.py --list
    python3 scripts/schedule-publish.py --cancel sch-...

Het token komt uit SANITY_API_WRITE_TOKEN in .env.
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

PROJECT = "jen186iw"
DATASET = "production"
NL = ZoneInfo("Europe/Amsterdam")
UTC = ZoneInfo("UTC")
BASE = f"https://{PROJECT}.api.sanity.io/v2022-04-01/schedules/{PROJECT}/{DATASET}"


def token():
    env = os.environ.get("SANITY_API_WRITE_TOKEN")
    if env:
        return env
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(root, ".env")) as f:
        for line in f:
            if line.startswith("SANITY_API_WRITE_TOKEN="):
                return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("Geen SANITY_API_WRITE_TOKEN gevonden in .env")


def call(method, url, body=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {token()}", "Content-Type": "application/json"},
        method=method,
    )
    try:
        raw = urllib.request.urlopen(req).read().decode()
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Sanity gaf {e.code}: {e.read().decode()[:300]}")
    return json.loads(raw) if raw.strip() else {}


def to_utc(when: str) -> datetime:
    """'2026-09-11 09:00' in Nederlandse tijd naar een UTC-tijdstip."""
    when = when.strip().replace("T", " ")
    if not re.match(r"^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}(:\d{2})?$", when):
        raise SystemExit(f"Tijd niet begrepen: {when!r}. Gebruik 'JJJJ-MM-DD UU:MM'.")
    fmt = "%Y-%m-%d %H:%M:%S" if when.count(":") == 2 else "%Y-%m-%d %H:%M"
    local = datetime.strptime(when, fmt).replace(tzinfo=NL)
    return local.astimezone(UTC)


def schedule(doc_id: str, when: str, name=None):
    if doc_id.startswith("drafts."):
        doc_id = doc_id[len("drafts."):]  # de schedule wijst naar het gepubliceerde id
    utc = to_utc(when)
    if utc <= datetime.now(UTC):
        raise SystemExit(f"{when} (NL) ligt in het verleden.")

    result = call("POST", BASE, {
        "documents": [{"documentId": doc_id}],
        "name": name or f"Publiceren {doc_id}",
        "description": f"Ingepland voor {when} Nederlandse tijd",
        "executeAt": utc.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "action": "publish",
    })
    print(f"{result['id']}  {doc_id}\n  {when} NL  =  {result['executeAt']} UTC")
    return result


def show():
    rows = call("GET", BASE).get("schedules", [])
    if not rows:
        print("Geen schedules.")
        return
    for s in sorted(rows, key=lambda r: r["executeAt"]):
        nl = datetime.strptime(s["executeAt"][:19], "%Y-%m-%dT%H:%M:%S").replace(
            tzinfo=UTC).astimezone(NL)
        docs = ", ".join(d["documentId"] for d in s.get("documents", []))
        print(f"{s['state']:<10} {nl:%Y-%m-%d %H:%M} NL  {s['id']}  {docs}")


def main():
    ap = argparse.ArgumentParser(description="Publiceren inplannen op Nederlandse tijd")
    ap.add_argument("doc", nargs="?", help="document-id, bv. post-nl-mijn-artikel")
    ap.add_argument("when", nargs="?", help="Nederlandse tijd, 'JJJJ-MM-DD UU:MM'")
    ap.add_argument("--name", help="naam van de schedule")
    ap.add_argument("--list", action="store_true", help="toon alle schedules")
    ap.add_argument("--cancel", metavar="ID", help="annuleer een schedule")
    a = ap.parse_args()

    if a.list:
        return show()
    if a.cancel:
        call("PATCH", f"{BASE}/{a.cancel}", {"state": "cancelled"})
        print(f"{a.cancel} geannuleerd.")
        return
    if not (a.doc and a.when):
        ap.print_help()
        sys.exit(1)
    schedule(a.doc, a.when, a.name)


if __name__ == "__main__":
    main()
