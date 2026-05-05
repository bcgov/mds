import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MarkdownViewer from './MarkdownViewer';

// Mock ReactMarkdown component to render actual links for testing
jest.mock('react-markdown', () => {
    return ({ children }: { children: string }) => {
        // Basic parser for the links we generate: [[1]](#condition-abc123)
        const parts = children.split(/(\[\[\d+\]\]\(#condition-[a-f0-9-]+\))/);
        return (
            <div data-testid="mocked-markdown">
                {parts.map((part, i) => {
                    const match = part.match(/\[\[(\d+)\]\]\((#condition-([a-f0-9-]+))\)/);
                    if (match) {
                        return (
                            <a key={i} href={match[2]} data-testid={`link-${match[3]}`}>
                                {`[${match[1]}]`}
                            </a>
                        );
                    }
                    return part;
                })}
            </div>
        );
    };
});

describe('MarkdownViewer', () => {
    const mockScrollIntoView = jest.fn();
    let originalScrollIntoView: any;
    let originalHash: string;

    beforeEach(() => {
        originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
        originalHash = window.location.hash;
        window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

        history.replaceState(null, '', '#');
        history.replaceState(null, '', ' ');
    });

    afterEach(() => {
        window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
        mockScrollIntoView.mockClear();

        history.replaceState(null, '', originalHash);
        jest.restoreAllMocks();
    });

    test('renders markdown content correctly', () => {
        const mockMarkdown = '# Test Heading\n\nThis is a test paragraph.';
        render(<MarkdownViewer markdown={mockMarkdown} />);

        const mockedMarkdown = screen.getByTestId('mocked-markdown');
        expect(mockedMarkdown).toHaveTextContent('# Test Heading');
        expect(mockedMarkdown).toHaveTextContent('This is a test paragraph.');
    });

    test('processes single reference correctly', () => {
        const mockMarkdown = 'Check this [doc:abc123] reference';
        render(<MarkdownViewer markdown={mockMarkdown} />);

        const mockedMarkdown = screen.getByTestId('mocked-markdown');
        expect(mockedMarkdown).toHaveTextContent('Check this');
        expect(screen.getByTestId('link-abc123')).toBeInTheDocument();
        expect(mockedMarkdown).toHaveTextContent('reference');
    });

    test('processes multiple references correctly', () => {
        const mockMarkdown = 'Check these references [doc:abc123, doc:def456]';
        render(<MarkdownViewer markdown={mockMarkdown} />);

        const mockedMarkdown = screen.getByTestId('mocked-markdown');
        expect(mockedMarkdown).toHaveTextContent('Check these references');
        expect(screen.getByTestId('link-abc123')).toBeInTheDocument();
        expect(screen.getByTestId('link-def456')).toBeInTheDocument();
    });

    test('processes double bracket reference correctly', () => {
        const mockMarkdown = 'Check this [[doc:abc123]] reference';
        render(<MarkdownViewer markdown={mockMarkdown} />);

        const mockedMarkdown = screen.getByTestId('mocked-markdown');
        expect(mockedMarkdown).toHaveTextContent('Check this');
        expect(screen.getByTestId('link-abc123')).toBeInTheDocument();
        expect(mockedMarkdown).toHaveTextContent('reference');
    });


    test('handles click on non-reference link', () => {
        const mockMarkdown = 'Check this [regular link](https://example.com)';
        render(<MarkdownViewer markdown={mockMarkdown} />);

        // For non-reference links, they are not transformed by our mock
        // So we can manually trigger the click on the container with a mock target
        const markdownDiv = screen.getByTestId('markdown-content').parentElement;
        
        const preventDefault = jest.fn();
        // Use Object.defineProperty to bypass read-only tagName
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'target', {
            value: { tagName: 'A', href: 'https://example.com' },
            enumerable: true
        });
        Object.defineProperty(event, 'preventDefault', { value: preventDefault });

        fireEvent(markdownDiv!, event);

        expect(preventDefault).not.toHaveBeenCalled();
        expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    test('handles click on reference link with element found', () => {
        const mockMarkdown = 'Check this [doc:abc123]';
        render(<MarkdownViewer markdown={mockMarkdown} />);

        const mockElement = document.createElement('div');
        mockElement.id = 'condition-abc123';
        document.body.appendChild(mockElement);

        const link = screen.getByTestId('link-abc123');
        
        // We need to verify preventDefault was called. 
        // We'll dispatch a real event and mock preventDefault on it.
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        const preventDefault = jest.fn();
        Object.defineProperty(event, 'preventDefault', { value: preventDefault });
        
        fireEvent(link, event);

        expect(preventDefault).toHaveBeenCalled();
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        expect(window.location.hash).toContain('condition-abc123');

        document.body.removeChild(mockElement);
    });

    test('handles click on reference link with element not found', () => {
        const mockMarkdown = 'Check this [doc:def456]'; // use valid hex
        render(<MarkdownViewer markdown={mockMarkdown} />);

        const link = screen.getByTestId('link-def456');
        
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        const preventDefault = jest.fn();
        Object.defineProperty(event, 'preventDefault', { value: preventDefault });
        
        fireEvent(link, event);

        expect(preventDefault).toHaveBeenCalled();
        expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
});
