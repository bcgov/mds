import { SseParser, createSseProcessor } from './SseParser';

describe('SseParser', () => {
    let parser: SseParser;

    beforeEach(() => {
        parser = new SseParser();
    });

    describe('parseChunk', () => {
        it('should parse a valid chunk with a complete message', () => {
            const chunk = 'event: test data: {"value": 123}ENDMESSAGE';
            const messages = parser.parseChunk(chunk);

            expect(messages.length).toBe(1);
            expect(messages[0].type).toBe('test');
            expect(messages[0].data).toEqual({ value: 123 });
        });

        it('should accumulate partial messages across multiple chunks', () => {
            const chunk1 = 'event: test data: {"value":';
            const chunk2 = ' 123}ENDMESSAGE';

            const messages1 = parser.parseChunk(chunk1);
            expect(messages1.length).toBe(0);

            const messages2 = parser.parseChunk(chunk2);
            expect(messages2.length).toBe(1);
            expect(messages2[0].type).toBe('test');
            expect(messages2[0].data).toEqual({ value: 123 });
        });

        it('should handle invalid JSON in messages', () => {
            console.error = jest.fn();
            const chunk = 'event: test data: {invalid-json}ENDMESSAGE';
            const messages = parser.parseChunk(chunk);

            expect(messages.length).toBe(0);
            expect(console.error).toHaveBeenCalled();
        });

        it('should reset the buffer when called', () => {
            const chunk1 = 'event: test data: {"partial":';
            parser.parseChunk(chunk1);
            parser.reset();

            const chunk2 = ' true}ENDMESSAGE';
            const messages = parser.parseChunk(chunk2);

            expect(messages.length).toBe(0);
        });
    });

    describe('processFetchStream', () => {
        it('should process a readable stream with messages', async () => {
            const messages = [
                { value: new TextEncoder().encode('event: test1 data: {"value": 1}ENDMESSAGE'), done: false },
                { value: new TextEncoder().encode('event: test2 data: {"value": 2}ENDMESSAGE'), done: false },
                { done: true }
            ];

            let currentMsg = 0;
            const mockReader = {
                read: jest.fn().mockImplementation(() => Promise.resolve(messages[currentMsg++])),
                releaseLock: jest.fn()
            };

            const mockStream = {
                getReader: jest.fn().mockReturnValue(mockReader)
            };

            const onMessage = jest.fn();
            const onComplete = jest.fn();

            await parser.processFetchStream(
                mockStream as unknown as ReadableStream,
                onMessage,
                { onComplete }
            );

            expect(onMessage).toHaveBeenCalledTimes(2);

            // Fix: Use mock.calls to access the arguments directly
            expect(onMessage.mock.calls[0][0]).toEqual({
                type: 'test1',
                data: { value: 1 }
            });

            expect(onMessage.mock.calls[1][0]).toEqual({
                type: 'test2',
                data: { value: 2 }
            });

            expect(onComplete).toHaveBeenCalledTimes(1);
        });

        it('should handle stream errors', async () => {
            const mockReader = {
                read: jest.fn().mockRejectedValue(new Error('Stream error')),
                releaseLock: jest.fn()
            };

            const mockStream = {
                getReader: jest.fn().mockReturnValue(mockReader)
            };

            const onMessage = jest.fn();
            const onError = jest.fn();

            await parser.processFetchStream(
                mockStream as unknown as ReadableStream,
                onMessage,
                { onError }
            ).catch(() => { });

            expect(onError).toHaveBeenCalledWith(new Error('Stream error'));
            expect(onMessage).not.toHaveBeenCalled();
        });

        it('should process any remaining data in the buffer when stream is done', async () => {
            const messages = [
                { value: new TextEncoder().encode('event: test data: {"value":'), done: false },
                { value: new TextEncoder().encode(' 123}'), done: false },
                { done: true }
            ];

            let currentMsg = 0;
            const mockReader = {
                read: jest.fn().mockImplementation(() => Promise.resolve(messages[currentMsg++])),
                releaseLock: jest.fn()
            };

            const mockStream = {
                getReader: jest.fn().mockReturnValue(mockReader)
            };

            const onMessage = jest.fn();

            await parser.processFetchStream(
                mockStream as unknown as ReadableStream,
                onMessage
            );

            expect(onMessage).toHaveBeenCalledTimes(1);
            expect(onMessage.mock.calls[0][0]).toEqual({
                type: 'test',
                data: { value: 123 }
            });
        });
    });
});

describe('createSseProcessor', () => {
    it('should create a processor that handles specific event types', async () => {
        const messages = [
            { value: new TextEncoder().encode('event: documents data: {"items":[1,2,3]}ENDMESSAGE'), done: false },
            { value: new TextEncoder().encode('event: prompt data: {"text":"test"}ENDMESSAGE'), done: false },
            { done: true }
        ];

        let currentMsg = 0;
        const mockReader = {
            read: jest.fn().mockImplementation(() => Promise.resolve(messages[currentMsg++])),
            releaseLock: jest.fn()
        };

        const mockStream = {
            getReader: jest.fn().mockReturnValue(mockReader)
        };

        const handlers = {
            documents: jest.fn(),
            prompt: jest.fn()
        };

        const options = {
            onComplete: jest.fn(),
            onError: jest.fn()
        };

        createSseProcessor(
            mockStream as unknown as ReadableStream,
            handlers,
            options
        );

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(handlers.documents).toHaveBeenCalledWith({ items: [1, 2, 3] });
        expect(handlers.prompt).toHaveBeenCalledWith({ text: "test" });
        expect(options.onComplete).toHaveBeenCalled();
        expect(options.onError).not.toHaveBeenCalled();
    });

    it('should handle invalid response stream', () => {
        const handlers = { test: jest.fn() };
        const options = { onError: jest.fn() };

        createSseProcessor(
            null as unknown as ReadableStream,
            handlers,
            options
        );

        expect(options.onError).toHaveBeenCalled();
        expect(handlers.test).not.toHaveBeenCalled();
    });

    it('should handle errors in stream processing', async () => {
        const mockReader = {
            read: jest.fn().mockRejectedValue(new Error('Stream processing failed')),
            releaseLock: jest.fn()
        };

        const mockStream = {
            getReader: jest.fn().mockReturnValue(mockReader)
        };

        const handlers = { test: jest.fn() };
        const options = { onError: jest.fn() };

        createSseProcessor(
            mockStream as unknown as ReadableStream,
            handlers,
            options
        );

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(options.onError).toHaveBeenCalledWith(new Error('Stream processing failed'));
        expect(handlers.test).not.toHaveBeenCalled();
    });

    it('should log errors when no error handler is provided', async () => {
        console.error = jest.fn();

        const mockReader = {
            read: jest.fn().mockRejectedValue(new Error('Stream processing failed')),
            releaseLock: jest.fn()
        };

        const mockStream = {
            getReader: jest.fn().mockReturnValue(mockReader)
        };

        const handlers = { test: jest.fn() };

        createSseProcessor(
            mockStream as unknown as ReadableStream,
            handlers
        );

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(console.error).toHaveBeenCalled();
    });
});
