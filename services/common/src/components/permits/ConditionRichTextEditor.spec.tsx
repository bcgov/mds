import React, { useState } from "react";
import { render } from "@testing-library/react";
import ReactQuill from "react-quill";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import PermitPackageFileBlot from "@mds/common/components/permits/quill/PermitPackageFileBlot";
import ConditionRichTextEditor from "./ConditionRichTextEditor";

const noticeOfWork = {
  application_type_code: "NOW",
  documents: [
    {
      now_application_document_xref_guid: "fig-guid",
      is_final_package: true,
      final_package_order: 1,
      permit_package_document_type_code: "FIGURE",
      preamble_title: "Site Map",
    },
  ],
  filtered_submission_documents: [],
  application_progress: [],
};

// Controlled harness mirroring how a redux-form Field wires input.value/onChange - lets tests
// drive external value changes (simulating a Redux Form reset) and observe what gets committed
// back via onChange.
const ControlledHarness = ({
  initialValue,
  onChangeSpy,
}: {
  initialValue: string;
  onChangeSpy: (value: string) => void;
}) => {
  const [value, setValue] = useState(initialValue);
  return (
    <ConditionRichTextEditor
      input={{
        name: "condition",
        value,
        onChange: (newValue) => {
          setValue(newValue);
          onChangeSpy(newValue);
        },
      }}
    />
  );
};

const renderWithNow = (text: string) =>
  render(
    <ReduxWrapper initialState={{ [NOTICE_OF_WORK]: { noticeOfWork } }}>
      <ConditionRichTextEditor input={{ name: "condition", value: text, onChange: jest.fn() }} />
    </ReduxWrapper>
  );

describe("ConditionRichTextEditor", () => {
  it("renders a resolved permit package file reference as a green pill chip", () => {
    const { container } = renderWithNow("See {permit_package_file:fig-guid} for details.");

    const chip = container.querySelector(".permit-package-file-reference");
    expect(chip).not.toBeNull();
    // Quill's Embed base class wraps every embed in zero-width guard characters (﻿).
    expect(chip?.textContent?.replace(/﻿/g, "")).toBe("1.2 Site Map");
  });

  it("renders an unresolved permit package file reference as a red pill chip", () => {
    const { container } = renderWithNow("See {permit_package_file:deleted-guid} for details.");

    const chip = container.querySelector(".permit-package-file-reference-broken");
    expect(chip).not.toBeNull();
    expect(chip?.querySelector(".permit-package-file-reference-label")?.textContent).toBe(
      "Reference unavailable"
    );
  });

  it("renders plain text content untouched", () => {
    const { container } = renderWithNow("No variables here.");

    expect(container.textContent).toContain("No variables here.");
    expect(container.querySelector(".permit-package-file-reference")).toBeNull();
    expect(container.querySelector(".permit-package-file-reference-broken")).toBeNull();
  });

  it("commits typed changes back through input.onChange as plain text", () => {
    const onChangeSpy = jest.fn();
    const { container } = render(
      <ReduxWrapper initialState={{ [NOTICE_OF_WORK]: { noticeOfWork } }}>
        <ControlledHarness initialValue="Hello world" onChangeSpy={onChangeSpy} />
      </ReduxWrapper>
    );

    const quillContainer = container.querySelector(".ql-container") as HTMLElement;
    const quill = (ReactQuill as any).Quill.find(quillContainer);
    quill.insertText(quill.getLength() - 1, "!");

    expect(onChangeSpy).toHaveBeenCalledWith("Hello world!");
  });

  it("syncs the editor's content when input.value changes externally (e.g. a form reset)", () => {
    const onChangeSpy = jest.fn();
    const { container, rerender } = render(
      <ReduxWrapper initialState={{ [NOTICE_OF_WORK]: { noticeOfWork } }}>
        <ConditionRichTextEditor
          input={{ name: "condition", value: "Original text", onChange: onChangeSpy }}
        />
      </ReduxWrapper>
    );

    expect(container.textContent).toContain("Original text");

    rerender(
      <ReduxWrapper initialState={{ [NOTICE_OF_WORK]: { noticeOfWork } }}>
        <ConditionRichTextEditor
          input={{ name: "condition", value: "See {permit_package_file:fig-guid} now", onChange: onChangeSpy }}
        />
      </ReduxWrapper>
    );

    expect(container.textContent).not.toContain("Original text");
    const chip = container.querySelector(".permit-package-file-reference");
    expect(chip?.textContent?.replace(/﻿/g, "")).toBe("1.2 Site Map");
  });

  it("rebuilds a pasted permit package file chip as a clean embed, re-resolved against this editor's own data", () => {
    const { container } = render(
      <ReduxWrapper initialState={{ [NOTICE_OF_WORK]: { noticeOfWork } }}>
        <ConditionRichTextEditor input={{ name: "condition", value: "Start ", onChange: jest.fn() }} />
      </ReduxWrapper>
    );

    const quillContainer = container.querySelector(".ql-container") as HTMLElement;
    const quill = (ReactQuill as any).Quill.find(quillContainer);

    // Simulates pasting a chip copied from elsewhere where it was stale/unresolved (e.g. a
    // different editor's NoW context, or the guid's title had since changed) - the pasted markup
    // itself claims "not found", but this editor's own NoW data does resolve "fig-guid".
    const pastedNode = PermitPackageFileBlot.create({ guid: "fig-guid", found: false }) as HTMLElement;
    const delta = quill.clipboard.convert(pastedNode.outerHTML);

    const embedOp = delta.ops.find((op: any) => typeof op.insert === "object" && op.insert.permitPackageFile);
    expect(embedOp.insert.permitPackageFile).toEqual({
      guid: "fig-guid",
      found: true,
      label: "1.2 Site Map",
    });
  });
});
