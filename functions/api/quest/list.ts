import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const corsResponse = handleOptions(request);
    if (corsResponse) return corsResponse;

    try {
        // Fetch all quests
        const { results: quests } = await env.DB.prepare('SELECT * FROM quests ORDER BY created_at DESC').all();

        // Parse problems JSON for each quest
        const parsedQuests = quests.map((q: any) => ({
            ...q,
            problems: JSON.parse(q.problems),
            musicUrl: q.music_url,
            timerDuration: q.timer_duration || 30,
            createdAt: q.created_at,
            updatedAt: q.updated_at
        }));

        return jsonResponse(parsedQuests);
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
