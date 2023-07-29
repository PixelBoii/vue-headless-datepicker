# Vue Headless Datepicker

Simple and easy-to-use headless datepicker for vue!

## Prerequisites

You need to have dayjs installed for this package to work as intended. You can install it like this:

```sh
npm i dayjs
```

## Installation

The package can be installed using the below command.

```sh
npm i vue-headless-datepicker
```

## Usage

The styling is entirely up to you, but this simple example should show the basics of how the package is meant to work. For more examples, you can look in the `src/stories` folder.

Note: This example uses tailwindcss, which is a separate package you'd need to install. The component work just fine with regular CSS as well, though.

```vue
<script setup>
import {
    DatePicker, DatePickerButton, DatePickerCalendarItem, DatePickerPanel, DatePickerNavButton,
} from 'vue-headless-datepicker';
import dayjs from 'dayjs';
import { ref } from 'vue';

const date = ref(dayjs());
</script>

<template>
    <DatePicker
        v-model="date"
        v-slot="{ viewDate, date }"
    >
        <DatePickerButton class="bg-indigo-500 text-white font-semibold rounded-lg px-3 py-2">
            {{ date.format('YYYY-MM-DD HH:mm') }}
        </DatePickerButton>

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
```

## Storybook

The examples available in the `src/stories` folder are also available as a storybook. You can run it by cloning the repository and running the below command:

```sh
npm run storybook
```

From there, storybook should be available at `http://localhost:6006` in your browser. If the port is already in use, another port may be used instead.

## Contributing

Feel free to suggest changes through either the issues tab or as a pull request! I'll try to take a look as soon as possible.

You can also ask questions using the discussion tab as needed, but I can't guarantee any support that way.


