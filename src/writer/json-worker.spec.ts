const writeStreamMock = {
    write: jest.fn(),
    end: jest.fn(),
};
const createWriteStreamMock = jest.fn();
const ensureDirMock = jest.fn();

const fs = {
    ensureDir: ensureDirMock,
    createWriteStream:
        createWriteStreamMock.mockReturnValue(writeStreamMock),
};

jest.mock('fs-extra', () => fs);

import { JsonWriterWorker } from './json-worker';

describe('JsonWriterWorker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('init', () => {
        test('should init writer with root node', async () => {
            const writer = new JsonWriterWorker('reporter_dir');

            await writer.init();

            expect(ensureDirMock).toBeCalledWith('reporter_dir');
            expect(createWriteStreamMock).toBeCalledWith(
                'reporter_dir/plugins.json',
                { autoClose: true, flags: 'a' }
            );
            expect(writeStreamMock.write).not.toBeCalled();
        });
    });

    describe('write', () => {
        test('should write data directly to the stream', async () => {
            const writer = new JsonWriterWorker('reporter_dir');

            await writer.init();
            writeStreamMock.write.mockClear();

            writer.write({ some: 'data' });

            expect(writeStreamMock.write).toBeCalledWith(
                '{"some":"data"},'
            );
        });
    });

    describe('end', () => {
        test('should not write on end', async () => {
            const writer = new JsonWriterWorker('reporter_dir');

            await writer.init();
            writeStreamMock.write.mockClear();

            writer.end();

            expect(writeStreamMock.write).not.toBeCalled();
        });
    });
});
