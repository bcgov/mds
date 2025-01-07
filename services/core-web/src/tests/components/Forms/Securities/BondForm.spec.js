import React from "react";
import { render } from "@testing-library/react";
import { BondForm } from "@/components/Forms/Securities/BondForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

describe("BondForm", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper><BondForm
      onSubmit={jest.fn()}
      title="Add Bond"
      permitGuid="462562457"
      provinceOptions={MOCK.DROPDOWN_PROVINCE_OPTIONS}
      bondTypeOptions={[]}
      bondStatusOptionsHash={MOCK.BULK_STATIC_CONTENT_RESPONSE.bondStatusOptions}
      bond={MOCK.BONDS.records}
    /></ReduxWrapper>);
    expect(container).toMatchSnapshot();
  });
});
