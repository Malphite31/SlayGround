import { Env, handleOptions, jsonResponse, errorResponse } from '../../utils/db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Handle CORS
    const cursResponse = handleOptions(request);
    if (cursResponse) return cursResponse;

    try {
        const { studentId, isCorrect, stage } = await request.json() as any;

        if (!studentId) {
            return errorResponse('Missing studentId');
        }

        // 1. Get current score
        const student = await env.DB.prepare('SELECT score FROM students WHERE id = ?').bind(studentId).first();

        if (!student) {
            return errorResponse('Student not found', 404);
        }

        let newScore = (student.score as number) || 0;
        if (isCorrect) {
            newScore += 100;
        }

        // 2. Update Student: Set has_answered = 1, update score
        const { success } = await env.DB.prepare(
            `UPDATE students SET score = ?, has_answered = 1, current_stage = ? WHERE id = ?`
        ).bind(newScore, stage, studentId).run();

        if (!success) {
            return errorResponse('Failed to update score', 500);
        }

        return jsonResponse({ success: true, newScore });
    } catch (err: any) {
        return errorResponse(err.message, 500);
    }
};

export const onRequestOptions = handleOptions;
