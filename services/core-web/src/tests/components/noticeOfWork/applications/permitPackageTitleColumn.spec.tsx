import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "antd";
import moment from "moment-timezone";
import {
  allSelectedHaveTitles,
  renderPermitPackageTitleColumn,
} from "@/components/noticeOfWork/applications/permitPackageTitleColumn";

const renderCell = (column, record) => render(<>{column.render(undefined, record)}</>);

describe("renderPermitPackageTitleColumn", () => {
  const record = { key: "doc-1", preamble_title: "Saved title" };

  it("is titled Title", () => {
    const column = renderPermitPackageTitleColumn({ packageTitles: { titles: {} } });
    expect(column.title).toBe("Title");
  });

  it("shows the title as text when the row isn't selected", () => {
    const column = renderPermitPackageTitleColumn({
      selectedKeys: [],
      packageTitles: { titles: { "doc-1": "Saved title" }, onTitleChange: jest.fn() },
    });
    renderCell(column, record);
    expect(screen.getByText("Saved title")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("falls back to the record's saved title when it isn't tracked in titles", () => {
    const column = renderPermitPackageTitleColumn({ packageTitles: { titles: {} } });
    renderCell(column, record);
    expect(screen.getByText("Saved title")).toBeInTheDocument();
  });

  it("shows an input with the current title when the row is selected", () => {
    const column = renderPermitPackageTitleColumn({
      selectedKeys: ["doc-1"],
      packageTitles: { titles: { "doc-1": "Typed title" }, onTitleChange: jest.fn() },
    });
    renderCell(column, record);
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("Typed title");
  });

  it("shows the title as text for a locked row, even when selected", () => {
    const column = renderPermitPackageTitleColumn({
      selectedKeys: ["doc-1"],
      lockedRowKeys: ["doc-1"],
      packageTitles: { titles: { "doc-1": "Notice of Work Application" }, onTitleChange: jest.fn() },
    });
    renderCell(column, record);
    expect(screen.getByText("Notice of Work Application")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows text instead of an input when there is no change handler", () => {
    const column = renderPermitPackageTitleColumn({
      selectedKeys: ["doc-1"],
      packageTitles: { titles: { "doc-1": "Saved title" } },
    });
    renderCell(column, record);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("marks the input as an error while the title is empty", () => {
    const column = renderPermitPackageTitleColumn({
      selectedKeys: ["doc-1"],
      packageTitles: { titles: { "doc-1": "   " }, onTitleChange: jest.fn() },
    });
    renderCell(column, record);
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveClass("ant-input-status-error");
  });

  it("passes the row key and new value to onTitleChange when the user types", () => {
    const onTitleChange = jest.fn();
    const column = renderPermitPackageTitleColumn({
      selectedKeys: ["doc-1"],
      packageTitles: { titles: { "doc-1": "" }, onTitleChange },
    });
    renderCell(column, record);
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Reclamation Plan" },
    });
    expect(onTitleChange).toHaveBeenCalledWith("doc-1", "Reclamation Plan");
  });
});

describe("allSelectedHaveTitles", () => {
  it("is true when every selected row has a title", () => {
    expect(allSelectedHaveTitles(["a", "b"], [], { a: "Title A", b: "Title B" })).toBe(true);
  });

  it("is false when a selected row has no title or only spaces", () => {
    expect(allSelectedHaveTitles(["a", "b"], [], { a: "Title A", b: "" })).toBe(false);
    expect(allSelectedHaveTitles(["a"], [], { a: "   " })).toBe(false);
  });

  it("ignores rows that aren't selected", () => {
    expect(allSelectedHaveTitles(["a"], [], { a: "Title A", b: "" })).toBe(true);
  });

  it("ignores locked rows", () => {
    expect(allSelectedHaveTitles(["a", "ntr"], ["ntr"], { a: "Title A", ntr: "" })).toBe(true);
  });

  it("ignores selected keys that have no row in the table", () => {
    expect(allSelectedHaveTitles(["a", "not-in-table"], [], { a: "Title A" })).toBe(true);
  });

  it("is true when nothing is selected", () => {
    expect(allSelectedHaveTitles([], [], {})).toBe(true);
    expect(allSelectedHaveTitles()).toBe(true);
  });
});

describe("package type, author and date", () => {
  const {
    renderPermitPackageTypeColumn,
    renderPermitPackageDetailsSummary,
    getMissingTitleKeys,
  } = jest.requireActual("@/components/noticeOfWork/applications/permitPackageTitleColumn");
  const record = { key: "doc-1" };

  it("defaults the type to Document and reports changes", () => {
    const onDetailChange = jest.fn();
    const column = renderPermitPackageTypeColumn({
      selectedKeys: ["doc-1"],
      packageTitles: { titles: {}, onTitleChange: jest.fn(), onDetailChange, details: {} },
    });
    renderCell(column, record);
    expect(screen.getByText("Document")).toBeInTheDocument();
  });

  it("summarises filled in author and date while collapsed", () => {
    const packageTitles = {
      titles: {},
      onDetailChange: jest.fn(),
      expandedKeys: [],
      details: { "doc-1": { author: "A", date: "2024-01-01" } },
    };
    render(<>{renderPermitPackageDetailsSummary(record, ["doc-1"], packageTitles)}</>);
    expect(screen.getByText("Author ✓ Date ✓")).toBeInTheDocument();
  });

  it("hides the summary while expanded", () => {
    const packageTitles = {
      titles: {},
      onDetailChange: jest.fn(),
      expandedKeys: ["doc-1"],
      details: { "doc-1": { author: "A" } },
    };
    expect(renderPermitPackageDetailsSummary(record, ["doc-1"], packageTitles)).toBeNull();
  });

  it("lists selected rows missing a title in order", () => {
    expect(getMissingTitleKeys(["a", "b", "c"], ["c"], { a: "", b: " ", c: "" })).toEqual(["a", "b"]);
  });
});

describe("getPermitPackageExpandProps", () => {
  const { getPermitPackageExpandProps } = jest.requireActual(
    "@/components/noticeOfWork/applications/permitPackageTitleColumn"
  );
  const record = { key: "doc-1" };

  const build = (overrides = {}) => {
    const packageTitles = {
      titles: {},
      onTitleChange: jest.fn(),
      onDetailChange: jest.fn(),
      onExpandedKeysChange: jest.fn(),
      expandedKeys: ["doc-1"],
      details: { "doc-1": { author: "Pat", date: "2024-05-01" } },
      ...overrides,
    };
    return {
      packageTitles,
      props: getPermitPackageExpandProps({ selectedKeys: ["doc-1"], packageTitles }),
    };
  };

  it("returns null without a detail change handler", () => {
    expect(
      getPermitPackageExpandProps({ selectedKeys: ["doc-1"], packageTitles: { titles: {} } })
    ).toBeNull();
  });

  it("only expands selected, unlocked rows, and not on row click", () => {
    const { props } = build();
    expect(props.rowExpandable(record)).toBe(true);
    expect(props.rowExpandable({ key: "other" })).toBe(false);
    expect(props.expandRowByClick).toBe(false);
    expect(props.expandedRowKeys).toEqual(["doc-1"]);
  });

  it("reports expanded keys as strings", () => {
    const { props, packageTitles } = build();
    props.onExpandedRowsChange([1, "doc-1"]);
    expect(packageTitles.onExpandedKeysChange).toHaveBeenCalledWith(["1", "doc-1"]);
  });

  it("shows the saved author and date and reports edits", () => {
    const { props, packageTitles } = build();
    render(<>{props.expandedRowRender(record)}</>);
    expect(screen.getByRole("textbox", { name: "Author" })).toHaveValue("Pat");
    expect(screen.getByRole("textbox", { name: "Date" })).toHaveValue("2024-05-01");

    fireEvent.change(screen.getByRole("textbox", { name: "Author" }), {
      target: { value: "Sam" },
    });
    expect(packageTitles.onDetailChange).toHaveBeenCalledWith("doc-1", "author", "Sam");
  });

  it("reports the picked date as YYYY-MM-DD, or null when it is cleared", () => {
    const { props, packageTitles } = build({ details: {} });
    // antd's picker is awkward to drive in jsdom, so call its onChange as the picker would
    const findDatePicker = (node) => {
      if (!node || typeof node !== "object") return null;
      if (node.type === DatePicker) return node;
      return React.Children.toArray(node.props?.children)
        .map(findDatePicker)
        .find(Boolean);
    };
    const picker = findDatePicker(props.expandedRowRender(record));

    picker.props.onChange(moment("2024-06-02"));
    expect(packageTitles.onDetailChange).toHaveBeenCalledWith("doc-1", "date", "2024-06-02");
    picker.props.onChange(null);
    expect(packageTitles.onDetailChange).toHaveBeenCalledWith("doc-1", "date", null);
  });

  it("renders empty fields for a row with no details yet", () => {
    const { props } = build({ details: {} });
    render(<>{props.expandedRowRender(record)}</>);
    expect(screen.getByRole("textbox", { name: "Author" })).toHaveValue("");
  });
});
