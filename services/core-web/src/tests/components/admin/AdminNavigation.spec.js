import React from "react";
import { render } from "@testing-library/react";
import AdminNavigation from "@/components/admin/AdminNavigation";

const props = {
  activeButton: "verified",
  openSubMenuKey: [],
  userRoles: [],
};

describe("AdminNavigation", () => {
  it("renders properly", () => {
    const { container: component } = render(<AdminNavigation {...props} />);
    expect(component).toMatchSnapshot();
  });
});
