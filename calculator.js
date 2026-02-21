            // Global variables
// Default and fallback: Baku (Capital) — verified coordinates
const BAKU_DEFAULT = { lat: 40.3953, lon: 49.8822 };
let map, marker;
let selectedLocation = { ...BAKU_DEFAULT };

// Curated Azerbaijan city coordinates (verified; add more as needed)
const cityCoordinates = {
    'baku': { lat: 40.3953, lon: 49.8822 },
    'sumqayıt': { lat: 40.5897, lon: 49.6686 },
    'sumqayit': { lat: 40.5897, lon: 49.6686 },
    'sumgait': { lat: 40.5897, lon: 49.6686 },
    'gəncə': { lat: 40.6828, lon: 46.3606 },
    'ganja': { lat: 40.6828, lon: 46.3606 },
    'gence': { lat: 40.6828, lon: 46.3606 },
    'ağcabədi': { lat: 40.0528, lon: 47.4603 },
    'agcabedi': { lat: 40.0528, lon: 47.4603 },
    'agjabedi': { lat: 40.0528, lon: 47.4603 },
    'mingachevir': { lat: 40.7703, lon: 47.0495 },
    'lankaran': { lat: 38.7539, lon: 48.8509 },
    'shaki': { lat: 41.1919, lon: 47.1706 },
    'nakhchivan': { lat: 39.2090, lon: 45.4126 },
    'shamakhi': { lat: 40.6314, lon: 48.6394 }
};

// Initialize map
async function getUserLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.latitude && data.longitude) {
            const lat = data.latitude;
            const lon = data.longitude;

            // Azerbaijan bounds: lat 38-42, lon 44-51
            if (lat >= 38 && lat <= 42 && lon >= 44 && lon <= 51) {
                return { lat, lon, zoom: 10 };
            } else {
                return { ...BAKU_DEFAULT, zoom: 7 };
            }
        }
    } catch (error) {
        console.log('IP geolocation failed, using default location');
    }

    return { ...BAKU_DEFAULT, zoom: 7 };
}

async function initMap() {
    const userLoc = await getUserLocation();
    selectedLocation = { lat: userLoc.lat, lon: userLoc.lon };

    map = L.map('map').setView([userLoc.lat, userLoc.lon], userLoc.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    marker = L.marker([userLoc.lat, userLoc.lon], {
        draggable: true
    }).addTo(map);

    updateLocationDisplay();
    updateLocationInputs();

    marker.on('dragend', function (e) {
        const pos = marker.getLatLng();
        selectedLocation = { lat: pos.lat, lon: pos.lng };
        updateLocationDisplay();
        updateLocationInputs();
    });

    map.on('click', function (e) {
        const pos = e.latlng;
        selectedLocation = { lat: pos.lat, lon: pos.lng };
        marker.setLatLng(pos);
        updateLocationDisplay();
        updateLocationInputs();
    });
}

function updateLocationDisplay() {
    const coordsVal = document.getElementById('coords-value');
    if (coordsVal) {
        coordsVal.textContent = `(${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)})`;
    }
}

function updateLocationInputs() {
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.value = `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`;
    }
}

// Geocode a place name via OpenStreetMap Nominatim (free; no API key)
const AZ_BOUNDS = { latMin: 38, latMax: 42, lonMin: 44, lonMax: 51 };
async function geocodeLocation(query) {
    const q = query.includes('Azerbaijan') ? query : query + ', Azerbaijan';
    try {
        const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
            q: q,
            format: 'json',
            limit: 1,
            countrycodes: 'az'
        });
        const res = await fetch(url, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'AZ-Energy-Hub-Solar-Calculator' }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            if (!isNaN(lat) && !isNaN(lon) && lat >= AZ_BOUNDS.latMin && lat <= AZ_BOUNDS.latMax && lon >= AZ_BOUNDS.lonMin && lon <= AZ_BOUNDS.lonMax) {
                return { lat, lon };
            }
        }
    } catch (e) {
        console.warn('Geocoding failed for:', query, e);
    }
    return null;
}

// Get coordinates from location input; updates map/marker when city or coords are resolved
async function getCoordinates(locationStr) {
    if (!locationStr || locationStr.trim() === '') {
        return selectedLocation;
    }

    const trimmed = locationStr.trim().toLowerCase();
    const rawTrimmed = locationStr.trim();

    // 1) Known city list (curated, correct coordinates)
    if (cityCoordinates[trimmed]) {
        const coords = cityCoordinates[trimmed];
        selectedLocation = coords;
        if (marker) marker.setLatLng([coords.lat, coords.lon]);
        if (map) map.setView([coords.lat, coords.lon], 10);
        updateLocationDisplay();
        return coords;
    }

    // 2) Parse as "lat, lon"
    const coordRegex = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
    const match = locationStr.trim().match(coordRegex);
    if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lon)) {
            selectedLocation = { lat, lon };
            if (marker) marker.setLatLng([lat, lon]);
            if (map) map.setView([lat, lon], 10);
            updateLocationDisplay();
            return selectedLocation;
        }
    }

    // 3) Geocode via Nominatim (any other place name in Azerbaijan)
    const geocoded = await geocodeLocation(rawTrimmed);
    if (geocoded) {
        selectedLocation = geocoded;
        if (marker) marker.setLatLng([geocoded.lat, geocoded.lon]);
        if (map) map.setView([geocoded.lat, geocoded.lon], 10);
        updateLocationDisplay();
        return geocoded;
    }

    // 4) Fallback: current map selection
    return selectedLocation;
}

// Get PVGIS solar yield data (proxy first, then direct API; same logic as CECSO)
async function getPVGISYield(lat, lon, tilt = 35, aspect = 0) {
    // Convert orientation: 0°=North, 90°=East, 180°=South, 270°=West → PVGIS aspect: South=0, East=-90, West=90
    let pvgisAspect = 0;
    if (aspect === 0) pvgisAspect = 0;
    else if (aspect === 90) pvgisAspect = -90;
    else if (aspect === 180) pvgisAspect = 0;
    else if (aspect === 270) pvgisAspect = 90;
    else pvgisAspect = (aspect - 180) * -1;

    const proxyUrl = `/api/pvgis?lat=${lat}&lon=${lon}&tilt=${tilt}&aspect=${pvgisAspect}`;
    const directUrl = `https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=11&angle=${tilt}&aspect=${pvgisAspect}&outputformat=json`;

    try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.outputs && data.outputs.totals && data.outputs.totals.fixed) {
                const yearlyProduction = data.outputs.totals.fixed.E_y;
                console.log(`✅ PVGIS data fetched via proxy for (${lat}, ${lon}): ${yearlyProduction} kWh/kWp/year`);
                if (data.inputs && data.inputs.pv_module) {
                    window.lastSystemLoss = data.inputs.pv_module.system_loss;
                }
                return Math.round(yearlyProduction);
            }
        }
    } catch (error) {
        console.warn('Proxy API failed, trying direct PVGIS:', error);
    }

    try {
        const response = await fetch(directUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.outputs && data.outputs.totals && data.outputs.totals.fixed) {
                const yearlyProduction = data.outputs.totals.fixed.E_y;
                console.log(`✅ PVGIS data fetched directly for (${lat}, ${lon}): ${yearlyProduction} kWh/kWp/year`);
                if (data.inputs && data.inputs.pv_module) {
                    window.lastSystemLoss = data.inputs.pv_module.system_loss;
                }
                return Math.round(yearlyProduction);
            }
        }
    } catch (error) {
        console.error('Direct PVGIS API also failed:', error);
    }

    console.warn(`❌ All PVGIS methods failed for (${lat}, ${lon}), using Azerbaijan average`);
    return 1350;
}

// Calculate optimal tilt angle based on latitude
function getOptimalTilt(lat) {
    return Math.round(Math.abs(lat));
}

// Estimate house area (m²) from household size — Azerbaijan-relevant heuristic. API can be wired in later via getEstimatedHouseArea(peopleCount, regionOrCoords).
function getEstimatedHouseArea(peopleCount) {
    const n = Math.max(1, parseInt(peopleCount, 10) || 1);
    if (n === 1) return 45;
    if (n === 2) return 70;
    if (n === 3) return 90;
    if (n === 4) return 115;
    return 115 + (n - 4) * 15;
}

// Toggle advanced options
window.toggleAdvancedOptions = function () {
    const advOptions = document.getElementById('advanced-options');
    const btn = document.querySelector('.advanced-toggle-btn');

    if (advOptions.style.display === 'none' || advOptions.style.display === '') {
        advOptions.style.display = 'block';
        btn.innerHTML = '<span>🔼</span> Hide Advanced Parameters';
        btn.style.background = 'rgba(46, 204, 113, 0.1)';
    } else {
        advOptions.style.display = 'none';
        btn.innerHTML = '<span>🔧</span> Show Advanced Parameters';
        btn.style.background = 'transparent';
    }
};

// ── Paywall ──────────────────────────────────────────────────────

function applyPaywall() {
    const tips = document.getElementById('optimization-tips');
    const overlay = document.getElementById('paywall-overlay');
    if (tips) tips.classList.add('optimizations-locked');
    if (overlay) overlay.style.display = 'flex';
}

window.openPaymentModal = function () {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('open');
};

window.closePaymentModal = function () {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.remove('open');
};

window.submitPayment = function () {
    closePaymentModal();
    showSuccessToast();
    unlockAndShowAI();
};

function showSuccessToast() {
    const toast = document.getElementById('payment-toast');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function unlockAndShowAI() {
    const tips = document.getElementById('optimization-tips');
    const overlay = document.getElementById('paywall-overlay');
    if (tips) tips.classList.remove('optimizations-locked');
    if (overlay) overlay.style.display = 'none';

    const aiSection = document.getElementById('ai-analysis');
    if (aiSection) {
        aiSection.style.display = 'block';
        generateAIAnalysis(window._lastCalculationData || {});
        setTimeout(() => aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
}

// ── AI content generation (OpenAI) ───────────────────────────────

// API key is loaded from env-config.js (gitignored) via window.ENV_API
// Source of truth: .env  →  api=<key>
const _OKEY = (typeof window !== 'undefined' && window.ENV_API) ? window.ENV_API : '';
const AI_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function aiCacheKey(data, lang) {
    const s = JSON.stringify({
        s: data.system_size_kwp, p: data.panels_needed,
        pr: data.annual_production_kwh, c: data.estimated_cost_azn,
        h: data.house_size_m2, pe: data.people_count,
        d: data.daytime_occupancy, ec: data.electric_cooking,
        ac: data.heavy_ac, wh: data.water_heater,
        la: parseFloat(data.latitude  || 0).toFixed(2),
        lo: parseFloat(data.longitude || 0).toFixed(2)
    }) + lang;
    let hash = 0;
    for (let i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash |= 0; }
    return 'ai_v3_' + Math.abs(hash);
}

function readAICache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { d, ts } = JSON.parse(raw);
        if (Date.now() - ts > AI_CACHE_TTL) { localStorage.removeItem(key); return null; }
        return d;
    } catch { return null; }
}

function writeAICache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ d: data, ts: Date.now() }));
    } catch {
        // storage full — evict old AI cache entries
        Object.keys(localStorage).filter(k => k.startsWith('ai_v')).forEach(k => localStorage.removeItem(k));
        try { localStorage.setItem(key, JSON.stringify({ d: data, ts: Date.now() })); } catch {}
    }
}

function showAILoading() {
    const container = document.getElementById('ai-content');
    if (!container) return;
    const lang = (typeof getLanguage === 'function' ? getLanguage() : localStorage.getItem('az-energy-lang')) || 'en';
    const T = { en: 'AI is analyzing your system…', az: 'AI sisteminizi analiz edir…', ru: 'ИИ анализирует вашу систему…' };
    container.innerHTML = `
        <div class="ai-loading-label"><div class="ai-spinner"></div>${T[lang] || T.en}</div>
        <div class="ai-loading-state">
            ${[1,1,1,1].map(() => `
            <div class="ai-loading-row">
                <div class="ai-loading-icon"></div>
                <div class="ai-loading-lines">
                    <div class="ai-loading-line" style="width:55%"></div>
                    <div class="ai-loading-line" style="width:90%"></div>
                    <div class="ai-loading-line" style="width:75%"></div>
                </div>
            </div>`).join('')}
        </div>`;
}

function renderAIInsights(parsed) {
    const container = document.getElementById('ai-content');
    const disclaimerEl = document.getElementById('ai-disclaimer');
    if (!container) return;

    const insights = parsed.insights || [];
    container.innerHTML = insights.map(ins => `
        <div class="ai-insight">
            <div class="ai-insight-icon">${ins.icon || '💡'}</div>
            <div class="ai-insight-body">
                <strong>${ins.title || ''}</strong>
                <p>${ins.body || ''}</p>
            </div>
        </div>`).join('');

    if (disclaimerEl && parsed.disclaimer) {
        disclaimerEl.innerHTML = '⚠️ <strong>Note:</strong> ' + parsed.disclaimer;
    }
}

async function generateAIAnalysis(data) {
    const container = document.getElementById('ai-content');
    if (!container) return;

    const lang = (typeof getLanguage === 'function' ? getLanguage() : localStorage.getItem('az-energy-lang')) || 'en';
    const cacheKey = aiCacheKey(data, lang);
    const cached = readAICache(cacheKey);
    if (cached) { renderAIInsights(cached); return; }

    showAILoading();

    const langNames = { en: 'English', az: 'Azerbaijani', ru: 'Russian' };
    const langName  = langNames[lang] || 'English';

    const kWp        = parseFloat(data.system_size_kwp)         || 0;
    const production = parseInt(data.annual_production_kwh, 10) || 0;
    const cost       = parseInt(data.estimated_cost_azn, 10)    || 0;
    const roofArea   = parseInt(data.roof_area_m2, 10)          || 0;
    const solarYield = kWp > 0 ? Math.round(production / kWp)  : 1350;
    const annualSavings = Math.round(production * 0.12);

    const prompt = `You are a certified solar energy engineer specializing in Azerbaijan. Analyze the following solar system and respond ONLY in ${langName}.

SYSTEM DATA:
- Location: ${data.latitude}, ${data.longitude} (${data.location_name || 'Azerbaijan'})
- Panels: ${data.panels_needed} × 550W = ${kWp} kWp
- Annual production: ${production} kWh/yr  |  Solar yield: ${solarYield} kWh/kWp/yr (AZ avg: 1,350)
- Roof area needed: ${roofArea} m²  |  House: ${data.house_size_m2} m²
- Residents: ${data.people_count}  |  Daytime home: ${data.daytime_occupancy ? 'yes' : 'no'}
- Electric cooking: ${data.electric_cooking ? 'yes' : 'no'}  |  Heavy AC: ${data.heavy_ac ? 'yes' : 'no'}  |  Water heater: ${data.water_heater ? 'yes' : 'no'}
- System cost: ${cost} AZN  |  Est. annual savings: ${annualSavings} AZN (tariff 0.12 AZN/kWh)

Provide 7–9 insights. IMPORTANT: At least 2 must be TECHNICAL SETUP insights (non-obvious professional info) covering things like: inverter type recommendation (string vs micro) and why, DC cable sizing (mm²) for this system's short-circuit current, AC cable sizing from inverter to panel, grounding/earthing method and electrode resistance target (<10Ω), surge protection device (SPD) class and placement, MPPT voltage window matching for this kWp, monitoring system options and why they matter, Azerbaijani grid connection code requirements, protection relay settings.

Respond ONLY with this exact JSON (no markdown, no backticks):
{"insights":[{"icon":"emoji","title":"short title","body":"detailed explanation"},...],"disclaimer":"one-sentence disclaimer in ${langName} about consulting professionals"}`;

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _OKEY },
            body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 1800 })
        });
        if (!res.ok) throw new Error('OpenAI ' + res.status);
        const json  = await res.json();
        const raw   = json.choices[0].message.content.trim();
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON in response');
        const parsed = JSON.parse(match[0]);
        writeAICache(cacheKey, parsed);
        renderAIInsights(parsed);
    } catch (err) {
        console.error('AI analysis error:', err);
        const T = { en: 'Analysis could not be loaded. Please try again.', az: 'Analiz yüklənə bilmədi. Yenidən cəhd edin.', ru: 'Анализ не загрузился. Попробуйте снова.' };
        container.innerHTML = `<p class="ai-error-msg">⚠️ ${T[lang] || T.en}</p>`;
    }
}

// Re-run AI analysis when language changes (if AI section is visible)
window.addEventListener('langchange', function (e) {
    const aiSection = document.getElementById('ai-analysis');
    if (!aiSection || aiSection.style.display === 'none') return;
    const data = window._lastCalculationData;
    if (data) generateAIAnalysis(data);
});

// Submit calculator data to API (same endpoint as CECSO; non-blocking)
async function submitCalculatorData(phoneNumber, calculationData) {
    try {
        const emailField = document.getElementById('email');
        const nameField = document.getElementById('name');
        const payload = {
            phone_number: phoneNumber,
            email: emailField?.value || undefined,
            name: nameField?.value || undefined,
            ...calculationData
        };
        const response = await fetch('/api/solar-calculator-submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to submit calculator data:', error);
        console.warn('Data was not saved to database, but calculation is displayed');
        return null;
    }
}

// Run calculation directly — no phone modal
window.calculateSystem = function () {
    performCalculation(null);
};

// Run calculation (optionally with phone for API submission)
window.performCalculation = async function (phoneNumber) {
    const btn = document.querySelector('.btn-calculate');
    const btnText = document.getElementById('calc-btn-text');
    try {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
        btnText.textContent = 'Calculating...';

        const location = document.getElementById('location').value.trim();
        const houseSizeRaw = document.getElementById('house-size').value.trim();
        const houseSizeInput = parseFloat(houseSizeRaw);
        const peopleCount = Math.max(1, parseInt(document.getElementById('people-count').value, 10) || 1);
        const daytimeOccupancyEl = document.querySelector('input[name="daytime-occupancy"]:checked');
        const daytimeOccupancy = daytimeOccupancyEl ? daytimeOccupancyEl.value : 'yes';
        const roofLimit = parseFloat(document.getElementById('roof-area-limit').value);
        const tiltAngleInput = document.getElementById('tilt-angle').value;
        const orientationInput = document.getElementById('panel-orientation').value;

        const houseSizeEstimated = !houseSizeRaw || isNaN(houseSizeInput) || houseSizeInput <= 0;
        const houseSize = houseSizeEstimated ? getEstimatedHouseArea(peopleCount) : houseSizeInput;

        if (!location) {
            throw new Error('Please enter a location');
        }

        btnText.textContent = 'Fetching solar data...';
        const coords = await getCoordinates(location);
        if (!coords || !coords.lat || !coords.lon) {
            throw new Error('Could not determine location coordinates. Please check your location input.');
        }

        const advancedVisible = getComputedStyle(document.getElementById('advanced-options')).display !== 'none';
        const tiltAngle = (advancedVisible && tiltAngleInput && !isNaN(parseFloat(tiltAngleInput)))
            ? parseFloat(tiltAngleInput)
            : getOptimalTilt(coords.lat);
        const orientation = (advancedVisible && orientationInput && !isNaN(parseFloat(orientationInput)))
            ? parseFloat(orientationInput)
            : 180;

        const pvgisYield = await getPVGISYield(coords.lat, coords.lon, tiltAngle, orientation);
        if (!pvgisYield || pvgisYield <= 0) {
            throw new Error('Could not fetch solar data for this location. Please try another location.');
        }

        let baseConsumption = houseSize * 40;
        baseConsumption += peopleCount * 500;
        if (daytimeOccupancy === 'yes') baseConsumption *= 1.25;
        if (document.getElementById('electric-cooking').checked) baseConsumption += 1200;
        if (document.getElementById('heavy-ac').checked) baseConsumption += 2500;
        if (document.getElementById('water-heater').checked) baseConsumption += 1800;

        const panelWattage = 550;
        const neededKWp = baseConsumption / pvgisYield;
        const panelsNeeded = Math.ceil((neededKWp * 1000) / panelWattage);
        const areaPerPanel = 2.5;
        const neededArea = panelsNeeded * areaPerPanel;

        let actualPanels = panelsNeeded;
        let limitedByRoof = false;
        let coveragePercent = 100;
        let shortfallKWh = 0;

        if (roofLimit && !isNaN(roofLimit) && neededArea > roofLimit) {
            limitedByRoof = true;
            actualPanels = Math.floor(roofLimit / areaPerPanel);
            const actualKWp = (actualPanels * panelWattage) / 1000;
            const actualProduction = actualKWp * pvgisYield;
            coveragePercent = Math.round((actualProduction / baseConsumption) * 100);
            shortfallKWh = Math.round(baseConsumption - actualProduction);
        }

        const finalKWp = (actualPanels * panelWattage) / 1000;
        const finalProduction = finalKWp * pvgisYield;
        const finalArea = actualPanels * areaPerPanel;
        const estimatedCost = Math.round(finalKWp * 1000);

        const calculationData = {
            latitude: coords.lat.toString(),
            longitude: coords.lon.toString(),
            location_name: location,
            house_size_m2: Math.round(houseSize),
            people_count: peopleCount,
            daytime_occupancy: daytimeOccupancy === 'yes',
            electric_cooking: document.getElementById('electric-cooking').checked,
            heavy_ac: document.getElementById('heavy-ac').checked,
            water_heater: document.getElementById('water-heater').checked,
            panels_needed: actualPanels,
            system_size_kwp: finalKWp.toFixed(1),
            annual_production_kwh: Math.round(finalProduction),
            roof_area_m2: Math.round(finalArea),
            estimated_cost_azn: estimatedCost
        };

        // Store for AI analysis after payment
        window._lastCalculationData = calculationData;

        displayResults(actualPanels, finalKWp, finalProduction, finalArea, pvgisYield, coords, { tiltAngle, orientation, houseSizeEstimated, houseSize, peopleCount });

        const pvgisNote = document.getElementById('pvgis-note');
        let baseNote = `<strong>Data source:</strong> PVGIS 5.3 (SARAH) for location (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}) with ${tiltAngle}° tilt, ${orientation}° orientation.`;
        if (houseSizeEstimated) {
            const msg = (typeof window.getTranslation === 'function' && window.getTranslation('calculator.houseAreaEstimated'))
                ? window.getTranslation('calculator.houseAreaEstimated').replace('{area}', Math.round(houseSize)).replace('{people}', peopleCount)
                : `House area estimated: ${Math.round(houseSize)} m² from ${peopleCount} people.`;
            baseNote += `<p><strong>${msg}</strong></p>`;
        }
        if (limitedByRoof) {
            baseNote += `
            <div style="margin-top: 1.5rem; padding: 2rem; background: linear-gradient(135deg, rgba(255, 165, 0, 0.15), rgba(239, 68, 68, 0.1)); border-left: 4px solid #f59e0b; border-radius: 12px;">
                <div style="font-size: 1.2rem; font-weight: 700; color: #f59e0b; margin-bottom: 1rem;">⚠️ ROOF SPACE LIMITATION DETECTED</div>
                <p><strong>Required for full coverage:</strong> ${Math.round(neededArea)}m² roof space (${panelsNeeded} panels)</p>
                <p><strong>Available roof space:</strong> ${roofLimit}m²</p>
                <p><strong>Maximum panels you can install:</strong> ${actualPanels} panels</p>
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(46, 204, 113, 0.1); border-radius: 8px;">
                    <p><strong>Energy Coverage:</strong> <span style="font-size: 1.3rem; color: var(--primary-color); font-weight: 700;">${coveragePercent}%</span></p>
                    <p>Your system will generate <strong>${Math.round(finalProduction).toLocaleString()} kWh/year</strong></p>
                    <p>Annual consumption: <strong>${Math.round(baseConsumption).toLocaleString()} kWh/year</strong></p>
                    <p style="color: #f59e0b;">Remaining grid dependency: <strong>${shortfallKWh.toLocaleString()} kWh/year</strong> (${100 - coveragePercent}%)</p>
                </div>
                <p style="margin-top: 1rem; font-style: italic;">💡 <strong>Tip:</strong> Even with ${coveragePercent}% coverage, you'll significantly reduce your electricity bills and carbon footprint!</p>
            </div>`;
        }
        pvgisNote.innerHTML = baseNote;

    } catch (error) {
        console.error('Calculation error:', error);
        alert('❌ ' + (error.message || 'An error occurred during calculation. Please try again.'));
        const resultsEl = document.getElementById('results');
        if (resultsEl) resultsEl.classList.remove('show');
    } finally {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btnText.textContent = (typeof window.getTranslation === 'function' && window.getTranslation('calculator.calcBtn')) || 'Calculate System Size';
    }
}

// Orientation label for optimization tip (0=North, 90=East, 180=South, 270=West)
function getOrientationLabel(orientation) {
    const o = Math.round(Number(orientation));
    if (o === 0) return 'North (0°)';
    if (o === 90) return 'East (90°)';
    if (o === 180) return 'South (180°)';
    if (o === 270) return 'West (270°)';
    return `South (180°)`;
}

// Display results
function displayResults(panels, kWp, production, area, solarYield, coords, opts) {
    opts = opts || {};
    const tiltAngle = opts.tiltAngle != null ? opts.tiltAngle : (coords ? getOptimalTilt(coords.lat) : 35);
    const orientation = opts.orientation != null ? opts.orientation : 180;

    document.getElementById('main-result').textContent = panels;
    document.getElementById('system-size').textContent = kWp.toFixed(1);
    document.getElementById('annual-production').textContent = Math.round(production).toLocaleString();
    document.getElementById('roof-area').textContent = Math.round(area);
    document.getElementById('solar-yield').textContent = Math.round(solarYield);

    const estimatedCost = Math.round(kWp * 1000);
    document.getElementById('estimated-cost').textContent = estimatedCost.toLocaleString();
    const usdEl = document.getElementById('cost-usd-equiv');
    if (usdEl) usdEl.textContent = Math.round(estimatedCost / 1.7).toLocaleString();

    // Environmental impact
    const co2ReductionKg = production * 0.5; // 0.5 kg CO2 per kWh
    const co2ReductionTons = co2ReductionKg / 1000;
    const treeEquivalent = Math.round(co2ReductionKg / 21); // 21 kg CO2 per tree per year

    document.getElementById('co2-reduction').textContent = co2ReductionTons.toFixed(2);
    document.getElementById('tree-equivalent').textContent = treeEquivalent.toLocaleString();

    document.getElementById('opt-tilt').textContent = `${tiltAngle}°`;
    const optOrientEl = document.getElementById('opt-orientation');
    if (optOrientEl) optOrientEl.textContent = getOrientationLabel(orientation);

    if (window.lastSystemLoss) {
        const lossEl = document.getElementById('system-loss-display');
        if (lossEl) lossEl.textContent = window.lastSystemLoss + '%';
    }

    const resultsEl = document.getElementById('results');
    if (resultsEl) {
        resultsEl.classList.add('show');
        setTimeout(() => {
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    // Apply paywall over optimization tips (reset if re-calculating)
    const aiSection = document.getElementById('ai-analysis');
    if (aiSection) aiSection.style.display = 'none';
    setTimeout(applyPaywall, 400);
}

// Initialize map when page loads
window.addEventListener('load', () => {
    setTimeout(initMap, 100);
    initPaymentInputs();
});

function initPaymentInputs() {
    // Card number — auto-format with spaces
    const cardInput = document.getElementById('pay-card');
    if (cardInput) {
        cardInput.addEventListener('input', function () {
            let val = this.value.replace(/\D/g, '').slice(0, 16);
            this.value = val.replace(/(.{4})/g, '$1 ').trim();
            const preview = document.getElementById('card-number-preview');
            if (preview) {
                const padded = val.padEnd(16, '•');
                preview.textContent = padded.replace(/(.{4})/g, '$1 ').trim();
            }
        });
    }

    // Expiry — auto-insert slash
    const expiryInput = document.getElementById('pay-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function () {
            let val = this.value.replace(/\D/g, '').slice(0, 4);
            if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
            this.value = val;
            const preview = document.getElementById('card-expiry-preview');
            if (preview) preview.textContent = val || 'MM/YY';
        });
    }

    // Name — mirror to card preview
    const nameInput = document.getElementById('pay-name');
    if (nameInput) {
        nameInput.addEventListener('input', function () {
            const preview = document.getElementById('card-name-preview');
            if (preview) preview.textContent = this.value.toUpperCase() || 'AD SOYAD';
        });
    }
}
