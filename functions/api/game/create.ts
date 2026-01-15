import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const cursResponse = handleOptions(request);
    if (cursResponse) return cursResponse;

    try {
        const { questId, totalStages, pin, timerDuration } = await request.json() as any;

        if (!questId || !pin) {
            return errorResponse('Missing questId or pin');
        }

        const gameId = crypto.randomUUID();

        // Ensure single active game: Finish all other running games
        await env.DB.prepare(
            `UPDATE games SET status = 'finished' WHERE status IN ('idle', 'playing')`
        ).run();

        // Ensure fresh start: Delete any existing game with this PIN
        await env.DB.prepare(
            `DELETE FROM students WHERE game_id IN (SELECT id FROM games WHERE pin = ?)`
        ).bind(pin).run();

        await env.DB.prepare(
            `DELETE FROM games WHERE pin = ?`
        ).bind(pin).run();

        // Insert into D1 with timer_duration
        const { success } = await env.DB.prepare(
            `INSERT INTO games (id, pin, status, current_stage, quest_id, total_stages, timer_duration) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(gameId, pin, 'idle', 1, questId, totalStages || 0, timerDuration || 30).run();

        if (!success) {
            return errorResponse('Failed to create game in database', 500);
        }

        return jsonResponse({ success: true, gameId, pin });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
