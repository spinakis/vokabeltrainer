# Fringillus, Spinakis und Apologie

Installierbare Vokabeltrainer für den Latein- und Griechischunterricht von Herrn Finke.

- Fringillus (Latein): [fringillus/](fringillus/)
- Spinakis (Griechisch): [spinakis/](spinakis/)
- Apologie (Lernwortschatz zu Platons Apologie): [apologie/](apologie/)
- Apologie, Lesefassung der Schulausgabe für den Tolino Vision 6 (PDF, 424 S., Stand 22.10.2026, vorübergehend): [apologie/Apologie_Tolino.pdf](apologie/Apologie_Tolino.pdf)
- Memory für die Tafel (zwei Spieler, Vokabeln, Götter, Stammformen): [memory/](memory/)
- Sleepy (Testversion des Murmeltier-Jump-'n'-Runs, kein Vokabeltrainer): [sleepy/](sleepy/); dazu die Geräusche-Liste zum Selbst-Aufnehmen: [sleepy/geraeusche/](sleepy/geraeusche/)
- Provenienz-Notizbuch – Prototyp 0.1 (Objektakten für Sammlerstücke; Daten bleiben lokal im Browser): [provenienz/](provenienz/)

Die Trainer sind ausschließlich für diesen Unterricht bestimmt. Die Vokabeln folgen dem jeweiligen
Lehrwerk bzw. der Apologie-Ausgabe; die Rechte an den Lehrwerken liegen bei den Verlagen. Die Dateien werden aus einem privaten Repository
erzeugt und hier nur veröffentlicht; Änderungen bitte nicht hier, sondern dort.

## Wer schreibt hier?

Dieses Repository ist nur das Schaufenster. Mehrere private Repositories veröffentlichen hierher, jedes in
seine eigenen Ordner:

| Ordner | kommt aus | Skript |
|---|---|---|
| `fringillus/`, `spinakis/`, `apologie/` | Repository Vokabeln | `docs/veroeffentlichen.sh` |
| `memory/` | Repository Tafelbilder | dort |
| `sleepy/` (mit `sleepy/geraeusche/`) | Repository Programme | von Hand, je eine einzelne HTML-Datei |
| `provenienz/` | Repository Programme | von Hand, Vite-Build (`dist/`) |

Regeln für jedes Veröffentlichungsskript:

1. Vorher den neuesten Stand holen (`git pull --rebase origin main`).
2. Nur die eigenen Ordner anfassen und committen (`git add -- <eigene Ordner>`), nie `git add -A` über alles.
3. Wird der Push abgelehnt, weil ein anderes Skript schneller war: neu holen und noch einmal pushen, nie erzwingen.

Diese README gehört allen; wer einen Ordner hinzufügt, trägt ihn oben in die Liste und in die Tabelle ein.

## Zugangscode

Alle App-Startseiten hier (Fringillus, Spinakis, Apologie, Pruschon, Prushit, Sleepy, Provenienz) verlangen den Zugangscode der Klasse; Memory hat seinen eigenen. Eingesetzt wird er beim Veröffentlichen mit `docs/zugang.py` aus dem Repository Vokabeln (dort automatisch in `docs/veroeffentlichen.sh`). Wer `sleepy/` oder `provenienz/` von Hand neu veröffentlicht, ruft danach `python3 <Vokabeln>/docs/zugang.py sleepy/index.html …` auf. Offen bleiben `pruschon/datenschutz.html` und `pruschon/hilfe.html` (Datenschutz- und Support-URL im App Store).
