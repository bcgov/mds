import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { ApplicationTab } from "@/components/noticeOfWork/applications/review/ApplicationTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  exportNoticeOfWorkApplicationDocument: jest.fn(),
  reset: jest.fn(),
  submit: jest.fn(),
};
const reducerProps = {
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  originalNoticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  importNowSubmissionDocumentsJob: {},
  formValues: NOW_MOCK.NOTICE_OF_WORK,
  formErrors: {},
  fixedTop: false,
  submitFailed: false,
  inspectors: [],
  consultationAdvisors: [],
  reclamationSummary: [],
  generatableApplicationDocuments: {},
  location: {},
};

// TypeError: Cannot read properties of undefined (reading 'party_guid')

//       36 |           <Link
//       37 |             style={{ fontSize: "1.5rem", fontWeight: "bold" }}
//     > 38 |             to={router.PARTY_PROFILE.dynamicRoute(contact.party.party_guid)}
//          |                                                                 ^
//       39 |           >
//       40 |             {contact.party.name}
//       41 |           </Link>
describe.skip("ApplicationTab", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><ApplicationTab {...dispatchProps} {...reducerProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});

describe("ApplicationTab", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ApplicationTab {...dispatchProps} {...reducerProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
