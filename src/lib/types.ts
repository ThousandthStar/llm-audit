import type { CalendarDate } from "@internationalized/date";

export interface Entry {
    prompts?: PromptVersion[];
    date?: CalendarDate;
    time?: string;
    sources?: string[];
    model: string;
}

export interface PromptVersion {
    version: string;
    prompt: string;
}