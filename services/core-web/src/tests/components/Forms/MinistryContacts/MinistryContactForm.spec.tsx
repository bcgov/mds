import React from "react";
import { render } from "@testing-library/react";
import { MinistryContactForm } from "@/components/Forms/MinistryContacts/MinistryContactForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";

const initialState = {
  form: {
    MINISTRY_CONTACT_FORM: {
      values: {
        is_major_mine: false,
        emli_contact_type_code: "ROE",
      },
    },
  },
  [STATIC_CONTENT]: {
    mineRegionOptions: [
      { value: "NE", label: "North East" },
    ],
    ministryContactTypes: [
      { value: "ROE", label: "Regional Office" },
      { value: "MMO", label: "Major Mine Office" },
    ],
  },
};

describe("MinistryContactForm", () => {
  it("renders properly for creating contact", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MinistryContactForm
          onSubmit={jest.fn()}
          isEdit={false}
          title="Create"
          contacts={[]}
          distributionListOptions={[{ value: "dl-1", label: "Test List" }]}
        />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders properly for editing contact", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MinistryContactForm
          onSubmit={jest.fn()}
          isEdit={true}
          title="Update"
          contacts={[{ contact_guid: "123", emli_contact_type_code: "ROE" } as any]}
          distributionListOptions={[]}
        />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
