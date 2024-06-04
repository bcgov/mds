import React from "react";
import { Provider } from "react-redux";
import { shallow } from "enzyme";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { render } from "@testing-library/react";
import { store } from "@/App";
import { DocumentUpload } from "@/components/Forms/projects/projectSummary/DocumentUpload";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
// import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { FORM } from "@mds/common/constants/forms";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
  props.documents = {};
  props.isEditMode = true;
  props.projectSummaryDocumentTypesHash = {};
  props.mineGuid = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

const initialState = {
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [STATIC_CONTENT]: {
    projectSummaryPermitTypes: MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryPermitTypes,
    projectSummaryAuthorizationTypes:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryAuthorizationTypes,
  },
};

// describe("DocumentUpload", () => {
//   it("renders properly", () => {
//     const component = shallow(
//       <Provider store={store}>
//         <DocumentUpload {...dispatchProps} {...props} />
//       </Provider>
//     );

//     expect(component).toMatchSnapshot();
//   });
// });

describe("DocumentUpload", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={MOCK.PROJECT_SUMMARY}
          onSubmit={() => {}}
        >
          <DocumentUpload {...dispatchProps} {...props} />
        </FormWrapper>
      </ReduxWrapper>
    );

    // expect(component).toMatchSnapshot();
    expect(container).toMatchSnapshot();
  });
});
