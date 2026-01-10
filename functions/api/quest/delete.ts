import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const corsResponse = handleOptions(request);
    if (corsResponse) return corsResponse;

    try {
        const { id } = await request.json() as any;

        if (!id) {
            return errorResponse('Missing quest ID');
        }

        // Protect default quests
        if (['intro-algebra', 'linear-equations', 'finding-x-dance'].includes(id)) {
            return errorResponse('Cannot delete default quests', 403);
        }

        // Delete quest
        const { success } = await env.DB.prepare(
            `DELETE FROM quests WHERE id = ?`
        ).bind(id).run();

        if (!success) {
            return errorResponse('Failed to delete quest', 500);
        }

        return jsonResponse({ success: true });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
