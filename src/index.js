import { onClickOutside, useEventListener } from '@vueuse/core';
import dayjs from 'dayjs';
import {
    computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, watch,
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
        const panelRef = ref(null);
        const buttonRef = ref(null);

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
            panelRef,
            buttonRef,
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
    setup(props, { expose, slots }) {
        const context = inject(DatePickerContext);

        expose({ el: context.buttonRef, $el: context.buttonRef });

        return () => render({
            as: props.as,
            props: {
                ref: context.buttonRef,
                type: 'button',
                onClick: () => context.updatShowPanel(!context.showPanel.value),
            },
            children: slots.default(),
        });
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

        useEventListener('wheel', (e) => {
            if (!context.showPanel.value) {
                return;
            }

            const panel = context.panelRef.value;

            if (!panel) {
                return;
            }

            if (e.target.isSameNode(panel) || panel.contains(e.target)) {
                if (e.deltaY < 0 && e.target.scrollTop === 0) {
                    context.prevViewMonth();
                }

                if (e.deltaY > 0 && e.target.scrollTop === e.target.scrollHeight - e.target.clientHeight) {
                    context.nextViewMonth();
                }
            }
        });

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
            h('div', {
                ref: context.panelRef,
            }, slots.default({
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
    setup(props, { expose, slots }) {
        const context = inject(DatePickerContext);

        const itemRef = ref(null);

        const selected = computed(() => context.date.value.isSame(props.value, 'day'));
        const active = computed(() => context.activeDate.value?.isSame(props.value, 'day'));

        expose({ el: itemRef, $el: itemRef });

        watch(selected, () => {
            if (selected.value) {
                itemRef.value.focus();
            }
        });

        watch(active, () => {
            if (active.value) {
                itemRef.value.focus();
            }
        });

        return () => render({
            as: props.as,
            props: {
                ref: itemRef,
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
