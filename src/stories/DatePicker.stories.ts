import type { Meta, StoryObj } from '@storybook/vue3';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import DatePicker from '@/stories/DatePicker.vue';

const meta = {
    title: 'DatePicker',
    component: DatePicker,
    render: args => ({
        components: { DatePicker },
        template: '<DatePicker v-bind="args" />',
        setup: () => ({ args }),
    }),
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Showing: Story = {
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const pickerButton = await canvas.getByRole('button');
        await userEvent.click(pickerButton);

        await expect(
            canvas.getByText('2021-01'),
        ).toBeInTheDocument();

        await expect(
            canvas.getByText('2021-01-01 12:00'),
        ).toBeInTheDocument();
    },
};

export const Selecting: Story = {
    play: async ({ canvasElement }: any) => {
        // Show the picker
        const canvas = within(canvasElement);
        const pickerButton = await canvas.getByRole('button');
        await userEvent.click(pickerButton);

        // Select a date
        const date = await canvas.getByText('07');
        await userEvent.click(date);

        await expect(
            canvas.getByText('2021-01'),
        ).toBeInTheDocument();

        await expect(
            canvas.getByText('2021-01-07 00:00'),
        ).toBeInTheDocument();
    },
};

export const SwitchMonth: Story = {
    play: async ({ canvasElement }: any) => {
        // Show the picker
        const canvas = within(canvasElement);
        const pickerButton = await canvas.getByRole('button');
        await userEvent.click(pickerButton);

        // Go to next month
        const nextMonthButton = await canvas.getByText('Next');
        await userEvent.click(nextMonthButton);

        await expect(
            canvas.getByText('2021-02'),
        ).toBeInTheDocument();

        // Go to previous month
        const previousMonthButton = await canvas.getByText('Prev');
        await userEvent.click(previousMonthButton);

        await expect(
            canvas.getByText('2021-01'),
        ).toBeInTheDocument();

        await expect(
            canvas.getByText('2021-01-01 12:00'),
        ).toBeInTheDocument();
    },
};

export const ArrowSelecting: Story = {
    play: async ({ canvasElement }: any) => {
        // Show the picker
        const canvas = within(canvasElement);
        const pickerButton = await canvas.getByRole('button');
        await userEvent.click(pickerButton);

        // Move down once
        await userEvent.keyboard('{arrowdown}');

        // Make sure element has focus
        await expect(
            canvas.getByText('08'),
        ).toHaveFocus();

        // Click enter
        await userEvent.keyboard('{enter}');

        await expect(
            canvas.getByText('2021-01'),
        ).toBeInTheDocument();

        await expect(pickerButton.textContent).toBe('2021-01-08 00:00');
    },
};

export const FocusSwitchMonth: Story = {
    play: async ({ canvasElement }: any) => {
        // Show the picker
        const canvas = within(canvasElement);
        const pickerButton = await canvas.getByRole('button');
        await userEvent.click(pickerButton);

        // Focus on prev button
        const prevButton = await canvas.getByText('Prev');
        await prevButton.focus();

        // Press enter
        await userEvent.keyboard('{enter}');

        await expect(
            canvas.getByText('2020-12'),
        ).toBeInTheDocument();

        // Focus on next button
        const nextButton = await canvas.getByText('Next');
        await nextButton.focus();

        // Press enter twice
        await userEvent.keyboard('{enter}');
        await userEvent.keyboard('{enter}');

        await expect(
            canvas.getByText('2021-02'),
        ).toBeInTheDocument();
    },
};

export const WithoutValue: Story = {
    args: {
        date: null,
    },
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const pickerButton = await canvas.getByRole('button');

        await expect(pickerButton.textContent).toBe('Select date');
    },
};

