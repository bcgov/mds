import React from "react";
import { shallow } from "enzyme";
import { VerificationTab } from "@/components/noticeOfWork/applications/verification/VerificationTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  importNoticeOfWorkApplication: jest.fn(),
};
const reducerProps = {
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  originalNoticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  mineGuid: MOCK.MINES.mineIds[0],
};

describe("VerificationTab", () => {
  it("renders properly", () => {
    const component = shallow(<VerificationTab {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});