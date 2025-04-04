import React from "react";
import { render } from "@testing-library/react";
import { AddContactFormDetails } from "@/components/Forms/contacts/AddContactFormDetails";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

describe("AddContactFormDetails", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <AddContactFormDetails onSubmit={jest.fn()} handleSelectChange={jest.fn()} contacts={[]} />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
