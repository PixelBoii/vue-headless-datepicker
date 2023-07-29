import type { StorybookConfig } from '@storybook/vue3-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
    ],
    framework: {
        name: '@storybook/vue3-vite',
        options: {},
    },
    viteFinal: async (config) => {
        if (!config.resolve) {
            config.resolve = {};
        }

        config.resolve.alias = {
            ...config.resolve.alias || {},
            '@': resolve(__dirname, '../src'),
        };

        return config;
    },
};
export default config;
