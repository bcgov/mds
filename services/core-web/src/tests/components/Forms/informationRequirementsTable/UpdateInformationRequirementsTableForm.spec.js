import React from "react";
import { shallow } from "enzyme";
import { UpdateInformationRequirementsTableForm } from "@/components/Forms/informationRequirementsTable/UpdateInformationRequirementsTableForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handleSubmit = jest.fn();
  props.formValues = { status_code: "SUB" };
  props.initialValues = {
    status_code: "SUB",
  };
  props.displayValues = {
    statusCode: "SUB",
    updateUser: "test",
    updateDate: "Jun 13 2022",
    informationRequirementsTableStatusCodesHash:
      MOCK.INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_HASH,
  };
  props.pristine = true;
  props.dropdownInformationRequirementsTableStatusCodes =
    MOCK.INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_DROPDOWN;
};

beforeEach(() => {
  setupProps();
});

describe("UpdateInformationRequirementsTableForm", () => {
  it("renders properly", () => {
    const component = shallow(<UpdateInformationRequirementsTableForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
