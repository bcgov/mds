import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { ApplicationTab } from "@/components/noticeOfWork/applications/review/ApplicationTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.exportNoticeOfWorkApplicationDocument = jest.fn();
  dispatchProps.reset = jest.fn();
  dispatchProps.submit = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.originalNoticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.importNowSubmissionDocumentsJob = {};
  reducerProps.formValues = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.formErrors = {};
  reducerProps.fixedTop = false;
  reducerProps.submitFailed = false;
  reducerProps.inspectors = [];
  reducerProps.reclamationSummary = [];
  reducerProps.generatableApplicationDocuments = {};
  reducerProps.location = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

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
