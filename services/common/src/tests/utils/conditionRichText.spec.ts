import {
  conditionTextToQuillDelta,
  quillDeltaToConditionText,
} from "@mds/common/utils/conditionRichText";

describe("conditionTextToQuillDelta", () => {
  it("converts plain text to a single text op plus trailing newline", () => {
    expect(conditionTextToQuillDelta("No variables here.")).toEqual({
      ops: [{ insert: "No variables here." }, { insert: "\n" }],
    });
  });

  it("converts a permit package file token to an embed op", () => {
    expect(conditionTextToQuillDelta("{permit_package_file:abc-123}")).toEqual({
      ops: [{ insert: { permitPackageFile: { guid: "abc-123" } } }, { insert: "\n" }],
    });
  });

  it("converts a regular variable token to a plain text op", () => {
    expect(conditionTextToQuillDelta("{mine_name}")).toEqual({
      ops: [{ insert: "{mine_name}" }, { insert: "\n" }],
    });
  });

  it("converts mixed text and tokens into ordered ops", () => {
    expect(conditionTextToQuillDelta("See {permit_package_file:fig-guid} for details.")).toEqual({
      ops: [
        { insert: "See " },
        { insert: { permitPackageFile: { guid: "fig-guid" } } },
        { insert: " for details." },
        { insert: "\n" },
      ],
    });
  });

  it("handles an empty string", () => {
    expect(conditionTextToQuillDelta("")).toEqual({ ops: [{ insert: "\n" }] });
  });
});

describe("quillDeltaToConditionText", () => {
  it("reconstructs plain text and strips the trailing newline", () => {
    expect(quillDeltaToConditionText({ ops: [{ insert: "No variables here." }, { insert: "\n" }] })).toBe(
      "No variables here."
    );
  });

  it("reconstructs a permit package file token from an embed op", () => {
    expect(
      quillDeltaToConditionText({
        ops: [{ insert: { permitPackageFile: { guid: "abc-123" } } }, { insert: "\n" }],
      })
    ).toBe("{permit_package_file:abc-123}");
  });

  it("reconstructs mixed content in order", () => {
    expect(
      quillDeltaToConditionText({
        ops: [
          { insert: "See " },
          { insert: { permitPackageFile: { guid: "fig-guid" } } },
          { insert: " for details." },
          { insert: "\n" },
        ],
      })
    ).toBe("See {permit_package_file:fig-guid} for details.");
  });

  it("handles a delta with no trailing newline gracefully", () => {
    expect(quillDeltaToConditionText({ ops: [{ insert: "no trailing newline" }] })).toBe(
      "no trailing newline"
    );
  });
});

describe("round trip", () => {
  const cases = [
    "",
    "No variables here.",
    "{mine_name} references {permit_package_file:fig-guid} and {mine_no}.",
    "Multiple {permit_package_file:a} refs {permit_package_file:b} in a row.",
    "{permit_package_file:only-token}",
  ];

  it.each(cases)("preserves %p through text -> delta -> text", (text) => {
    expect(quillDeltaToConditionText(conditionTextToQuillDelta(text))).toBe(text);
  });
});
