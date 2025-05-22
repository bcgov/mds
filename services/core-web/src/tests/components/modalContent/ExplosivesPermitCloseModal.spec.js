import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitCloseModal } from "@/components/modalContent/ExplosivesPermitCloseModal";

const props = {};

const setupProps = () => {
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
describe("ExplosivesPermitCloseModal", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitCloseModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
