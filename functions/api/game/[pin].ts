import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    // Handle CORS
    const cursResponse = handleOptions(request);
    if (cursResponse) return cursResponse;

    try {
        const pin = params.pin;

        if (!pin) {
            return errorResponse('Missing PIN');
        }

        // Fetch Game
        const game = await env.DB.prepare('SELECT * FROM games WHERE pin = ?').bind(pin).first();

        if (!game) {
            return errorResponse('Game not found', 404);
        }

        // Fetch Students
        const { results: students } = await env.DB.prepare('SELECT * FROM students WHERE game_id = ?').bind(game.id).all();

        return jsonResponse({
            ...game,
            students: students || []
        });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
