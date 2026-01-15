import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const cursResponse = handleOptions(request);
    if (cursResponse) return cursResponse;

    try {
        const { action, pin, stage } = await request.json() as any;

        if (!pin || !action) {
            return errorResponse('Missing pin or action');
        }

        if (action === 'next_stage') {
            const { success } = await env.DB.prepare(
                `UPDATE games SET current_stage = ? WHERE pin = ?`
            ).bind(stage, pin).run();

            // Reset student answered status for new stage
            await env.DB.prepare(
                `UPDATE students SET has_answered = 0, current_stage = ? WHERE game_id = (SELECT id FROM games WHERE pin = ?)`
            ).bind(stage, pin).run();

            if (!success) return errorResponse('Failed to update stage', 500);

        } else if (action === 'start_game') {
            const { success } = await env.DB.prepare(
                `UPDATE games SET status = 'playing' WHERE pin = ?`
            ).bind(pin).run();

            if (!success) return errorResponse('Failed to start game', 500);

        } else if (action === 'archive_game') {
            const { success } = await env.DB.prepare(
                `UPDATE games SET status = 'archived' WHERE pin = ?`
            ).bind(pin).run();

            // When explicitly archiving, WE DO want to delete students
            await env.DB.prepare(
                `DELETE FROM students WHERE game_id = (SELECT id FROM games WHERE pin = ?)`
            ).bind(pin).run();

            if (!success) return errorResponse('Failed to archive game', 500);
        }

        return jsonResponse({ success: true });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
