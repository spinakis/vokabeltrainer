# Lesen: verschlüsselte Textausgaben

`lesen/index.html` zeigt nach Eingabe eines Codes eine Liste von PDFs, die im Browser entschlüsselt
und zum Speichern angeboten werden. Im Repo liegen nur verschlüsselte `.bin`-Dateien in `lesen/d/`
(zufällige Namen, auch das Inhaltsverzeichnis `index.bin` ist verschlüsselt).

**Quell-PDFs und den Code NIE ins Repo legen** (nicht in Dateien, README, Commit-Nachrichten).

## Quellordner (außerhalb des Repos)

```
quelle/
  Klasse 9a/
    Text eins.pdf
    Text zwei.pdf
  Kurs Q2/
    ...
  titel.json        (optional) {"Klasse 9a/Text eins": "Anderer Titel"}
```

Gruppenname = Unterordner, Titel = Dateiname ohne `.pdf` (oder aus `titel.json`).

## Aufruf

```
LESEN_CODE='…' node lesen/bauen/verschluesseln.mjs /pfad/zu/quelle lesen/d
```

Der Code kommt nur aus der Umgebungsvariable. Alte `.bin` im Ziel werden gelöscht, `.gitkeep` bleibt.
Danach `lesen/d/` committen und pushen. Bei jedem Lauf entstehen wegen Salt/IV neue Dateien.

## Format

AES-256-GCM, Schlüssel per PBKDF2-SHA-256 (600000 Iterationen, Salt 16 Byte pro Datei);
Kopf: Version, Iterationen, Salt, IV (siehe Kommentar im Skript). Verschlüsselung geschieht
mit WebCrypto in Node und im Browser.

## Grenzen

Wer den Code kennt, kann die PDFs weitergeben. Ein kurzer Code lässt sich offline durchprobieren,
da die `.bin` öffentlich sind; daher einen langen Code wählen (mehrere Wörter).

## Möglich später

Wasserzeichen (z. B. Name oder Kennung pro Code) beim Erzeugen oder Entschlüsseln. Nicht gebaut.
