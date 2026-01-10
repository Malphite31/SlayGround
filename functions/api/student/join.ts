import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const cursResponse = handleOptions(request);
    if (cursResponse) return cursResponse;

    try {
        const { pin, name, studentId } = await request.json() as any;

        if (!pin || !name || !studentId) {
            return errorResponse('Missing pin, name, or studentId');
        }

        // Check if game exists
        const game = await env.DB.prepare('SELECT id, status FROM games WHERE pin = ?').bind(pin).first();

        if (!game) {
            return errorResponse('Game not found', 404);
        }

        if (game.status === 'finished') {
            return errorResponse('Game has already finished', 400);
        }

        // Insert Student
        const { success } = await env.DB.prepare(
            `INSERT INTO students (id, game_id, name, score, current_stage) VALUES (?, ?, ?, 0, 1)`
        ).bind(studentId, game.id, name).run();

        if (!success) {
            // It might be duplicate ID, just return success if already joined
            return jsonResponse({ success: true, gameId: game.id });
        }

        return jsonResponse({ success: true, gameId: game.id });
    } catch (err: any) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return jsonResponse({ success: true }); // Already joined
        }
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
