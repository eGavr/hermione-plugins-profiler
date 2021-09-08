const writeStreamMock = {
    write: jest.fn(),
    end: jest.fn(),
};
const createWriteStreamMock = jest.fn();
const ensureDirMock = jest.fn();

const fs = {
    ensureDir: ensureDirMock,
    createWriteStream: createWriteStreamMock.mockReturnValue(writeStreamMock),
};

jest.mock('fs-extra', () => fs);

import { JsonWriterMaster } from './json-master';

describe('JsonWriterMaster', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('init', () => {
        test('should init writer with root node', async () => {
            const writer = new JsonWriterMaster('reporter_dir');

            await writer.init();

            expect(ensureDirMock).toBeCalledWith('reporter_dir');
            expect(createWriteStreamMock).toBeCalledWith(
                'reporter_dir/plugins.json',
                { autoClose: true, flags: 'a' }
            );
            expect(writeStreamMock.write).toBeCalledWith('{"root":[');
        });
    });

    describe('write', () => {
        test('should write previous data and store current to valid brackets ending structure', async () => {
            const writer = new JsonWriterMaster('reporter_dir');

            await writer.init();
            writer.write({ some: 'data' });

            writeStreamMock.write.mockClear();

            writer.write({ some: 'data1' });

            expect(writeStreamMock.write).toBeCalledWith('{"some":"data"},');
        });
    });

    describe('end', () => {
        test('should close writer with valid brackets structure', async () => {
            const writer = new JsonWriterMaster('reporter_dir');

            await writer.init();
            writer.write({ some: 'data' });

            writeStreamMock.write.mockClear();

            writer.end();

            expect(writeStreamMock.write).toBeCalledWith('{"some":"data"}]}');
        });

        test('should write empty object if only worker writes data', async () => {
            const writer = new JsonWriterMaster('reporter_dir');

            await writer.init();

            writeStreamMock.write.mockClear();

            writer.end();

            expect(writeStreamMock.write).toBeCalledWith('{}]}');
        });
    });
});
