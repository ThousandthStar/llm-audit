import { currentState } from "$lib/server";
import type { RequestHandler } from "@sveltejs/kit";


export const DELETE: RequestHandler = async ({}) =>{
    while(currentState.length > 0){
        currentState.pop();
    }
    return new Response(JSON.stringify({message: "Cleared successfully"}), {status: 200});
}