import type Testplane from 'testplane';

export type TestplaneHandler = keyof Pick<
    Testplane,
    'on' | 'prependListener' | 'intercept'
>;

export type TestplaneEvent =
    Testplane['events'][keyof Testplane['events']];
