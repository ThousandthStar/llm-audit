<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as Popover from "$lib/components/ui/popover";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Command from "$lib/components/ui/command";
    import * as Dialog from "$lib/components/ui/dialog";
    import {
        FileUp,
        ChevronsUpDown,
        Check,
        Trash,
        ChevronDown,
        Save,
        CornerDownRight,
        SquareArrowOutUpRight,
        Download,
    } from "@lucide/svelte";
    import { cn } from "$lib/utils";
    import { tick } from "svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { Trigger } from "$lib/components/ui/dialog";
    import { CalendarDate } from "@internationalized/date";
    import PopoverContent from "$lib/components/ui/popover/popover-content.svelte";
    import Calendar_16 from "$lib/components/calendar-16.svelte";
    import { toast, Toaster } from "svelte-sonner";
    import type { Entry, PromptVersion } from "$lib/types";
    import * as Accordion from "$lib/components/ui/accordion";

    const models = [
        "o3",
        "o3-pro",
        "o4-mini",
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4.1-nano",
        "gpt-4o",
        "gpt-4o-mini",
        "Claude Opus 4",
        "Claude Sonnet 4",
        "Claude Sonnet 3.7",
        "Claude Sonnet 3.5",
        "Claude Haiku 3.5",
        "Gemini 2.5 Pro",
        "Gemini 2.5 Flash",
        "Gemini 2.5 Flash-Lite",
        "Llama 3.1 405B",
        "Llama 3.1 70B",
        "Llama 3.1 8B",
        "Llama 3.2 Vision 11B",
        "Llama 3.2 Vision 90B",
        "Llama 3.2 3B",
        "Llama 3.2 1B",
    ];

    let prompts = $state([{ version: "v1", prompt: "" }] as PromptVersion[]);

    let sources = $state([] as string[]);

    let value: string | null = $state(null);
    let openModel = $state(false);
    let triggerRefModel = $state<HTMLButtonElement>(null!);
    let openVersion = $state(false);
    let triggerRefVersion = $state<HTMLButtonElement>(null!);
    let sourceValue = $state("");
    let currentVersion = $state(prompts[0]);
    let promptVersionInputValue = $state("");
    let currentDate: CalendarDate | null = $state(null);
    let currentTime = $state(null);
    let openTimestamp = $state(false);
    let entries: Entry[] | null = $state(null);
    let tabValue = $state("add-entry");
    let jsonLoadValue = $state("");

    function closeAndFocusTrigger(ref: HTMLButtonElement) {
        openModel = false;
        openVersion = false;
        tick().then(() => {
            ref.focus();
        });
    }

    function addSource() {
        if (sourceValue == "") return;
        sources.push(sourceValue);
        sourceValue = "";
    }

    function addPromptVersion() {
        if (promptVersionInputValue == "") return;
        prompts.push({
            version: promptVersionInputValue,
            prompt: "",
        });
        promptVersionInputValue = "";
    }

    function setCurrentPromptVersion(version: string) {
        currentVersion = prompts.filter((value) => value.version == version)[0];
        closeAndFocusTrigger(triggerRefVersion);
    }

    async function postData() {
        const res = await fetch("/api/save", {
            method: "POST",
            body: JSON.stringify({
                prompts,
                date: currentDate,
                time: currentTime,
                sources,
                model: value,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (res.status == 200) {
            toast("Successfully uploaded!");
        } else {
            toast.error("Something went wrong.");
        }
        prompts = [{ version: "v1", prompt: "" }] as PromptVersion[];
        currentDate = null;
        currentTime = null;
        sources = [];
        value = null;
    }

    async function pull() {
        entries = await fetch("/api/pull", {
            method: "GET",
        })
            .then((res) => res.json())
            .then((parsed) => {
                toast("Pulled the current entries");
                return parsed.state;
            });
    }

    async function clear() {
        await fetch("/api/clear", {
            method: "DELETE",
        }).then((_) => pull());
    }

    async function load() {
        try {
            const data = jsonLoadValue;
            const entries: Entry[] = JSON.parse(data);
            entries.forEach((entry) => {
                fetch("/api/save", {
                    body: JSON.stringify(entry),
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            });
            pull();
            tabValue = "view-entries";
            jsonLoadValue = "";
            toast.success("Successfully loaded JSON!");
        } catch (_) {
            toast.error("Failed to load JSON!");
        }
    }
</script>

<div class="flex items-center justify-center h-screen w-screen bg-muted">
    <Toaster richColors />
    <Card.Root
        class="w-screen max-w-[calc(100vw-40px)] h-screen max-h-[calc(100vh-40px)]"
    >
        <Card.Header>
            <Card.Title class="text-lg font-bold"
                >LLM traceability and audit system</Card.Title
            >
            <Card.Action>
                <Dialog.Root>
                    <Dialog.Trigger>
                        <Button>
                            <FileUp />Load JSON
                        </Button>
                    </Dialog.Trigger>

                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Load JSON</Dialog.Title>
                            <Dialog.Description
                                >Paste your JSON file's content into the text
                                box.</Dialog.Description
                            >
                        </Dialog.Header>
                        <Textarea
                            class="h-50 max-h-50"
                            bind:value={jsonLoadValue}
                        ></Textarea>
                        <Dialog.Footer>
                            <Dialog.Close>
                                <Button onclick={load}>Load JSON</Button>
                            </Dialog.Close>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Root>
                <Button href="/api/download" download>
                    <Download />
                    Download JSON
                </Button>
            </Card.Action>
        </Card.Header>
        <Card.Content>
            <Tabs.Root value={tabValue}>
                <Tabs.List>
                    <Tabs.Trigger value="add-entry">Add Entry</Tabs.Trigger>
                    <Tabs.Trigger onclick={pull} value="view-entries">
                        View entries</Tabs.Trigger
                    >
                </Tabs.List>
                <div class="h=full">
                    <Tabs.Content value="add-entry">
                        <div class="flex gap-5 h-[calc(100vh-230px)]">
                            <!-- Left panel -->
                            <div class="flex flex-col gap-2 w-800 h-full">
                                <!-- Top section -->
                                <div class="flex justify-between">
                                    <!-- Version input -->
                                    <div class="flex gap-2 items-end">
                                        <div class="flex flex-col gap-2">
                                            <Label>Prompt version</Label>
                                            <Popover.Root
                                                bind:open={openVersion}
                                            >
                                                <Popover.Trigger
                                                    bind:ref={triggerRefVersion}
                                                    class="flex flex-start"
                                                >
                                                    <Button variant="outline">
                                                        {currentVersion.version ??
                                                            "Add a version"}
                                                        <ChevronDown />
                                                    </Button>
                                                </Popover.Trigger>
                                                <Popover.Content class="w-60">
                                                    <div
                                                        class="flex flex-col gap-2"
                                                    >
                                                        {#each prompts as prompt}
                                                            <Button
                                                                variant="ghost"
                                                                class="w-full flex justify-start"
                                                                onclick={() =>
                                                                    setCurrentPromptVersion(
                                                                        prompt.version,
                                                                    )}
                                                                >{prompt.version}</Button
                                                            >
                                                            <Separator />
                                                        {/each}
                                                        <Input
                                                            bind:value={
                                                                promptVersionInputValue
                                                            }
                                                            placeholder="Enter a new prompt version"
                                                        />
                                                        <Button
                                                            class="w-full"
                                                            onclick={addPromptVersion}
                                                            ><Check /> Add</Button
                                                        >
                                                    </div>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                    </div>
                                    <!-- Timestamp & Model input -->
                                    <div class="flex gap-5 items-end">
                                        <!--Timestamp input-->
                                        <div class="flex flex-col gap-2">
                                            <Label>Timestamp</Label>
                                            <Popover.Root
                                                bind:open={openTimestamp}
                                            >
                                                <Popover.Trigger>
                                                    <Button
                                                        variant="outline"
                                                        class="w-50 flex flex-start text-start justify-between"
                                                    >
                                                        {currentDate
                                                            ? currentDate
                                                                  .toString()
                                                                  .trim()
                                                            : "Select date"}
                                                        {currentTime ?? ""}
                                                        <ChevronDown />
                                                    </Button>
                                                </Popover.Trigger>
                                                <PopoverContent>
                                                    <Calendar_16
                                                        bind:value={currentDate}
                                                        bind:time={currentTime}
                                                    />
                                                </PopoverContent>
                                            </Popover.Root>
                                        </div>
                                        <!--END TIMESTAMP INPUT-->
                                        <!-- MODEL CHOICE POPOVER -->
                                        <div class="flex flex-col gap-2">
                                            <Label>Model</Label>
                                            <Popover.Root bind:open={openModel}>
                                                <Popover.Trigger
                                                    bind:ref={triggerRefModel}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        class="w-50 flex justify-between"
                                                    >
                                                        {value ||
                                                            "Select a model"}
                                                        <ChevronsUpDown
                                                            class="ml-2 size-4 shrink-0 opacity-50"
                                                        />
                                                    </Button>
                                                </Popover.Trigger>
                                                <Popover.Content>
                                                    <Command.Root>
                                                        <Command.Input
                                                            placeholder="Search model..."
                                                        />
                                                        <Command.List>
                                                            <Command.Empty
                                                                >No model found.</Command.Empty
                                                            >
                                                            <Command.Group>
                                                                {#each models as model}
                                                                    <Command.Item
                                                                        value={model}
                                                                        onSelect={() => {
                                                                            value =
                                                                                model;
                                                                            closeAndFocusTrigger(
                                                                                triggerRefModel,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            class={cn(
                                                                                "mr size-4",
                                                                                value !==
                                                                                    model &&
                                                                                    "text-transparent",
                                                                            )}
                                                                        />
                                                                        {model}
                                                                    </Command.Item>
                                                                {/each}
                                                            </Command.Group>
                                                        </Command.List>
                                                    </Command.Root>
                                                </Popover.Content>
                                            </Popover.Root>
                                        </div>
                                        <!--END MODEL CHOICE POPOVER-->
                                    </div>
                                </div>
                                <!-- Prompt input -->
                                <div class="flex-1 flex flex-col">
                                    <Textarea
                                        placeholder="Enter your prompt here"
                                        class="flex-1 min-h-0 resize-y"
                                        bind:value={currentVersion.prompt}
                                    ></Textarea>
                                </div>
                            </div>
                            <!-- Right panel -->
                            <div class="flex flex-col gap-2 h-full max-w-50">
                                <!--SOURCES INOUT-->
                                <Label>Sources</Label>
                                <div class="flex gap-2">
                                    <Input
                                        bind:value={sourceValue}
                                        class="w-50"
                                        placeholder="Enter a new source"
                                    />
                                    <Button onclick={addSource}>
                                        <Check />
                                    </Button>
                                </div>
                                <ScrollArea
                                    class="w-full rounded-md border p-4 flex-1 min-h-0 overflow-auto"
                                >
                                    {#each sources as source}
                                        <div class="flex flex-col gap-0 mb-2">
                                            <div
                                                class="flex justify-between items-center h-10"
                                            >
                                                <span
                                                    >{source.slice(0, 15) +
                                                        "..."}</span
                                                >
                                                <Button
                                                    onclick={() =>
                                                        sources.splice(
                                                            sources.indexOf(
                                                                source,
                                                            ),
                                                            1,
                                                        )}
                                                    variant="ghost"
                                                    class="size-8"
                                                    ><Trash
                                                        color="red"
                                                    /></Button
                                                >
                                            </div>
                                            <Separator />
                                        </div>
                                    {/each}
                                </ScrollArea>
                            </div>
                            <!--END SOURCES INPUT-->
                        </div>
                        <div class="flex w-full justify-end pt-2">
                            <Button class="w-30" onclick={postData}
                                ><Save />Save Entry</Button
                            >
                        </div>
                    </Tabs.Content>
                </div>
                <Tabs.Content value="view-entries">
                    <Button onclick={clear}>Clear</Button>
                    {#if entries?.length == 0}
                        <h1 class="flex justify-center">No data</h1>
                    {/if}
                    <ScrollArea class="h-120">
                        <div class="flex flex-col gap-5 h-400 items-center">
                            {#each entries as entry}
                                <Card.Root class="w-200">
                                    <Card.Header>
                                        <Card.Title>
                                            {entry.date
                                                ? new CalendarDate(
                                                      entry.date.era,
                                                      entry.date.year,
                                                      entry.date.month,
                                                      entry.date.day,
                                                  )
                                                : "No date provided"}, {entry.time ??
                                                "No time provided"}
                                        </Card.Title>
                                        <Card.Description>
                                            {entry.model
                                                ? `Using ${entry.model}`
                                                : "No model provided"}
                                        </Card.Description>
                                    </Card.Header>
                                    <Card.Content>
                                        <strong>Prompts</strong>
                                        <Accordion.Root>
                                            {#each entry.prompts as prompt}
                                                <Accordion.Item>
                                                    <Accordion.Trigger>
                                                        {prompt.version}
                                                    </Accordion.Trigger>
                                                    <Accordion.Content>
                                                        <p
                                                            class="whitespace-pre-wrap break-word"
                                                        >
                                                            {prompt.prompt}
                                                        </p>
                                                    </Accordion.Content>
                                                </Accordion.Item>
                                            {/each}
                                        </Accordion.Root>
                                        <br />
                                        <strong>Sources</strong>
                                        <ul>
                                            {#each entry.sources as source}
                                                <li>
                                                    <a
                                                        href={source}
                                                        class="flex gap-2 items-center"
                                                        ><CornerDownRight
                                                        />{source}<SquareArrowOutUpRight
                                                            size={12}
                                                        /></a
                                                    >
                                                </li>
                                            {/each}
                                        </ul>
                                    </Card.Content>
                                </Card.Root>
                            {/each}
                        </div>
                    </ScrollArea>
                </Tabs.Content>
            </Tabs.Root>
        </Card.Content>
    </Card.Root>
</div>
