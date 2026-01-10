import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const corsResponse = handleOptions(request);
    if (corsResponse) return corsResponse;

    try {
        const { id, title, description, problems } = await request.json() as any;

        if (!id || !title || !description || !problems) {
            return errorResponse('Missing required fields: id, title, description, problems');
        }

        const problemsJson = JSON.stringify(problems);

        // Update quest
        const { success } = await env.DB.prepare(
            `UPDATE quests SET title = ?, description = ?, problems = ?, updated_at = strftime('%s', 'now') WHERE id = ?`
        ).bind(title, description, problemsJson, id).run();

        if (!success) {
            return errorResponse('Failed to update quest', 500);
        }

        return jsonResponse({ success: true });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
