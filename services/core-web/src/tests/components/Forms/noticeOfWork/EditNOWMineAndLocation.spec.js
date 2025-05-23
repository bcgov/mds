import React from "react";
import { render } from "@testing-library/react";
import { EditNOWMineAndLocation } from "@/components/Forms/noticeOfWork/EditNOWMineAndLocation";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  locationOnly: true,
  latitude: "",
  longitude: "",
};

describe("EditNOWMineAndLocation", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <FormWrapper name="formName">
          <EditNOWMineAndLocation {...props} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
