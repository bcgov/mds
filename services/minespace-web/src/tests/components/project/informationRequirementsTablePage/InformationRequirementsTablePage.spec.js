import React from "react";
import { shallow } from "enzyme";
import { InformationRequirementsTablePage } from "@/components/pages/Project/InformationRequirementsTablePage";
import * as MOCK from "@/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    project: MOCK.PROJECT,
    requirements: MOCK.INFORMATION_REQUIREMENTS_TABLE.requirements,
    informationRequirementsTableDocumentTypesHash:
      MOCK.INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_HASH,
  },
};

describe("InformationRequirementsTablePage", () => {
  it("renders properly", () => {
    const component = shallow(
      <ReduxWrapper initialState={initialState}>
        <InformationRequirementsTablePage />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
