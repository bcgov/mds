import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import * as MOCK from "@/tests/mocks/dataMocks";
import AddNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/AddNoticeOfDepartureModal";
import { store } from "@/App";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.afterClose = jest.fn();
};

const setupProps = () => {
  // eslint-disable-next-line prefer-destructuring
  props.mineGuid = MOCK.MINES.mineIds[0];
  props.initialValues = {};
  props.permits = MOCK.PERMITS.permits;
  props.addNoticeOfDepartureFormValues = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddNoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <AddNoticeOfDepartureModal {...dispatchProps} {...props} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
