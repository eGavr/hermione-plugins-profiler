import type Hermione from 'hermione';

export type HermioneHandler = keyof Pick<
    Hermione,
    'on' | 'prependListener' | 'intercept'
>;

export type HermioneEvent =
    Hermione['events'][keyof Hermione['events']];
