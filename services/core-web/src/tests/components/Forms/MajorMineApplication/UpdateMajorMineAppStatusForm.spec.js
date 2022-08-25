import React from "react";
import { shallow } from "enzyme";
import { UpdateMajorMineAppStatusForm } from "@/components/Forms/majorMineApplication/UpdateMajorMineAppStatusForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handleSubmit = jest.fn();
  props.formValues = { status_code: "REC" };
  props.initialValues = {
    status_code: "REC",
  };
  props.displayValues = {
    statusCode: "REC",
    updateUser: "test",
    updateDate: "Jun 13 2022",
    majorMineAppStatusCodesHash: MOCK.MAJOR_MINES_APPLICATION_STATUS_CODES_HASH,
  };
  props.pristine = true;
  props.dropdownMajorMineAppStatusCodes = MOCK.MAJOR_MINES_APPLICATION_STATUS_CODES_HASH;
};

beforeEach(() => {
  setupProps();
});

describe("UpdateMajorMineAppStatusForm", () => {
  it("renders properly", () => {
    const component = shallow(<UpdateMajorMineAppStatusForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
