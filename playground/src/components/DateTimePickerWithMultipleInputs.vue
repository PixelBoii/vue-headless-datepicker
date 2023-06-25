<script setup>
import {
    DatePicker, DatePickerInput, DatePickerCalendarItem, DatePickerPanel,
} from 'vue-headless-datepicker';
import dayjs from 'dayjs';
import { ref } from 'vue';

const date = ref(dayjs().subtract(5, 'days'));
</script>

<template>
    <DatePicker
        v-model="date"
        v-slot="{ prevViewMonth, nextViewMonth, viewDate, date }"
    >
        <div class="flex items-center space-x-2">
            <DatePickerInput
                class="bg-indigo-500 border-2 border-transparent text-white font-semibold rounded-lg px-3 py-2 aria-[invalid=true]:border-red-500 focus:outline-none focus:ring focus:ring-white w-36"
                format="YYYY-MM-DD"
            />

            <DatePickerInput
                class="bg-indigo-500 border-2 border-transparent text-white font-semibold rounded-lg px-3 py-2 aria-[invalid=true]:border-red-500 focus:outline-none focus:ring focus:ring-white w-24"
                format="HH:mm"
            />
        </div>

        <DatePickerPanel
            class="absolute mt-2 px-3 py-2 bg-indigo-200 rounded-lg overflow-hidden"
            v-slot="{ daysInCurrentMonth }"
        >
            <div class="flex justify-between py-1 px-2">
                <button
                    class="text-sm"
                    @click="prevViewMonth"
                >
                    Prev
                </button>

                <div>
                    {{ viewDate.format('YYYY-MM') }}
                </div>

                <button
                    class="text-sm"
                    @click="nextViewMonth"
                >
                    Next
                </button>
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
                        class="p-3 hover:bg-indigo-300 rounded-lg focus:outline-none"
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
    </DatePicker>
</template>