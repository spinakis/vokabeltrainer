# Fringillus, Spinakis und Apologie

Installierbare Vokabeltrainer für den Latein- und Griechischunterricht von Herrn Finke.

- Fringillus (Latein): [fringillus/](fringillus/)
- Spinakis (Griechisch): [spinakis/](spinakis/)
- Apologie (Lernwortschatz zu Platons Apologie): [apologie/](apologie/)
- Memory für die Tafel (zwei Spieler, Vokabeln, Götter, Stammformen): [memory/](memory/)

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

Regeln für jedes Veröffentlichungsskript:

1. Vorher den neuesten Stand holen (`git pull --rebase origin main`).
2. Nur die eigenen Ordner anfassen und committen (`git add -- <eigene Ordner>`), nie `git add -A` über alles.
3. Wird der Push abgelehnt, weil ein anderes Skript schneller war: neu holen und noch einmal pushen, nie erzwingen.

Diese README gehört allen; wer einen Ordner hinzufügt, trägt ihn oben in die Liste und in die Tabelle ein.
