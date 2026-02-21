const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: CORS_HEADERS,
    });
}

export default {
    async fetch(request) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }
        if (request.method !== 'GET') {
            return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        const url = new URL(request.url);
        const lat = url.searchParams.get('lat');
        const lon = url.searchParams.get('lon');
        const tilt = url.searchParams.get('tilt') || '35';
        const aspect = url.searchParams.get('aspect') || '0';

        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        if (lat === null || lon === null || isNaN(latNum) || isNaN(lonNum)) {
            return jsonResponse({ error: 'Missing or invalid lat/lon' }, 400);
        }
        if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
            return jsonResponse({ error: 'Lat/lon out of range' }, 400);
        }

        const pvgisUrl = `https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=11&angle=${tilt}&aspect=${aspect}&outputformat=json`;

        try {
            const res = await fetch(pvgisUrl);
            if (!res.ok) {
                return jsonResponse(
                    { error: 'PVGIS unavailable', status: res.status },
                    502
                );
            }
            const data = await res.json();
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: CORS_HEADERS,
            });
        } catch (err) {
            return jsonResponse(
                { error: 'PVGIS unavailable', message: err.message },
                503
            );
        }
    },
};
