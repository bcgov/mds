import React from 'react';
import { render, screen } from '@testing-library/react';
import MarkdownViewer from './MarkdownViewer';

// Mock ReactMarkdown component to make testing easier
jest.mock('react-markdown', () => {
    return ({ children }: { children: string }) => (
        <div data-testid="mocked-markdown">{children}</div>
    );
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
        const { container } = render(<MarkdownViewer markdown={mockMarkdown} />);

        const mockedMarkdown = screen.getByTestId('mocked-markdown');
        expect(mockedMarkdown).toHaveTextContent('Check this');
        expect(mockedMarkdown).toHaveTextContent('[[1]](#condition-abc123)');
        expect(mockedMarkdown).toHaveTextContent('reference');

        expect(container).toMatchSnapshot();
    });

    test('processes multiple references correctly', () => {
        const mockMarkdown = 'Check these references [doc:abc123, doc:def456]';
        render(<MarkdownViewer markdown={mockMarkdown} />);

        const mockedMarkdown = screen.getByTestId('mocked-markdown');
        expect(mockedMarkdown).toHaveTextContent('Check these references');
        expect(mockedMarkdown).toHaveTextContent('[[1]](#condition-abc123)');
        expect(mockedMarkdown).toHaveTextContent('[[2]](#condition-def456)');
    });

    test('processes double bracket reference correctly', () => {
        const mockMarkdown = 'Check this [[doc:abc123]] reference';
        render(<MarkdownViewer markdown={mockMarkdown} />);

        const mockedMarkdown = screen.getByTestId('mocked-markdown');
        expect(mockedMarkdown).toHaveTextContent('Check this');
        expect(mockedMarkdown).toHaveTextContent('[[1]](#condition-abc123)');
        expect(mockedMarkdown).toHaveTextContent('reference');
    });


    test('handles click on non-reference link', () => {
        const mockMarkdown = 'Check this [regular link](https://example.com)';
        const { container } = render(<MarkdownViewer markdown={mockMarkdown} />);

        const markdownDiv: any = container.querySelector('.permit-search__markdown');
        expect(markdownDiv).not.toBeNull();

        const mockEvent = {
            preventDefault: jest.fn(),
            target: {
                tagName: 'A',
                href: 'https://example.com'
            }
        };

        markdownDiv!.onclick!(mockEvent as any);

        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    test('handles click on reference link with element found', () => {
        const mockMarkdown = 'Check this [doc:abc123]';
        const { container } = render(<MarkdownViewer markdown={mockMarkdown} />);

        const markdownDiv: any = container.querySelector('.permit-search__markdown');

        const mockElement = document.createElement('div');
        mockElement.id = 'condition-abc123';
        document.body.appendChild(mockElement);

        const mockEvent = {
            preventDefault: jest.fn(),
            target: {
                tagName: 'A',
                href: 'http://localhost/#condition-abc123'
            }
        };

        markdownDiv!.onclick!(mockEvent as any);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        expect(window.location.hash).toBe('#condition-abc123');

        document.body.removeChild(mockElement);
    });

    test('handles click on reference link with element not found', () => {
        const mockMarkdown = 'Check this [doc:notfound]';
        const { container } = render(<MarkdownViewer markdown={mockMarkdown} />);

        const markdownDiv: any = container.querySelector('.permit-search__markdown');

        const mockEvent = {
            preventDefault: jest.fn(),
            target: {
                tagName: 'A',
                href: 'http://localhost/#condition-notfound'
            }
        };

        markdownDiv!.onclick!(mockEvent as any);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
});
