import webPush from 'web-push';
import fs from 'node:fs';

const keys = webPush.generateVAPIDKeys();

const env = fs.readFileSync('.env.example', 'utf-8');
const newEnv = env.replace('PUBLIC_VAPI_KEY=', `PUBLIC_VAPI_KEY=${keys.publicKey}`).replace('PRIVATE_VAPI_KEY=', `PRIVATE_VAPI_KEY=${keys.privateKey}`);
fs.writeFileSync('.env', newEnv);
