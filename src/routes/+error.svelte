<script lang="ts">
    import Title from '$/components/headers/Title.svelte';
    import Link from '$/components/Link.svelte';
    import { page } from '$app/state';

    const error = page.status;
</script>

<div class="m-auto text-center">
    <Title>Tak toto se nepovedlo</Title>
    <h2 class="font-poppins font-bold">
        {#if error == 404}
            Jsi někde, kde to neznáme
        {/if}
    </h2>
    {#if error === 404}
        <Link link="/">Zpátky na hlavní stránku</Link>
    {/if}
</div>
