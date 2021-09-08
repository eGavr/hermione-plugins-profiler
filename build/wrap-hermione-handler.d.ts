import type Hermione from 'hermione';
import { HermioneHandler } from './types';
import { IWriter } from './writer';
export declare function wrapHermioneHandler(listenerName: HermioneHandler, hermione: Hermione, writer: IWriter): void;
