import { AxiosResponse } from 'axios';

export interface SseMessage {
    type: string;
    data: any;
}

export interface SseEventHandlers {
    [eventType: string]: (data: any) => void;
}

export interface SseProcessorOptions {
    onComplete?: () => void;
    onError?: (error: any) => void;
}


/**
 * Utility class to parse Server-Sent Events (SSE) data
 */
export class SseParser {
    private buffer: string = '';

    // Fix the regex to properly match multiple messages in a single chunk
    // The issue was likely with the greedy matching in the original regex
    private messagePattern: RegExp = /event:\s*([^\n]*)\s*data:(.*?)ENDMESSAGE/g;

    /**
     * Parse a chunk of SSE data
     * @param chunk The data chunk to parse
     * @returns Array of parsed SSE messages
     */
    public parseChunk(chunk: string): SseMessage[] {
        this.buffer += chunk;
        const messages: SseMessage[] = [];

        let match: RegExpExecArray | null;
        let lastIndex = 0;

        // Extract all complete messages from the buffer
        while ((match = this.messagePattern.exec(this.buffer)) !== null) {
            const [fullMatch, type, jsonData] = match;
            lastIndex = match.index + fullMatch.length;

            try {
                const data = JSON.parse(jsonData.trim());
                messages.push({ type: type.trim(), data });
            } catch (error) {
                console.error('Error parsing SSE message data as JSON:', error);
            }
        }

        // Keep any incomplete message in the buffer
        if (lastIndex > 0) {
            this.buffer = this.buffer.substring(lastIndex);
        }

        return messages;
    }

    /**
     * Process a fetch API ReadableStream from Axios (using fetch adapter)
     * @param stream The ReadableStream from Axios response.data
     * @param onMessage Callback function for each parsed message
     * @param options Optional configuration for error and completion handling
     * @returns Promise that resolves when the stream is completely processed
     */
    public async processFetchStream(
        stream: ReadableStream,
        onMessage: (message: SseMessage) => void,
        options?: { onComplete?: () => void; onError?: (error: any) => void }
    ): Promise<void> {
        const reader = stream.getReader();
        const decoder = new TextDecoder('utf-8');

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    // Process any remaining data in buffer
                    if (this.buffer.trim()) {
                        const messages = this.parseChunk('ENDMESSAGE'); // Force processing any remaining data
                        messages.forEach(onMessage);
                    }

                    if (options?.onComplete) {
                        options.onComplete();
                    }
                    break;
                }

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const messages = this.parseChunk(chunk);
                    messages.forEach(onMessage);
                }
            }
        } catch (error) {
            if (options?.onError) {
                options.onError(error);
            } else {
                throw error;
            }
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Reset the internal buffer
     */
    public reset(): void {
        this.buffer = '';
    }
}

/**
 * Creates an SSE processor that handles specific event types with dedicated callbacks
 * 
 * This function is specifically designed to work with Axios responses using the fetch adapter
 * that returns a ReadableStream in the response.data property.
 * 
 * Example usage:
 *  createSseProcessor(
 *     response.data,
 *    {
 *       documents: (documentsData: SearchResult) => {
 *           ...
 *       },
 *       ai_start: () => {
 *          ...
 *       },
 *     });
 * 
 * @param responseData The response.data from an Axios call using fetch adapter with streaming
 * @param eventHandlers Object with event types as keys and handler functions as values
 * @param options Additional options for completion and error handling
 */
export function createSseProcessor(
    responseData: ReadableStream,
    eventHandlers: SseEventHandlers,
    options?: SseProcessorOptions
): void {
    if (!responseData || typeof responseData.getReader !== 'function') {
        if (options?.onError) {
            options.onError(new Error('Invalid response stream: expected a ReadableStream'));
        }
        return;
    }

    const parser = new SseParser();

    parser.processFetchStream(
        responseData,
        (message: SseMessage) => {
            const handler = eventHandlers[message.type];
            if (handler) {
                handler(message.data);
            }
        },
        {
            onComplete: options?.onComplete,
            onError: options?.onError
        }
    ).catch(error => {
        if (options?.onError) {
            options.onError(error);
        } else {
            console.error('Error processing SSE stream:', error);
        }
    });
}
