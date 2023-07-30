import type { Meta, StoryObj } from '@storybook/vue3';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import DatePickerWithMultipleInputs from '@/stories/DatePickerWithMultipleInputs.vue';

const meta = {
    title: 'DatePickerWithMultipleInputs',
    component: DatePickerWithMultipleInputs,
    render: args => ({
        components: { DatePickerWithMultipleInputs },
        template: '<DatePickerWithMultipleInputs v-bind="args" />',
        setup: () => ({ args }),
    }),
} satisfies Meta<typeof DatePickerWithMultipleInputs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Input: Story = {
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const input1 = await canvas.getAllByRole('textbox')[0];
        const input2 = await canvas.getAllByRole('textbox')[1];

        // Type the date
        await userEvent.type(input1, '2021-01-07');

        // Type the time
        await userEvent.type(input2, '12:40');

        // Click enter to close the picker
        await userEvent.type(input2, '{enter}');

        // Make sure the inputs have the correct text
        await expect(
            input1,
        ).toHaveValue('2021-01-07');

        await expect(
            input2,
        ).toHaveValue('12:40');
    },
};

export const WithoutValue: Story = {
    args: {
        date: null,
    },
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const inputs = await canvas.getAllByRole('textbox');

        await expect(
            inputs[0],
        ).toHaveValue('XXXX-XX-XX');

        await expect(
            inputs[1],
        ).toHaveValue('XX:XX');
    },
};

export const AddsZeroAutomatically: Story = {
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const input1 = await canvas.getAllByRole('textbox')[0];
        const input2 = await canvas.getAllByRole('textbox')[1];

        // Type the date
        await userEvent.type(input1, '2021-01-07');

        // Type the time
        await userEvent.type(input2, '3:40');

        // Click enter to close the picker
        await userEvent.type(input2, '{enter}');

        // Make sure the inputs have the correct text
        await expect(
            input1,
        ).toHaveValue('2021-01-07');

        await expect(
            input2,
        ).toHaveValue('03:40');
    },
};
