# FamilyAPP

Appka, kterou používáme v rodině.

## Features

- [ ] Rozvrhávač - zobrazování rozvrhů pro jednotlivé dny
- [ ] Dárkovník - seznam dárků, které chceme na narozeniny/vánoce
- [x] Dlužníček - seznam dluhů v rodině (například koupím nákup a zadám taťkovi, že mi dluží za něho peníze)
- [ ] Datumovník - kalednář s akcema, které jdou přidávat do google kalendáře
- [ ] Poznámkovník - seznam osobních, nebo veřejných poznámek, do kterých lze přispívat

## Technologies

- [SvelteKit](https://svelte.dev) - Frontend + Backend
- MariaDB - Databáze
- [SvelteKitPWA](https://github.com/vite-pwa/sveltekit) - PWA pro mobilní appku
- [Svelte Adapter Node](https://svelte.dev/docs/kit/adapter-node) - Build pro Node.js server

## Development

```bash
git clone https://github.com/patrick11514/familyapp.git # clone repa
cd familyapp
npm install # instalace dependencies
```

Nyní je důležité si nastavit env variables.

```bash
cp .env.example .env
```

Development + build

```bash
npm run dev # spuštění dev serveru

npm run build # build aplikace
npm run start # spuštění produkčního serveru
```

_Při buildu jsou environment variables static, tedy se nahradí v kódu. Pokud toto chování nechcete, importujte si env variables přes $env/dynamic/private místo $env/static/private_
