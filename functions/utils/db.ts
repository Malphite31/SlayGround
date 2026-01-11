export interface Env {
    DB: D1Database;
}

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper: Handle CORS preflight
export function handleOptions(request: Request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }
}

// Helper: Standardized JSON response
export function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0' 
        },
    });
}

// Helper: Error response
export function errorResponse(message: string, status = 400) {
    return jsonResponse({ error: message }, status);
}
