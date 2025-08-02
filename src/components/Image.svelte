<script lang="ts">
    import type { ImageExtension } from '$/routes/images/[name]/+server';
    import type { ClassValue } from 'svelte/elements';

    const {
        class: cls,
        alt,
        name,
        quality = 75,
        format = 'jpg'
    }: {
        class?: ClassValue;
        alt: string;
        name: string;
        quality?: number;
        format?: ImageExtension;
    } = $props();

    let src = name.includes('/')
        ? name
        : `/images/${name}?format=${format}&quality=${quality}`;
</script>

<img class={cls} {alt} {src} />
