<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';

    let { value = $bindable(), id, invalid, ...props }: HTMLInputAttributes & { invalid?: string } = $props();

    let el = $state<HTMLInputElement>();
    $effect(() => {
        el?.setCustomValidity(invalid ?? '');
    });

    if (!id) {
        id = 'slider-default';
    }
</script>

<label for={id}>
    <input bind:this={el} {id} bind:checked={value} class="peer hidden" {...props} type="checkbox" />
    <div
        class="border-primary bg-background peer-checked:before:bg-accent before:bg-primary relative h-8 w-16 cursor-pointer rounded-full border-2 p-0.5 before:absolute before:block before:aspect-square before:h-6 before:rounded-full before:transition-all before:duration-200 before:content-[''] peer-checked:before:translate-x-[calc(100%_+_0.5rem)]"
    ></div>
</label>
