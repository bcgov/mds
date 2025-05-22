import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitCloseForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitCloseForm";

const props = {};

const setupProps = () => {
  props.submitting = false;
  props.title = "Close Permit";
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
};

beforeEach(() => {
  setupProps();
});

// TypeError: Cannot read properties of undefined (reading 'esup_permit_close_timezone')

//       59 |   if (timezoneFieldProps) {
//       60 |     const formValues = useSelector((state) => getFormValues(meta.form)(state));
//     > 61 |     formTimezone = formValues[timezoneFieldProps.name];
//          |                              ^
//       62 |   }
//       63 |
//       64 |   const defaultTimezone = formTimezone ?? timezone ?? userTz;
describe("ExplosivesPermitCloseForm", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitCloseForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
