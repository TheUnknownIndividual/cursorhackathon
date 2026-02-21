const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: CORS_HEADERS,
    });
}

function buildPrompt(data, langName) {
    const kWp = parseFloat(data.system_size_kwp) || 0;
    const production = parseInt(data.annual_production_kwh, 10) || 0;
    const roofArea = parseInt(data.roof_area_m2, 10) || 0;
    const solarYield = kWp > 0 ? Math.round(production / kWp) : 1350;
    const annualSavings = Math.round(production * 0.12);

    return `You are a certified solar energy engineer specializing in Azerbaijan. Analyze the following solar system and respond ONLY in ${langName}.

SYSTEM DATA:
- Location: ${data.latitude}, ${data.longitude} (${data.location_name || 'Azerbaijan'})
- Panels: ${data.panels_needed} × 550W = ${kWp} kWp
- Annual production: ${production} kWh/yr  |  Solar yield: ${solarYield} kWh/kWp/yr (AZ avg: 1,350)
- Roof area needed: ${roofArea} m²  |  House: ${data.house_size_m2} m²
- Residents: ${data.people_count}  |  Daytime home: ${data.daytime_occupancy ? 'yes' : 'no'}
- Electric cooking: ${data.electric_cooking ? 'yes' : 'no'}  |  Heavy AC: ${data.heavy_ac ? 'yes' : 'no'}  |  Water heater: ${data.water_heater ? 'yes' : 'no'}
- System cost: ${data.estimated_cost_azn} AZN  |  Est. annual savings: ${annualSavings} AZN (tariff 0.12 AZN/kWh)

Provide 7–9 insights. IMPORTANT: At least 2 must be TECHNICAL SETUP insights (non-obvious professional info) covering things like: inverter type recommendation (string vs micro) and why, DC cable sizing (mm²) for this system's short-circuit current, AC cable sizing from inverter to panel, grounding/earthing method and electrode resistance target (<10Ω), surge protection device (SPD) class and placement, MPPT voltage window matching for this kWp, monitoring system options and why they matter, Azerbaijani grid connection code requirements, protection relay settings.

Respond ONLY with this exact JSON (no markdown, no backticks):
{"insights":[{"icon":"emoji","title":"short title","body":"detailed explanation"},...],"disclaimer":"one-sentence disclaimer in ${langName} about consulting professionals"}`;
}

export default {
    async fetch(request) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }
        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.trim() === '') {
            return jsonResponse(
                { error: 'AI analysis not configured' },
                503
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ error: 'Invalid JSON body' }, 400);
        }

        const { data, lang } = body;
        if (!data || typeof data !== 'object') {
            return jsonResponse({ error: 'Missing or invalid data' }, 400);
        }

        const langNames = { en: 'English', az: 'Azerbaijani', ru: 'Russian' };
        const langName = langNames[lang] || 'English';
        const prompt = buildPrompt(data, langName);

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1800,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                return jsonResponse(
                    { error: 'OpenAI error', status: res.status, detail: errText },
                    502
                );
            }

            const json = await res.json();
            const raw = json.choices?.[0]?.message?.content?.trim() || '';
            const match = raw.match(/\{[\s\S]*\}/);
            if (!match) {
                return jsonResponse(
                    { error: 'Invalid OpenAI response format' },
                    502
                );
            }
            const parsed = JSON.parse(match[0]);
            return jsonResponse(parsed);
        } catch (err) {
            return jsonResponse(
                { error: 'AI analysis failed', message: err.message },
                503
            );
        }
    },
};
