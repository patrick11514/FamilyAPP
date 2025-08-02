<script lang="ts">
    import { twMerge } from 'tailwind-merge';
    import { Entry, Slider } from '.';
    import Image from '../Image.svelte';

    let {
        id = '',
        value = $bindable([]),
        class: cls = '',
        accept = '',
        multiple = false
    }: {
        id?: string;
        value: (File | null)[];
        class?: string;
        accept?: string;
        multiple?: boolean;
    } = $props();

    let input: HTMLInputElement;

    const imageMimeTypes = [
        'image/jpeg', // JPEG images
        'image/png', // PNG images
        'image/gif', // GIF images
        'image/bmp', // BMP images
        'image/webp', // WebP images
        'image/tiff', // TIFF images
        'image/svg+xml', // SVG images
        'image/x-icon', // ICO images
        'image/heif', // HEIF images (high efficiency image format)
        'image/heic' // HEIC images (high efficiency image coding)
    ];

    let fileInfos = $state<
        (
            | {
                  image: false;
                  name: string;
                  size: number;
              }
            | {
                  image: true;
                  name: string;
                  size: number;
                  data: string;
              }
        )[]
    >([]);

    const onchange = () => {
        value = Array.from(input.files!);
        fileInfos = value
            .filter((f) => f !== null)
            .map((file) => {
                if (!imageMimeTypes.includes(file.type)) {
                    return {
                        image: false,
                        name: file.name,
                        size: file.size
                    };
                }

                return {
                    image: true,
                    name: file.name,
                    size: file.size,
                    data: URL.createObjectURL(file)
                };
            });
    };

    const onclick = () => {
        input.click();
    };

    const onkeypress = (
        ev: KeyboardEvent & {
            currentTarget: EventTarget & HTMLDivElement;
        }
    ) => {
        if (ev.key !== 'Enter') return;

        input.click();
    };

    const sufixes = {
        TB: 1000 * 1000 * 1000 * 1000,
        GB: 1000 * 1000 * 1000,
        MB: 1000 * 1000,
        KB: 1000,
        B: 1
    };

    const formatSize = (size: number) => {
        for (const [suffix, minSize] of Object.entries(sufixes)) {
            if (size >= minSize) {
                return (size / minSize).toFixed(2) + suffix;
            }
        }

        return '';
    };

    let capture = $state(false);
</script>

<input
    bind:this={input}
    {id}
    class="h-0 w-0 opacity-0"
    type="file"
    {onchange}
    {accept}
    {multiple}
    capture={capture ? 'environment' : undefined}
/>

<section class="flex flex-col gap-2">
    <Entry
        id="input-capture"
        label="Použít kameru pro zachycení?"
        row={true}
        small={true}
    >
        <Slider id="input-capture" bind:value={capture} />
    </Entry>

    <div
        tabindex={0}
        role="button"
        {onclick}
        {onkeypress}
        class={twMerge(
            'border-text bg-secondary font-poppins flex w-full cursor-pointer flex-wrap items-center justify-center gap-2 rounded-md border-2 p-2 text-xl font-bold lg:text-2xl',
            cls
        )}
    >
        {#if value.length == 0}
            Vyber soubor{#if multiple}y{/if}
        {:else}
            {#each fileInfos as file}
                <div
                    class="divide-text border-text flex flex-col divide-y-2 rounded-md border-2"
                >
                    {#if file.image}
                        <div class="mx-auto h-auto md:max-w-72 lg:max-w-80 xl:max-w-96">
                            <Image
                                class="rounded-t-[4px]"
                                name={file.data}
                                alt="File preview"
                            />
                        </div>
                    {/if}
                    <div class="justfiy-center flex flex-col items-center p-1">
                        <h1 class="text-lg break-all lg:text-xl">
                            {file.name}
                        </h1>
                        <h2 class="text-base font-medium lg:text-lg">
                            {formatSize(file.size)}
                        </h2>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</section>
