import { error, json, type RequestHandler } from '@sveltejs/kit';
import Path from 'node:path';
import fs from 'node:fs';
import { FILE_FOLDER } from '$env/static/private';

const extensions = ['jpg', 'jpeg', 'png'];

export const GET = (async ({ params, setHeaders }) => {
    if (!params.name) {
        error(400, 'Name is required');
    }

    const parsed = Path.parse(params.name);
    if (!extensions.includes(parsed.ext.substring(1))) {
        error(404, 'File not found');
    }

    if (!fs.existsSync(FILE_FOLDER)) {
        error(404, 'File not found');
    }

    const filePath = Path.join(FILE_FOLDER, params.name);

    if (!fs.existsSync(filePath)) {
        error(404, 'File not found');
    }

    const fileInfo = fs.statSync(filePath);
    const content = fs.readFileSync(filePath);

    setHeaders({
        'Content-Type': `image/${parsed.ext.substring(1)}`,
        'Content-Length': fileInfo.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable'
    });

    return new Response(content);
}) satisfies RequestHandler;
