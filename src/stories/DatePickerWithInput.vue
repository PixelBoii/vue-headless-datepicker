<script lang="ts" setup>
import {
    DatePicker, DatePickerInput, DatePickerCalendarItem, DatePickerPanel, DatePickerNavButton,
} from '../index.js';
import dayjs from 'dayjs';
import { ref } from 'vue';

const props = defineProps({
    date: {
        type: String,
        default: '2021-01-01 12:00',
    },
});

const date = ref(props.date ? dayjs(props.date) : null);
</script>

<template>
    <DatePicker
        v-model="date"
        v-slot="{ viewDate, date }"
    >
        <DatePickerInput
            class="bg-indigo-500 border-2 border-transparent text-white font-semibold rounded-lg px-3 py-2 aria-[invalid=true]:border-red-500 focus:outline-none focus:ring focus:ring-white"
            format="YYYY-MM-DD"
        />

        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <DatePickerPanel
                class="absolute mt-2 px-3 py-2 bg-indigo-200 rounded-lg overflow-hidden"
                v-slot="{ daysInCurrentMonth }"
            >
                <div class="flex justify-between py-1 px-2">
                    <DatePickerNavButton
                        class="text-sm"
                        direction="backward"
                    >
                        Prev
                    </DatePickerNavButton>

                    <div>
                        {{ viewDate.format('YYYY-MM') }}
                    </div>

                    <DatePickerNavButton
                        class="text-sm"
                        direction="forward"
                    >
                        Next
                    </DatePickerNavButton>
                </div>

                <div class="grid grid-cols-7 gap-1">
                    <DatePickerCalendarItem
                        v-for="day in daysInCurrentMonth"
                        :key="day.format('YYYY-MM-DD')"
                        :value="day"
                        as="template"
                        v-slot="{ selected, active }"
                    >
                        <button
                            class="p-3 hover:bg-indigo-300 rounded-lg"
                            :class="{
                                'bg-indigo-300': selected || active,
                                'text-gray-500': !viewDate.isSame(day, 'month') && !selected,
                            }"
                        >
                            {{ day.format('DD') }}
                        </button>
                    </DatePickerCalendarItem>
                </div>
            </DatePickerPanel>
        </Transition>
    </DatePicker>
</template>