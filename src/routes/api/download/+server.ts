import { currentState } from "$lib/server";
import type { RequestHandler } from "@sveltejs/kit";




export const GET: RequestHandler = async ({}) => {
    const json = JSON.stringify(currentState);
    return new Response(json, {
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="export.json"'
        }
    })
}