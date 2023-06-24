import { Fragment, cloneVNode, h } from 'vue';

interface RenderOptions {
    as: string | Record<string, any>;
    props: Record<string, any>;
    children: any[];
}

export function render({ as: asComponent, props, children }: RenderOptions) {
    if (asComponent === 'template') {
        if (children.length !== 1) {
            throw new Error('Template can only have one child');
        }

        const child = cloneVNode(children[0], {
            ...props,
            ...children[0].props,
        });

        return h(Fragment, [child]);
    } else {
        return h(asComponent, props, children);
    }
};
