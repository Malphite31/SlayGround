import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const corsResponse = handleOptions(request);
    if (corsResponse) return corsResponse;

    try {
        // Get the most recent active game (idle or playing)
        // ORDER BY ROWID DESC gets the most recently inserted row
        const result = await env.DB.prepare(
            `SELECT * FROM games WHERE status IN ('idle', 'playing') ORDER BY ROWID DESC LIMIT 1`
        ).first();

        if (!result) {
            return jsonResponse({ game: null });
        }

        return jsonResponse({ game: result });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
