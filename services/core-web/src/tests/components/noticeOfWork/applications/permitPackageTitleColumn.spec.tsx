import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
