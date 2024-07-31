import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";
import { MINEDOCUMENTS } from "@/tests/mocks/dataMocks";
import matchMedia from "@/tests/mocks/matchMedia";
import { shallow } from "enzyme";

const mockStore = configureStore([]);
const store = mockStore({});

const props = {
  document: MINEDOCUMENTS[0],
  handleSubmit: jest.fn().mockReturnValue(Promise.resolve()),
  closeModal: jest.fn(),
  postNewDocumentVersion: jest.fn().mockReturnValue(Promise.resolve()),
  alertMessage: "This is a test alert message.",
};

beforeAll(() => {
  window.matchMedia = matchMedia;
});

describe("ReplaceDocumentModal", () => {
  it("renders correctly and matches the snapshot", () => {
    const wrapper = shallow(
      <Provider store={store}>
        <ReplaceDocumentModal {...props} />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
