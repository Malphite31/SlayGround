import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const corsResponse = handleOptions(request);
    if (corsResponse) return corsResponse;

    try {
        const { title, description, problems, musicUrl, timerDuration } = await request.json() as any;

        if (!title || !description || !problems) {
            return errorResponse('Missing required fields: title, description, problems');
        }

        const id = crypto.randomUUID();
        const problemsJson = JSON.stringify(problems);

        //Insert quest
        const { success } = await env.DB.prepare(
            `INSERT INTO quests (id, title, description, problems, music_url, timer_duration) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(id, title, description, problemsJson, musicUrl || null, timerDuration || 30).run();

        if (!success) {
            return errorResponse('Failed to create quest', 500);
        }

        return jsonResponse({ success: true, id });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
