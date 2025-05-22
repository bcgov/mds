import React from "react";
import { render } from "@testing-library/react";
import { EPICAuthorizationsTable } from "@/components/mine/ExternalAuthorizations/EPICAuthorizationsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.isLoaded = true;
  props.data = MOCK.MINE_EPIC_INFO.records;
};

beforeEach(() => {
  setupProps();
});

describe("EPICAuthorizationsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<EPICAuthorizationsTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
