import _ from 'lodash';

import { BaseWriter } from './json';

export class JsonWriterMaster extends BaseWriter {
    protected buffer: unknown = {};

    public async init() {
        await super.init();
        this.stream.write('{"root":[');
    }

    public write(data: unknown) {
        if (!_.isEmpty(this.buffer)) {
            this.stream.write(`${JSON.stringify(this.buffer)},`);
        }

        this.buffer = data;
    }

    public end() {
        this.stream.write(`${JSON.stringify(this.buffer)}]}`);
    }
}
