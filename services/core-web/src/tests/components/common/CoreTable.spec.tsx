import React from "react";
import { render } from "@testing-library/react";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderActionsColumn, renderDateColumn, renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";

const columns = [
  renderTextColumn("field_name", "Field Name", true, "placeholder!"),
  renderDateColumn("date_field", "Date Field", false),
  renderActionsColumn({
    actions: [{
      key: "action_key",
      label: "Action Label",
      clickFunction: jest.fn()
    }]
  })
];
const dataSource = [
  {
    field_name: "texty",
    date_field: new Date(2025, 3, 5)
  },
  {
    field_name: "different texty",
    date_field: new Date(2024, 6, 2)
  }
]
describe("CoreTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<CoreTable columns={columns} dataSource={dataSource}
    />);
    expect(component).toMatchSnapshot();
  });
});
