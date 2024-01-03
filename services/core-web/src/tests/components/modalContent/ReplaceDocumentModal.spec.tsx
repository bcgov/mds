import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/App";
import { MINEDOCUMENTS } from "@/tests/mocks/dataMocks";
import matchMedia from "@/tests/mocks/matchMedia";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";

const props = {
  document: MINEDOCUMENTS[0],
  handleSubmit: jest.fn().mockReturnValue(Promise.resolve()),
  closeModal: jest.fn(),
  postNewDocumentVersion: jest.fn().mockReturnValue(Promise.resolve()),
};

beforeEach(() => {
  props.document = MINEDOCUMENTS;
});

beforeAll(() => {
  window.matchMedia = matchMedia;
});

describe("ReplaceDocumentModal", () => {
  it("renders properly", () => {
    const { container } = render(
      <Provider store={store}>
        <ReplaceDocumentModal {...props} />
      </Provider>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
