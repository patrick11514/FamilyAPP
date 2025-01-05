<script lang="ts" generics="$Row extends Record<string, string>">
    import type { Snippet } from 'svelte';

    type Data = {
        [$Key in keyof $Row]:
            | $Row[$Key]
            | undefined
            | Snippet
            | {
                  colspan: number;
                  value: $Row[$Key] | Snippet;
              };
    }[];

    const {
        head,
        data
    }: {
        head: {
            [$Key in keyof $Row]: string;
        };
        data: Data;
    } = $props();

    const values = <$Object extends object>(obj: $Object): $Object[keyof $Object][] => {
        return Object.values(obj);
    };

    console.log(data);
</script>

<table class="w-full border-collapse border-2 border-text">
    <thead>
        <tr class="border-2 border-text">
            {#each Object.values(head) as key}
                <th class="border-2 border-text">{key}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each data as row}
            <tr class="border-2 border-text">
                {#each values(row) as item}
                    {#if typeof item === 'object'}
                        {#if typeof item.value === 'function'}
                            <td class="border-2 border-text" colspan={item.colspan}>{@render item.value()}</td>
                        {:else}
                            <td class="border-2 border-text" colspan={item.colspan}>{item.value}</td>
                        {/if}
                    {:else if typeof item === 'function'}
                        <td class="border-2 border-text">{@render item()}</td>
                    {:else if item !== undefined}
                        <td class="border-2 border-text">{item}</td>
                    {/if}
                {/each}
            </tr>
        {/each}
    </tbody>
</table>
