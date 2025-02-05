import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string) => {
    return ['mine', 'others'].includes(param);
}) satisfies ParamMatcher;
