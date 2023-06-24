<script setup>
import {
    DatePicker, DatePickerButton, DatePickerCalendarItem, DatePickerPanel, DatePickerView,
} from 'vue-headless-datepicker';
import dayjs from 'dayjs';
import { ref } from 'vue';

const date = ref(dayjs());
</script>

<template>
    <DatePicker
        v-model="date"
        v-slot="{ prevViewMonth, nextViewMonth, viewDate, date }"
    >
        <DatePickerButton class="bg-indigo-500 text-white font-semibold rounded-lg px-3 py-2">
            {{ date.format('YYYY-MM-DD HH:mm') }}
        </DatePickerButton>

        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <DatePickerPanel
                class="absolute mt-2 px-3 py-2 bg-indigo-200 rounded-lg overflow-hidden w-96"
                v-slot="{ daysInCurrentMonth, hoursInCurrentDay, minutesInCurrentHour }"
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

                <DatePickerView
                    class="grid grid-cols-7 gap-1"
                    view-role="calendar-month"
                    :order="0"
                >
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
                </DatePickerView>

                <DatePickerView
                    class="grid grid-cols-2 gap-2"
                    :order="1"
                    :auto-next="false"
                >
                    <div class="h-72 overflow-y-auto">
                        <DatePickerCalendarItem
                            v-for="hour in hoursInCurrentDay"
                            :key="`hour-${hour.format('HH')}`"
                            class="p-3 hover:bg-indigo-300 rounded-lg w-full"
                            :class="{
                                'bg-indigo-300': viewDate.isSame(hour, 'hour')
                            }"
                            :value="hour"
                        >
                            {{ hour.format('HH') }}
                        </DatePickerCalendarItem>
                    </div>

                    <div class="h-72 overflow-y-auto">
                        <DatePickerCalendarItem
                            v-for="minute in minutesInCurrentHour"
                            :key="`minute-${minute.format('mm')}`"
                            class="py-2 px-6 hover:bg-indigo-300 rounded-lg w-full"
                            :class="{
                                'bg-indigo-300': viewDate.isSame(minute, 'minute')
                            }"
                            :value="minute"
                        >
                            {{ minute.format('mm') }}
                        </DatePickerCalendarItem>
                    </div>
                </DatePickerView>
            </DatePickerPanel>
        </Transition>
    </DatePicker>
</template>