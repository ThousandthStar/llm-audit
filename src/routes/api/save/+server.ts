import { currentState, type Entry } from "$lib/server";
import type { RequestHandler } from "@sveltejs/kit"


export const POST: RequestHandler = async ({request}) => {
    try {
        const entry: Entry = await request.json()
        currentState.push(entry);
        return new Response(JSON.stringify({message: "Success!"}), {status: 200})
    }catch (_) {
        return new Response(JSON.stringify({ message : "Something went wrong"}), {status: 500})
    }
}