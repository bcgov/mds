import React from "react";
import { shallow } from "enzyme";
import { VerifyApplicationInformationForm } from "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  onSubmit: jest.fn(),
};
const reducerProps = {
  longitude: "",
  latitude: "",
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  initialValues: NOW_MOCK.NOTICE_OF_WORK,
  contacts: NOW_MOCK.NOTICE_OF_WORK.contacts,
  originalNoticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  mineGuid: MOCK.MINES.mineIds[0],
  submitting: false,
};

describe("VerifyApplicationInformationForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <VerifyApplicationInformationForm
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1 } }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});