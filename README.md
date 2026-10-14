# Ad Victoriam! 🏛️ Latein Lektion 1 + 2

Lern-App für die Lateinarbeit zu Lektion 1 + 2 (Klasse 6, 16.10.26). Die App ist auf Deutsch und Englisch; die Sprache stellst du oben rechts um. Die lateinischen Wörter und die deutschen Übersetzungen bleiben auch in der englischen Ansicht sichtbar, weil die Arbeit auf Deutsch geschrieben wird.

## Starten

`docs/index.html` direkt im Browser öffnen. Du brauchst kein Internet, kein Konto und keine Installation.

**GitHub Pages:** Im Repository unter *Settings → Pages* „Deploy from a branch“ wählen, Branch `main` (oder `master`) und Ordner `/docs`.

## Inhalt

Sieben Stationen, genau wie auf der Checkliste. Jede Station hat eine Erklärkarte „Das musst du wissen“ und Übungsrunden, die jedes Mal neu zusammengestellt werden:

1. **Wagenrennen im Circus Maximus** (TB S. 14, 16): 27 Wissensfragen
2. **Vokabeln** Lektion 1 + Sternchenvokabeln Lektion 2 (BB S. 10–12, 16–18, AH S. 8–9): Bedeutung wählen oder tippen, Latein tippen, Paare finden, Wörterschlange, Wort-Detektiv (Video ← vidēre)
3. **Nominativ & Akkusativ** (TB S. 19 A, BB S. 19 A, AH S. 12): bestimmen, bilden, sortieren, „Wen sieht Afra?“, Plural bilden, „Vorsicht Falle“ beim Satzbau
4. **Präpositionen mit Akkusativ** (TB/BB S. 19 B): Bild-Aufgaben zu ad/ante/post, übersetzen, richtige Form wählen
5. **Verben a-/e-/i-Konjugation, esse, adesse** (TB S. 19 C, BB S. 20, AH S. 13): Person bestimmen, übersetzen, bilden, Verb-Gespanne, „Tränke“, Konjugationstabelle
6. **Infinitiv** (BB S. 15 C, AH S. 7 C): Infinitiv finden und bilden, dēbēre/audēre/dubitāre + Infinitiv übersetzen
7. **Übersetzen** – zählt doppelt (TB S. 12, 15, 18, AH S. 10–11): richtige Übersetzung wählen, Satz-Baukasten, „Du darfst der Lehrer sein“ (Fehler finden), Deutsch → Latein, Kontext (sed = aber/sondern, adesse = da sein/helfen), Personalpronomen ergänzen

Dazu gibt es:

- einen **Probetest** in 6 Versionen. Teil A ist ein neuer Übersetzungstext, den die Schülerin selbst prüft, mit Musterlösung und Prüfpunkten. Teil B hat 12 Aufgaben mit je einem Versuch. Das Gesamtergebnis wird wie in der Arbeit 2 : 1 gewichtet.
- einen **Vokabel-Trainer** mit Karteikarten nach Päckchen, Paare finden und „Meine schwierigen Wörter“. Wörter, bei denen Fehler passieren, landen dort automatisch.
- die **Checkliste** zum Ankreuzen.

Alle Übungssätze und Probetest-Texte sind neu geschrieben. Sie benutzen nur den gelernten Wortschatz und dieselben Figuren wie das Buch (Davus, Afra, Incitatus …). Es sind keine Buchtexte oder Scans in der App enthalten.

## So funktioniert das Üben

- Bei einer falschen Antwort gibt es einen Tipp und einen zweiten Versuch, danach die Lösung mit Erklärung.
- Sterne: 3 ★ ab 90 %, 2 ★ ab 70 %, 1 ★ ab 40 %. Jede Station mit 2 ★ dreht einen der 7 Delfine im Circus um.
- Längenstriche (ā, ē …) muss man beim Tippen nicht eingeben.
- Gespeichert wird nur lokal im Browser (localStorage). Die App hat kein Tracking und nutzt keine externen Dienste.

## Dateien

- `docs/index.html`, `docs/style.css`
- `docs/js/data.js`: Wortschatz, Verben, Substantive, Übungssätze, Probetest-Texte, Circus-Fragen. Neue Sätze kommen hier hinzu.
- `docs/js/core.js`: Sprache, Speicher und Aufgabentypen
- `docs/js/topics.js`: Stationen, Erklärkarten und Aufgaben-Generatoren
- `docs/js/app.js`: Bildschirme

---

**English:** A bilingual (DE/EN) static study app for a Year-6 German Latin test (lessons 1–2: vocabulary, nominative/accusative, prepositions + accusative, present-tense verbs, infinitive, Circus Maximus, translation). Open `docs/index.html` in a browser, or host the folder on GitHub Pages. No build step and no dependencies.
