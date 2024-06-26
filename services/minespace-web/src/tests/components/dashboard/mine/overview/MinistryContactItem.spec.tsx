import React from "react";
import { render } from "@testing-library/react";
import MinistryContactItem from "@/components/dashboard/mine/overview/MinistryContactItem";
import { BULK_STATIC_CONTENT_RESPONSE } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";

const initialState = {
  [STATIC_CONTENT]: BULK_STATIC_CONTENT_RESPONSE,
};

const setupProps = () => ({
  contact: {
    emli_contact_type_code: "SPI",
    first_name: "John",
    last_name: "Doe",
    phone_number: "123-456-7890",
    email: "johndoe@example.com",
  },
});

describe("MinistryContactItem", () => {
  it("renders properly", () => {
    const wrapper = render(
      <ReduxWrapper initialState={initialState}>
        <MinistryContactItem {...setupProps()} />
      </ReduxWrapper>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
