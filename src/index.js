import { onClickOutside, useEventListener } from '@vueuse/core';
import dayjs from 'dayjs';
import {
    Fragment, computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, watch,
} from 'vue';
import { render } from './utils/render';

const DatePickerContext = Symbol('DatePickerContext');

export const DatePicker = defineComponent({
    name: 'DatePicker',
    props: {
        modelValue: {
            type: dayjs.Dayjs,
            default: null,
        },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
        const containerRef = ref(null);
        const view = ref(null);
        const views = ref([]);
        const showPanel = ref(false);
        const date = ref(props.modelValue ? dayjs(props.modelValue) : dayjs());
        const activeDate = ref(null);
        const viewDate = ref(dayjs(date.value.startOf('month')));

        function nextView() {
            const nextView = views.value.find(e => e.order === view.value.order + 1);

            view.value = nextView ? nextView : (views.value[0] ?? null);
        }

        const context = {
            date,
            view,
            views,
            viewDate,
            showPanel,
            activeDate,
            updateDate: (value) => {
                date.value = value;
                activeDate.value = value;
                emit('update:modelValue', value);

                if (view.value?.autoNext) {
                    nextView();
                }
            },
            updateViewDate: (value) => viewDate.value = value,
            addView: (value) => {
                if (views.value.length === 0) {
                    view.value = value;
                }

                views.value.push(value);
            },
            removeView: (value) => views.value = views.value.filter(view => view.order !== value),
            updateView: (value) => view.value = value,
            prevViewMonth: () => viewDate.value = viewDate.value.subtract(1, 'month'),
            nextViewMonth: () => viewDate.value = viewDate.value.add(1, 'month'),
            updatShowPanel: (value) => showPanel.value = value,
            updateActiveDate: (value) => activeDate.value = value,
        };

        onClickOutside(containerRef, () => {
            view.value = 0;
            showPanel.value = false;
        });

        watch(view, () => {
            activeDate.value = date.value;
        });

        provide(DatePickerContext, context);

        return () => h('div', {
            ref: containerRef,
        }, slots.default({
            date: date.value,
            viewDate: viewDate.value,
            updateDate: context.updateDate,
            updateViewDate: context.updateViewDate,
            prevViewMonth: context.prevViewMonth,
            nextViewMonth: context.nextViewMonth,
        }));
    },
});

export const DatePickerButton = defineComponent({
    name: 'DatePickerButton',
    props: {
        as: {
            type: [String, Object],
            default: 'button',
        },
    },
    setup(props, { slots }) {
        const context = inject(DatePickerContext);

        return () => h(props.as === 'template' ? Fragment : props.as, {
            type: 'button',
            onClick: () => context.updatShowPanel(!context.showPanel.value),
        }, slots.default());
    },
});

export const DatePickerPanel = defineComponent({
    name: 'DatePickerPanel',
    setup(_, { slots }) {
        const context = inject(DatePickerContext);

        const daysInCurrentMonth = computed(() => Array.from({ length: 35 }, (_, i) => {
            return context.viewDate.value.startOf('week').add(i, 'day');
        }));

        function adjustActive(event, amount, unit) {
            if (!context.activeDate.value) {
                context.updateActiveDate(context.date.value);
            }

            const earliestDate = context.viewDate.value.startOf('month').startOf('week');
            const latestDate = earliestDate.add(34, 'day');

            let newDate = context.activeDate.value.add(amount, unit);

            if (newDate.isBefore(earliestDate)) {
                newDate = earliestDate;
            }

            if (newDate.isAfter(latestDate)) {
                newDate = latestDate;
            }

            context.updateActiveDate(newDate);
            event.preventDefault();
        }

        useEventListener('keydown', (event) => {
            if (!context.showPanel.value) {
                return;
            }

            if (event.key === 'Escape') {
                context.updatShowPanel(false);
                event.preventDefault();
            }

            if (event.key === 'ArrowLeft') {
                adjustActive(event, -1, 'day');
            }

            if (event.key === 'ArrowRight') {
                adjustActive(event, 1, 'day');
            }

            if (event.key === 'ArrowUp') {
                adjustActive(event, -1, 'week');
            }

            if (event.key === 'ArrowDown') {
                adjustActive(event, 1, 'week');
            }

            if (event.key === 'Enter' || event.key === ' ') {
                context.updateDate(context.activeDate.value);
                event.preventDefault();
            }
        });

        return () => context.showPanel.value ?
            h('div', slots.default({
                daysInCurrentMonth: daysInCurrentMonth.value,
            })) :
            null;
    },
});

export const DatePickerCalendarItem = defineComponent({
    name: 'DatePickerCalendarItem',
    props: {
        value: {
            type: dayjs.Dayjs,
            required: true,
        },
        as: {
            type: [String, Object],
            default: 'button',
        },
    },
    setup(props, { slots }) {
        const context = inject(DatePickerContext);

        const selected = computed(() => context.date.value.isSame(props.value, 'day'));
        const active = computed(() => context.activeDate.value?.isSame(props.value, 'day'));

        return () => render({
            as: props.as,
            props: {
                onClick: () => context.updateDate(props.value),
            },
            children: slots.default({
                selected: selected.value,
                active: active.value,
            }),
        });
    },
});

export const DatePickerView = defineComponent({
    name: 'DatePickerView',
    props: {
        order: {
            type: Number,
            default: null,
        },
        autoNext: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { slots }) {
        const context = inject(DatePickerContext);

        onMounted(() => {
            context.addView({
                order: props.order,
                autoNext: props.autoNext,
            });
        });

        onBeforeUnmount(() => {
            context.removeView(props.order);
        });

        return () => context.view.value?.order === props.order ?
            h('div', slots.default()) :
            null;
    },
});
