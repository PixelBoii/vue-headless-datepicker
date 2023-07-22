<script setup>
import DateTimePicker from './components/DateTimePicker.vue';
import DatePicker from './components/DatePicker.vue';
import DateTimePickerWithMultipleInputs from './components/DateTimePickerWithMultipleInputs.vue';
import BasicDatePicker from './components/BasicDatePicker.vue';
import BasicDatePickerWithInput from './components/BasicDatePickerWithInput.vue';
import DatePickerWithInputWithoutValue from './components/DatePickerWithInputWithoutValue.vue';
</script>

<template>
    <div class="p-12 flex items-start space-x-12 min-h-screen w-full bg-gray-800">
        <DateTimePicker />
    
        <DatePicker />

        <DateTimePickerWithMultipleInputs />

        <DatePickerWithInputWithoutValue />

        <BasicDatePicker />

        <BasicDatePickerWithInput />
    </div>
</template>
