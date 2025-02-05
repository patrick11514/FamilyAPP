<script lang="ts">
    import { resolveSvelteClass } from '$/lib/functions';
    import type { BootstrapIcon } from '$/types/bootstrap_icons';
    import type { ClassValue, SvelteHTMLElements } from 'svelte/elements';

    let { children, class: cls = '', name, self = $bindable(), ...rest }: SvelteHTMLElements['i'] & { class?: ClassValue; name: BootstrapIcon; self?: HTMLElement } = $props();
</script>

<i bind:this={self} {...rest} role="button" tabindex="-1" class={['bi cursor-pointer', name, resolveSvelteClass(cls)]}>
    {@render children?.()}
</i>
