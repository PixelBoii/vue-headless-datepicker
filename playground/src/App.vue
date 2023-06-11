<script setup>
import DateTimePicker from './components/DateTimePicker.vue';
import DatePicker from './components/DatePicker.vue';
import BasicDatePicker from './components/BasicDatePicker.vue';
</script>

<template>
    <div class="p-12 flex space-x-12 min-h-screen w-full bg-gray-800">
        <DateTimePicker />
    
        <DatePicker />

        <BasicDatePicker />
    </div>
</template>
