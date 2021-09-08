import type Hermione from 'hermione';
export declare type HermioneHandler = keyof Pick<Hermione, 'on' | 'prependListener' | 'intercept'>;
export declare type HermioneEvent = Hermione.EVENTS[keyof Hermione.EVENTS];
