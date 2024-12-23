import type { UserState } from '$/types/types';
import { getContext, setContext } from 'svelte';

type State = {
    userState: UserState;
    title: string;
};

let state = $state<State>();

export const setState = (_state: State) => {
    state = _state;
    setContext('state', state);
};

export const getState = () => {
    return getContext<State>('state');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logged = (state: UserState): state is { logged: true; data: any } => {
    return state.logged;
};
