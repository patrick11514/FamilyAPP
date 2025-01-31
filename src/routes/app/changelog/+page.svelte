<script lang="ts">
    import type { PageData } from './$types';
    import showdown from 'showdown';

    const { data }: { data: PageData } = $props();

    const converter = new showdown.Converter();

    const htmls = data.changelog.map((md) => converter.makeHtml(md));
</script>

<div class="divide-primary prose prose-invert mx-auto flex w-full flex-1 flex-col gap-2 divide-y text-lg">
    {#each htmls as html}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <div>{@html html}</div>
    {/each}
</div>
