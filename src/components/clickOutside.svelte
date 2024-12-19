<script lang="ts">
    import type { Snippet } from 'svelte';

    /**
     * Source: https://svelte.dev/repl/0ace7a508bd843b798ae599940a91783?version=3.16.7
     */
    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (node && !node.contains(event.target as Node | null) && !event.defaultPrevented) {
                clickoutside();
            }
        };

        document.addEventListener('click', handleClick, true);

        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
            }
        };
    }

    const {
        children,
        class: cls = '',
        clickoutside
    }: {
        children: Snippet;
        class?: string;
        clickoutside: () => void;
    } = $props();
</script>

<div class={cls} use:clickOutside>{@render children()}</div>
