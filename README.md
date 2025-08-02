# FamilyAPP

Appka, kterou používáme v rodině.

## Features

- [ ] Rozvrhávač - zobrazování rozvrhů pro jednotlivé dny
- [x] Dárkovník - seznam dárků, které chceme na narozeniny/vánoce
- [x] Dlužníček - seznam dluhů v rodině (například koupím nákup a zadám taťkovi, že mi dluží za něho peníze)
- [x] Datumovník - kalednář s akcema, které jdou přidávat do google kalendáře
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

Vysvětlení:
HOST + PORT - na kterém interface a portu se bindne server
ORIGIN - reálná adresa kde bude web (https://example.com)
DATABASE\_\* - údaje k databázi
JWT_SECRET - tajný klíč pro JWT tokeny, který se používá pro autentizaci
FILE_FOLDER - cesta, kam se budou ukládat nahrané soubory
MAX_FILE_SIZE - maximální velikost nahrávaného souboru v bytech, používá se v JS pro validaci
BODY_SIZE_LIMIT - maximální velikost requestu, který server zpracuje, používá SvelteKit node server
PUBLIC_VAPI_KEY + PRIVATE_VAPI_KEY - one-line command na vygenerování klíčů:

```bash
echo -e "const k=require('web-push').generateVAPIDKeys();console.log(\`PUBLIC_VAPI_KEY=\${k.publicKey}\\nPRIVATE_VAPI_KEY=\${k.privateKey}\`)" | node
```

ENERGYFACE_ID - pokud máte doma zařízení s controllerem od EnergyFace, tak se jedná o ID, pod kterým se přihlašujete (ID).

Po nastavení env je potřeba spustit migraci databáze

```bash
npm run migrate
```

Development + build

```bash
npm run dev # spuštění dev serveru

npm run build # build aplikace
npm run start # spuštění produkčního serveru
```

_Při buildu jsou environment variables static, tedy se nahradí v kódu. Pokud toto chování nechcete, importujte si env variables přes $env/dynamic/private místo $env/static/private_
