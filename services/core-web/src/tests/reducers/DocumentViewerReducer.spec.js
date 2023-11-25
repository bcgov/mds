import { documentViewerReducer } from "@mds/common/redux/reducers/documentViewerReducer";
import {
  openDocumentViewer,
  closeDocumentViewer,
  updateDocumentViewerTitle,
} from "@mds/common/redux/actions/documentViewerActions";

const baseExpectedValue = {
  isDocumentViewerOpen: false,
  props: { title: "Document Viewer" },
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("documentViewerReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();

    const result = documentViewerReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives CLOSE_DOCUMENT_VIEWER", () => {
    const expectedValue = getBaseExpectedValue();

    const result = documentViewerReducer(undefined, closeDocumentViewer());
    expect(result).toEqual(expectedValue);
  });

  it("receives OPEN_DOCUMENT_VIEWER", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.isDocumentViewerOpen = true;
    expectedValue.props = {};
    expectedValue.documentPath = "mock path";
    expectedValue.documentName = "mock name";
    const payload = { props: {}, documentPath: "mock path", documentName: "mock name" };
    const result = documentViewerReducer(undefined, openDocumentViewer(payload));
    expect(result).toEqual(expectedValue);
  });

  it("receives UPDATE_DOCUMENT_VIEWER_TITLE", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.props.title = "Mock Title";
    const payload = "Mock Title";
    const result = documentViewerReducer(undefined, updateDocumentViewerTitle(payload));
    expect(result).toEqual(expectedValue);
  });
});
