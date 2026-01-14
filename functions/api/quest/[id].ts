import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    // Handle CORS
    const corsResponse = handleOptions(request);
    if (corsResponse) return corsResponse;

    try {
        const id = params.id;

        if (!id) {
            return errorResponse('Missing quest ID');
        }

        // Fetch quest by ID
        const quest = await env.DB.prepare('SELECT * FROM quests WHERE id = ?').bind(id).first();

        if (!quest) {
            return errorResponse('Quest not found', 404);
        }

        // Parse problems JSON
        const parsedQuest = {
            ...quest,
            problems: JSON.parse(quest.problems as string),
            musicUrl: quest.music_url,
            createdAt: quest.created_at,
            updatedAt: quest.updated_at
        };

        return jsonResponse(parsedQuest);
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
