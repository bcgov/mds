import React from "react";
import { render } from "@testing-library/react";
import { MinespaceUserList } from "@/components/admin/MinespaceUserList";

describe("MinespaceUserList", () => {
  it("renders properly", () => {
    const { container: component } = render(<MinespaceUserList />);
    expect(component).toMatchSnapshot();
  });
});
