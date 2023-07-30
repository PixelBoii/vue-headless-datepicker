import type { Meta, StoryObj } from '@storybook/vue3';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import DatePickerWithInput from '@/stories/DatePickerWithInput.vue';

const meta = {
    title: 'DatePickerWithInput',
    component: DatePickerWithInput,
    render: args => ({
        components: { DatePickerWithInput },
        template: '<DatePickerWithInput v-bind="args" />',
        setup: () => ({ args }),
    }),
} satisfies Meta<typeof DatePickerWithInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Input: Story = {
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const input = await canvas.getByRole('textbox');

        // Type the date
        await userEvent.type(input, '2021-01-07');

        // Make sure it's open
        await expect(
            canvas.queryByText('2021-01'),
        ).toBeInTheDocument();

        let date = await canvas.getByText('07');

        // Make sure the date is selected
        await expect(
            date,
        ).toHaveClass('bg-indigo-300');

        // Click enter to close the picker
        await userEvent.type(input, '{enter}');

        // Wait for the picker to close
        await new Promise(resolve => setTimeout(resolve, 200));

        // Make sure it is closed
        await expect(
            canvas.queryByText('2021-01'),
        ).not.toBeInTheDocument();
    },
};

export const WithoutValue: Story = {
    args: {
        date: null,
    },
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const input = await canvas.getByRole('textbox');

        expect(
            input,
        ).toHaveValue('XXXX-XX-XX');
    },
};
