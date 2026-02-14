/* ItaliaViva Travel — demo JS
   - Destinazioni (render + filtri)
   - Itinerario (aggiungi/rimuovi + localStorage)
   - Quick quote + stima
   - Prenotazione (salva in locale + riepilogo)
*/

const DESTINATIONS = [
  {
    id: "roma",
    name: "Roma",
    region: "Lazio",
    tags: ["citta", "arte", "food"],
    blurb: "Classici senza tempo: Colosseo, Trastevere, musei, carbonara fatta bene.",
    basePerDay: 145
  },
  {
    id: "firenze",
    name: "Firenze",
    region: "Toscana",
    tags: ["citta", "arte", "food"],
    blurb: "Rinascimento, colline e bistecca: perfetta per 2–3 giorni intensi.",
    basePerDay: 155
  },
  {
    id: "venezia",
    name: "Venezia",
    region: "Veneto",
    tags: ["citta", "arte"],
    blurb: "Unica. Vai presto la mattina, vaporetto smart, e perdi tempo nei sestieri.",
    basePerDay: 175
  },
  {
    id: "costiera",
    name: "Costiera Amalfitana",
    region: "Campania",
    tags: ["mare", "food"],
    blurb: "Panorami, limoni e mare. Consiglio: base a Sorrento per logistica facile.",
    basePerDay: 190
  },
  {
    id: "dolomiti",
    name: "Dolomiti",
    region: "Trentino-Alto Adige",
    tags: ["natura"],
    blurb: "Trekking e rifugi. In estate: prenota presto. In inverno: neve e sci.",
    basePerDay: 160
  },
  {
    id: "cinqueterre",
    name: "Cinque Terre",
    region: "Liguria",
    tags: ["mare", "natura"],
    blurb: "Sentieri e borghi colorati. Muoviti in treno, evita l’auto in alta stagione.",
    basePerDay: 165
  },
  {
    id: "sicilia",
    name: "Sicilia (Palermo + Etna)",
    region: "Sicilia",
    tags: ["mare", "natura", "food"],
    blurb: "Street food, vulcano, mare. Qui un viaggio da 7–10 giorni ha senso.",
    basePerDay: 140
  },
  {
    id: "puglia",
    name: "Puglia (Valle d’Itria)",
    region: "Puglia",
    tags: ["mare", "food"],
    blurb: "Trulli, masserie, spiagge. Con auto: esperienza molto più fluida.",
    basePerDay: 135
  },
  {
    id: "umbria",
    name: "Umbria (Borghi & Natura)",
    region: "Umbria",
    tags: ["natura", "food", "arte"],
    blurb: "Lenta, verde, concreta. Perfetta se vuoi staccare davvero.",
    basePerDay: 120
  }
];

const $ = (sel) => document.querySelector(sel);

const grid = $("#destinationsGrid");
const searchInput = $("#search");
const tagFilter = $("#tagFilter");
const resetFiltersBtn = $("#resetFilters");
const toast = $("#toast");

const itineraryList = $("#itineraryList");
const stopsCount = $("#stopsCount");
const clearItineraryBtn = $("#clearItinerary");
const useItineraryBtn = $("#useItineraryInBooking");

const daysInput = $("#days");
const travelStyleSelect = $("#travelStyle");
const buildQuoteBtn = $("#buildQuoteBtn");
const quoteResult = $("#quoteResult");

const pricingDays = $("#pricingDays");
const pricingStyle = $("#pricingStyle");
const pricingRange = $("#pricingRange");
const pricingNotes = $("#pricingNotes");

const bookingForm = $("#bookingForm");
const selectedStopsTextarea = $("#selectedStops");
const bookingSummary = $("#bookingSummary");

const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

const STORAGE_KEYS = {
  itinerary: "itv_itinerary_v1",
  lastBooking: "itv_last_booking_v1",
  lastQuote: "itv_last_quote_v1"
};

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function loadItinerary(){
  try{
    const raw = localStorage.getItem(STORAGE_KEYS.itinerary);
    return raw ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}

function saveItinerary(it){
  localStorage.setItem(STORAGE_KEYS.itinerary, JSON.stringify(it));
}

function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

function formatEUR(n){
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

function styleMultiplier(style){
  switch(style){
    case "budget": return 0.78;
    case "food": return 1.12;
    case "nature": return 1.02;
    case "classic":
    default: return 1.0;
  }
}

function computeQuote({days, style, stops}){
  // pricing "demo": basePerDay medio * giorni * moltiplicatore, con range
  const safeDays = clamp(Number(days || 7), 2, 21);
  const mult = styleMultiplier(style);

  const chosen = (stops && stops.length)
    ? DESTINATIONS.filter(d => stops.includes(d.id))
    : [];

  const avgBase = chosen.length
    ? chosen.reduce((s,d)=>s+d.basePerDay, 0) / chosen.length
    : 145;

  const base = avgBase * safeDays * mult;

  // range +/- 18%
  const low = base * 0.82;
  const high = base * 1.18;

  const notes = chosen.length
    ? `Stima basata su ${chosen.length} tappe selezionate.`
    : "Stima base senza tappe selezionate (sceglile per affinare).";

  return {
    days: safeDays,
    style,
    low,
    high,
    notes
  };
}

function renderDestinations(list){
  grid.innerHTML = "";
  if(!list.length){
    grid.innerHTML = `<div class="card"><p class="muted">Nessun risultato. Cambia filtri.</p></div>`;
    return;
  }

  const it = loadItinerary();

  for(const d of list){
    const inIt = it.includes(d.id);

    const card = document.createElement("article");
    card.className = "card dest-card";
    card.innerHTML = `
      <div class="dest-top">
        <div>
          <h3 style="margin:0 0 6px">${d.name}</h3>
          <p class="muted small" style="margin:0">${d.region}</p>
        </div>
        <span class="tag">${formatEUR(d.basePerDay)}/giorno</span>
      </div>

      <p class="small" style="margin:10px 0 0">${d.blurb}</p>

      <div class="tags">
        ${d.tags.map(t => `<span class="tag">#${t}</span>`).join("")}
      </div>

      <div class="dest-actions">
        <button class="btn ${inIt ? "btn-ghost" : ""}" data-add="${d.id}">
          ${inIt ? "Aggiunta ✓" : "Aggiungi tappa"}
        </button>
        <button class="btn btn-ghost" data-view="${d.id}">Dettagli</button>
      </div>
    `;
    grid.appendChild(card);
  }
}

function applyFilters(){
  const q = (searchInput.value || "").trim().toLowerCase();
  const tag = tagFilter.value;

  let list = DESTINATIONS.slice();

  if(tag !== "all"){
    list = list.filter(d => d.tags.includes(tag));
  }
  if(q){
    list = list.filter(d => {
      const hay = `${d.name} ${d.region} ${d.tags.join(" ")} ${d.blurb}`.toLowerCase();
      return hay.includes(q);
    });
  }

  renderDestinations(list);
}

function renderItinerary(){
  const it = loadItinerary();
  stopsCount.textContent = String(it.length);

  if(!it.length){
    itineraryList.innerHTML = `<p class="muted">Nessuna tappa. Aggiungine almeno 2 per una proposta sensata.</p>`;
    return;
  }

  const chosen = DESTINATIONS.filter(d => it.includes(d.id));
  itineraryList.innerHTML = "";

  for(const d of chosen){
    const row = document.createElement("div");
    row.className = "stop";
    row.innerHTML = `
      <div>
        <h4>${d.name} <span class="tag">${d.region}</span></h4>
        <p class="muted small">${d.blurb}</p>
      </div>
      <button class="btn btn-ghost" data-remove="${d.id}">Rimuovi</button>
    `;
    itineraryList.appendChild(row);
  }
}

function viewDetails(id){
  const d = DESTINATIONS.find(x => x.id === id);
  if(!d) return;

  const text = [
    `${d.name} — ${d.region}`,
    `Temi: ${d.tags.map(t=>"#"+t).join(" ")}`,
    `Indicativo: ${formatEUR(d.basePerDay)}/giorno`,
    d.blurb
  ].join("\n");

  // "modal" minimale via alert (sostituibile con dialog HTML)
  alert(text);
}

function addStop(id){
  const it = loadItinerary();
  if(it.includes(id)){
    showToast("Tappa già presente nell’itinerario.");
    return;
  }
  it.push(id);
  saveItinerary(it);
  renderItinerary();
  applyFilters();
  showToast("Tappa aggiunta all’itinerario.");
}

function removeStop(id){
  const it = loadItinerary().filter(x => x !== id);
  saveItinerary(it);
  renderItinerary();
  applyFilters();
  showToast("Tappa rimossa.");
}

function clearItinerary(){
  saveItinerary([]);
  renderItinerary();
  applyFilters();
  showToast("Itinerario svuotato.");
}

function updatePricingBox(q){
  pricingDays.textContent = `${q.days} giorni`;
  pricingStyle.textContent = q.style;
  pricingRange.textContent = `${formatEUR(q.low)} — ${formatEUR(q.high)}`;
  pricingNotes.textContent = q.notes;
}

function buildQuote(){
  const it = loadItinerary();
  const q = computeQuote({
    days: daysInput.value,
    style: travelStyleSelect.value,
    stops: it
  });

  localStorage.setItem(STORAGE_KEYS.lastQuote, JSON.stringify(q));
  quoteResult.innerHTML = `
    <strong>Stima:</strong> ${formatEUR(q.low)} — ${formatEUR(q.high)}<br/>
    <span class="muted">${q.notes}</span>
  `;
  updatePricingBox(q);
  showToast("Stima aggiornata.");
}

function useItineraryInBooking(){
  const it = loadItinerary();
  if(it.length < 1){
    showToast("Aggiungi almeno 1 tappa.");
    return;
  }
  const chosen = DESTINATIONS.filter(d => it.includes(d.id));
  selectedStopsTextarea.value = chosen.map(d => `${d.name} (${d.region})`).join(", ");
  location.hash = "#prenota";
  showToast("Tappe inserite nella prenotazione.");
}

function setYear(){
  $("#year").textContent = String(new Date().getFullYear());
}

function loadLastBooking(){
  try{
    const raw = localStorage.getItem(STORAGE_KEYS.lastBooking);
    if(!raw) return;
    const b = JSON.parse(raw);
    renderBookingSummary(b);
  }catch{ /* ignore */ }
}

function renderBookingSummary(b){
  bookingSummary.innerHTML = `
    <h3>Riepilogo</h3>
    <div class="pricing">
      <div class="pricing-row"><span>Nome</span><strong>${escapeHtml(b.fullName)}</strong></div>
      <div class="pricing-row"><span>Email</span><strong>${escapeHtml(b.email)}</strong></div>
      <div class="pricing-row"><span>Date</span><strong>${escapeHtml(b.startDate)} → ${escapeHtml(b.endDate)}</strong></div>
      <div class="pricing-row"><span>Persone</span><strong>${escapeHtml(String(b.people))}</strong></div>
      <div class="pricing-row"><span>Budget</span><strong>${b.budget ? formatEUR(Number(b.budget)) : "—"}</strong></div>
      <div class="pricing-row"><span>Tappe</span><strong>${escapeHtml(b.selectedStops || "—")}</strong></div>
    </div>
    <p class="muted small" style="margin-top:12px">
      Salvato in locale. Per invio reale: collega un endpoint (Netlify Forms / Formspree / API).
    </p>
  `;
}

function escapeHtml(str){
  return (str || "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function handleBookingSubmit(e){
  e.preventDefault();

  const fd = new FormData(bookingForm);
  const booking = Object.fromEntries(fd.entries());

  // extra validation minimale: date range
  if(booking.startDate && booking.endDate && booking.endDate < booking.startDate){
    showToast("Errore: la data fine non può precedere la data inizio.");
    return;
  }

  localStorage.setItem(STORAGE_KEYS.lastBooking, JSON.stringify(booking));
  renderBookingSummary(booking);

  showToast("Richiesta salvata (demo).");
  bookingForm.reset();

  // ripopola textarea se c'è itinerario
  const it = loadItinerary();
  if(it.length){
    const chosen = DESTINATIONS.filter(d => it.includes(d.id));
    selectedStopsTextarea.value = chosen.map(d => `${d.name} (${d.region})`).join(", ");
  }
}

function initNav(){
  if(!navToggle) return;
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  navMenu.addEventListener("click", (e) => {
    if(e.target.tagName === "A"){
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function init(){
  setYear();
  renderDestinations(DESTINATIONS);
  renderItinerary();
  loadLastBooking();

  // carica ultima quote se esiste
  try{
    const raw = localStorage.getItem(STORAGE_KEYS.lastQuote);
    if(raw){
      const q = JSON.parse(raw);
      updatePricingBox(q);
    }
  }catch{}

  searchInput.addEventListener("input", applyFilters);
  tagFilter.addEventListener("change", applyFilters);
  resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    tagFilter.value = "all";
    applyFilters();
  });

  grid.addEventListener("click", (e) => {
    const addId = e.target?.dataset?.add;
    const viewId = e.target?.dataset?.view;
    if(addId) addStop(addId);
    if(viewId) viewDetails(viewId);
  });

  itineraryList.addEventListener("click", (e) => {
    const remId = e.target?.dataset?.remove;
    if(remId) removeStop(remId);
  });

  clearItineraryBtn.addEventListener("click", clearItinerary);
  useItineraryBtn.addEventListener("click", useItineraryInBooking);

  buildQuoteBtn.addEventListener("click", buildQuote);

  bookingForm.addEventListener("submit", handleBookingSubmit);

  initNav();
}

document.addEventListener("DOMContentLoaded", init);
