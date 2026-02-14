# ItaliaViva Travel (GitHub Pages)

Sito demo statico per viaggi in Italia:
- Destinazioni filtrabili
- Itinerario (aggiungi/rimuovi tappe)
- Stima indicativa
- Form prenotazione (salvato in localStorage)

## Avvio locale
Apri `index.html` nel browser, oppure usa un server statico:

### Con Python
python -m http.server 5173

Poi vai su http://localhost:5173

## Deploy su GitHub Pages
1. Crea un repo su GitHub (es. `italy-travel-site`)
2. Carica questi file nella root
3. Vai su **Settings → Pages**
4. Source: **Deploy from a branch**
5. Branch: **main** / folder: **/(root)**
6. Salva, poi visita l’URL di Pages

## Collegare prenotazione a un backend (opzioni veloci)
- Netlify Forms (se deploy su Netlify)
- Formspree
- Google Apps Script → Google Sheets
- API custom (Node/Express, Supabase, etc.)
