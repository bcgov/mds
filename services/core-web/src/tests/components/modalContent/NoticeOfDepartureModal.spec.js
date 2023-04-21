import React from "react";
import { shallow } from "enzyme";
// eslint-disable-next-line import/no-unresolved
import { Provider } from "react-redux";
import NoticeOfDepartureModal from "@/components/modalContent/NoticeOfDepartureModal";
import { MINE_RESPONSE, NOTICE_OF_DEPARTURE_DETAILS } from "@/tests/mocks/dataMocks";
import { store } from "@/App";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfDeparture = NOTICE_OF_DEPARTURE_DETAILS;
  props.initialValues = NOTICE_OF_DEPARTURE_DETAILS;
  // eslint-disable-next-line prefer-destructuring
  props.mine = MINE_RESPONSE[0];
  props.fetchDetailedNoticeOfDeparture = jest.fn();
  props.pristine = false;
  props.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("NoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <NoticeOfDepartureModal {...dispatchProps} {...props} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
