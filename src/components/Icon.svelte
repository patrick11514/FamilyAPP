<script lang="ts">
    import { resolveSvelteClass } from '$/lib/functions';
    import type { BootstrapIcon } from '$/types/bootstrap_icons';
    import type { ClassValue, SvelteHTMLElements } from 'svelte/elements';

    const { children, class: cls = '', name, ...rest }: SvelteHTMLElements['i'] & { class?: ClassValue; name: BootstrapIcon } = $props();
</script>

<i {...rest} role="button" tabindex="-1" class={['bi cursor-pointer', name, resolveSvelteClass(cls)]}>
    {@render children?.()}
</i>
