import { onClickOutside, useEventListener } from '@vueuse/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import {
    PropType, Ref, computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, watch,
} from 'vue';
import { render } from './utils/render.js';

dayjs.extend(customParseFormat);

const DatePickerContext = Symbol('DatePickerContext');

interface DatePickerContextView {
    order: number;
    autoNext: boolean;
};

interface DatePickerContext {
    date: Ref<dayjs.Dayjs | null>;
    view: Ref<DatePickerContextView | null>;
    views: Ref<DatePickerContextView[]>;
    viewDate: Ref<dayjs.Dayjs>;
    showPanel: Ref<boolean>;
    activeDate: Ref<dayjs.Dayjs | null>;
    panelRef: Ref<HTMLElement>;
    buttonRef: Ref<HTMLElement>;
    inputRef: Ref<HTMLElement>;
    updateDate: (value: dayjs.Dayjs) => void;
    updateViewDate: (value: dayjs.Dayjs) => void;
    addView: (value: DatePickerContextView) => void;
    removeView: (value: number) => void;
    updateView: (value: DatePickerContextView) => void;
    prevViewMonth: () => void;
    nextViewMonth: () => void;
    updateShowPanel: (value: boolean) => void;
    updateActiveDate: (value: dayjs.Dayjs) => void;
};

const DatePickerViewRole = {
    CALENDAR_YEAR: 'calendar-year',
    CALENDAR_MONTH: 'calendar-month',
    TIME: 'time',
};

const DatePickerFormat = {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm',
    DATE_TIME: 'YYYY-MM-DD HH:mm',
};

type DatePickerFormats = 'YYYY-MM-DD' | 'HH:mm' | 'YYYY-MM-DD HH:mm';

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
        const containerRef: Ref<HTMLElement | null> = ref(null);
        const view: Ref<DatePickerContextView | null> = ref(null);
        const views: Ref<DatePickerContextView[]> = ref([]);
        const showPanel: Ref<boolean> = ref(false);
        const date: Ref<dayjs.Dayjs | null> = ref(props.modelValue ? dayjs(props.modelValue) : dayjs());
        const activeDate: Ref<dayjs.Dayjs | null> = ref(null);
        const viewDate: Ref<dayjs.Dayjs | null> = ref(dayjs(date.value));
        const panelRef: Ref<HTMLElement | null> = ref(null);
        const buttonRef: Ref<HTMLElement | null> = ref(null);
        const inputRef: Ref<HTMLElement | null> = ref(null);

        function nextView() {
            const nextView = views.value.find(e => e.order === view.value.order + 1);

            view.value = nextView ? nextView : (views.value[0] ?? null);
        }

        const context: DatePickerContext = {
            date,
            view,
            views,
            viewDate,
            showPanel,
            activeDate,
            panelRef,
            buttonRef,
            inputRef,
            updateDate: (value: dayjs.Dayjs | null) => {
                date.value = value;
                viewDate.value = value;
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
            updateShowPanel: (value) => showPanel.value = value,
            updateActiveDate: (value) => activeDate.value = value,
        };

        onClickOutside(containerRef, () => {
            view.value = null;
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
        const context: DatePickerContext = inject(DatePickerContext);

        expose({ el: context.buttonRef, $el: context.buttonRef });

        return () => render({
            as: props.as,
            props: {
                ref: context.buttonRef,
                type: 'button',
                onClick: () => context.updateShowPanel(!context.showPanel.value),
            },
            children: slots.default(),
        });
    },
});

export const DatePickerInput = defineComponent({
    name: 'DatePickerInput',
    props: {
        as: {
            type: [String, Object],
            default: 'input',
        },
        format: {
            type: String as PropType<DatePickerFormats | null>,
            default: DatePickerFormat.DATE_TIME as DatePickerFormats | null,
            validator: (value: DatePickerFormats | null) => Object.values(DatePickerFormat).includes(value),
        },
    },
    setup(props, { expose, slots }) {
        const context: DatePickerContext = inject(DatePickerContext);

        const placeholder = computed(() => props.format.replaceAll(/[a-zA-Z]/g, 'X'));
        const inputFormat = computed(() => props.format.replaceAll(' ', '').replaceAll('-', '').replaceAll(':', ''));

        const input = ref(context.date.value?.format(inputFormat.value) ?? '');
        const shouldStartOver = ref(true);
        const editing = ref(false);

        const isInvalid = computed(() => !dateIsValid.value && input.value.length > 0);

        const inputWithPlaceholder = computed(() => {
            let finalStr = '';
            let inputIndex = 0;

            for (let placeholderIndex = 0; placeholderIndex < placeholder.value.length; placeholderIndex++) {
                let placeholderChar = placeholder.value[placeholderIndex];

                if (placeholderChar === ' ' || placeholderChar === '-' || placeholderChar === ':') {
                    finalStr += placeholderChar;
                    continue;
                }

                if (input.value[inputIndex]) {
                    finalStr += input.value[inputIndex];
                } else {
                    finalStr += placeholderChar;
                }

                inputIndex++;
            }

            return finalStr;
        });

        const dateIsValid = computed(() => {
            const dates = [];

            if (props.format === DatePickerFormat.DATE_TIME) {
                const dateAndTime = dayjs(input.value, 'YYYYMMDDHHmm', true);
                const dateAndHours = dayjs(input.value, 'YYYYMMDDHH', true);

                dates.push(dateAndTime, dateAndHours);
            }

            if (props.format === DatePickerFormat.DATE || props.format === DatePickerFormat.DATE_TIME) {
                const date = dayjs(input.value, 'YYYYMMDD', true);
                const dateAndMonth = dayjs(input.value, 'YYYYMM', true);
                const yearDate = dayjs(input.value, 'YYYY', true);

                dates.push(date, dateAndMonth, yearDate);
            }

            if (props.format === DatePickerFormat.TIME) {
                const baseDate = context.date.value.format('YYYYMMDD');

                const time = dayjs(`${baseDate}${input.value}`, 'YYYYMMDDHHmm', true);
                const hours = dayjs(`${baseDate}${input.value}`, 'YYYYMMDDHH', true);

                dates.push(time, hours);
            }

            const validDate = dates.find(date => date.isValid());

            return validDate;
        });

        expose({ el: context.inputRef, $el: context.inputRef });

        watch(context.date, () => {
            if (context.date.value && !editing.value) {
                input.value = context.date.value.format(inputFormat.value);
                shouldStartOver.value = true;
            }
        });

        return () => render({
            as: props.as,
            props: {
                ref: context.inputRef,
                type: 'text',
                value: inputWithPlaceholder.value,
                style: {
                    caretColor: 'transparent',
                },
                ariaInvalid: isInvalid.value,
                onClick: () => context.updateShowPanel(true),
                onBlur: () => {
                    editing.value = false;

                    if (dateIsValid.value) {
                        input.value = dateIsValid.value.format(inputFormat.value);
                    } else {
                        shouldStartOver.value = true;
                    }
                },
                onKeydown: (event: KeyboardEvent) => {
                    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
                        return;
                    }

                    event.preventDefault();

                    if (shouldStartOver.value || (!editing.value && event.key === 'Backspace')) {
                        input.value = '';
                    }

                    shouldStartOver.value = false;
                    editing.value = true;

                    if (event.key === 'Backspace') {
                        input.value = input.value.slice(0, -1);
                        return;
                    }

                    if (event.key === 'Escape') {
                        context.updateShowPanel(false);
                        shouldStartOver.value = true;
                        editing.value = false;
                    }

                    if (event.key === 'Enter') {
                        if (dateIsValid.value) {
                            context.updateDate(dateIsValid.value);
                        }

                        context.updateShowPanel(false);
                        shouldStartOver.value = true;
                        editing.value = false;
                    }

                    if (event.key.match(/[0-9]/) && input.value.length < 12) {
                        input.value += event.key;
                    }

                    if (dateIsValid.value) {
                        context.updateDate(dateIsValid.value);
                    }
                },
            },
        });
    },
});

export const DatePickerPanel = defineComponent({
    name: 'DatePickerPanel',
    setup(_, { slots }) {
        const context: DatePickerContext = inject(DatePickerContext);

        const daysInCurrentMonth = computed(() => Array.from({ length: 35 }, (_, i) => {
            return context.viewDate.value.startOf('month').startOf('week').add(i, 'day');
        }));

        const hoursInCurrentDay = computed(() => Array.from({ length: 24 }, (_, i) => {
            return context.viewDate.value.startOf('day').add(i, 'hour');
        }));

        const minutesInCurrentHour = computed(() => Array.from({ length: 60 }, (_, i) => {
            return context.viewDate.value.startOf('hour').add(i, 'minute');
        }));

        function adjustActive(event: Event, amount: number, unit: dayjs.ManipulateType) {
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

        useEventListener('keydown', (event: KeyboardEvent) => {
            if (!context.showPanel.value) {
                return;
            }

            if (event.key === 'Escape') {
                context.updateShowPanel(false);
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
                hoursInCurrentDay: hoursInCurrentDay.value,
                minutesInCurrentHour: minutesInCurrentHour.value,
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
        const context: DatePickerContext = inject(DatePickerContext);

        const itemRef = ref(null);

        const selected = computed(() => context.date.value.isSame(props.value, 'day'));
        const active = computed(() => context.activeDate.value?.isSame(props.value, 'day'));

        const focusingOnTrigger = computed(() => 
            document.activeElement?.isSameNode(context.buttonRef.value) ||
            document.activeElement?.isSameNode(context.inputRef.value)
        );

        expose({ el: itemRef, $el: itemRef });

        watch(selected, () => {
            if (selected.value && !focusingOnTrigger.value) {
                itemRef.value.focus();
            }
        });

        watch(active, () => {
            if (active.value && !focusingOnTrigger.value) {
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
            type: Boolean as PropType<boolean>,
            default: true as boolean,
        },
        viewRole: {
            type: String as PropType<typeof DatePickerViewRole[keyof typeof DatePickerViewRole] | null>,
            default: null as typeof DatePickerViewRole[keyof typeof DatePickerViewRole] | null,
            validator: (value: typeof DatePickerViewRole[keyof typeof DatePickerViewRole] | null) => Object.values(DatePickerViewRole).includes(value),
        },
    },
    setup(props, { slots }) {
        const context: DatePickerContext = inject(DatePickerContext);

        const viewRef = ref(null);

        const shouldShow = computed(() => context.view.value?.order === props.order && context.showPanel.value);

        onMounted(() => {
            context.addView({
                order: props.order,
                autoNext: props.autoNext,
            });
        });

        function prevPeriod() {
            if (props.viewRole === DatePickerViewRole.CALENDAR_MONTH) {
                context.viewDate.value = context.viewDate.value.subtract(1, 'month');
            }

            if (props.viewRole === DatePickerViewRole.CALENDAR_YEAR) {
                context.viewDate.value = context.viewDate.value.subtract(1, 'year');
            }
        }

        function nextPeriod() {
            if (props.viewRole === DatePickerViewRole.CALENDAR_MONTH) {
                context.viewDate.value = context.viewDate.value.add(1, 'month');
            }

            if (props.viewRole === DatePickerViewRole.CALENDAR_YEAR) {
                context.viewDate.value = context.viewDate.value.add(1, 'year');
            }
        }

        if (props.viewRole) {
            useEventListener('wheel', (e: WheelEvent) => {
                if (!shouldShow.value) {
                    return;
                }

                const target = e.target as HTMLElement;

                if (!viewRef.value) {
                    return;
                }

                if (target.isSameNode(viewRef.value) || viewRef.value.contains(target)) {
                    if (e.deltaY < 0 && target.scrollTop === 0) {
                        prevPeriod();
                    }

                    if (e.deltaY > 0 && target.scrollTop === target.scrollHeight - target.clientHeight) {
                        nextPeriod();
                    }
                }
            });
        }

        onBeforeUnmount(() => {
            context.removeView(props.order);
        });

        return () => shouldShow.value ?
            h('div', {
                ref: viewRef,
            }, slots.default()) :
            null;
    },
});
