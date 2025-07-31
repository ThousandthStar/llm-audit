<script lang="ts">
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import { CalendarDate } from "@internationalized/date";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import Clock2Icon from "@lucide/svelte/icons/clock-2";

	export let value: CalendarDate | null;
	export let time: string | null;
</script>

<div class="w-fit py-4 flex flex-col gap-2">
	<div class="px-4">
		<Calendar type="single" bind:value class="bg-transparent p-0" />
	</div>
	<div class="flex flex-col gap-6 border-t px-4 !pt-4">
		<div class="flex w-full flex-col gap-3">
			<Label for="time-from">Time</Label>
			<div class="relative flex w-full items-center gap-2">
				<Clock2Icon
					class="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none"
				/>
				<Input
					id="time-from"
					type="time"
					step="1"
					bind:value={time}
					class="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
				/>
			</div>
		</div>
	</div>
</div>
