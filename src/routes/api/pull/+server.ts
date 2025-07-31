import { currentState } from "$lib/server";
import type { RequestHandler } from "@sveltejs/kit";


export const GET: RequestHandler = async (_) => {
    return new Response(JSON.stringify({
        message: "Retrival successful",
        state: currentState
    }), {
        status: 200
    })
}