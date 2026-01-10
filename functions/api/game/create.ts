import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const cursResponse = handleOptions(request);
    if (cursResponse) return cursResponse;

    try {
        const { questId, totalStages, pin } = await request.json() as any;

        if (!questId || !pin) {
            return errorResponse('Missing questId or pin');
        }

        const gameId = crypto.randomUUID();

        // Insert into D1
        const { success } = await env.DB.prepare(
            `INSERT INTO games (id, pin, status, current_stage, quest_id, total_stages) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(gameId, pin, 'idle', 1, questId, totalStages || 0).run();

        if (!success) {
            return errorResponse('Failed to create game in database', 500);
        }

        return jsonResponse({ success: true, gameId, pin });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
