import { parseConditionText } from "@mds/common/utils/conditionTokenParser";

describe("parseConditionText", () => {
  it("returns a single text token for plain text with no variables", () => {
    expect(parseConditionText("No variables here.")).toEqual([
      { type: "text", value: "No variables here." },
    ]);
  });

  it("parses a single permit package file token", () => {
    expect(parseConditionText("{permit_package_file:abc-123}")).toEqual([
      { type: "permitPackageFile", guid: "abc-123" },
    ]);
  });

  it("parses a regular variable token", () => {
    expect(parseConditionText("{mine_name}")).toEqual([{ type: "variable", value: "{mine_name}" }]);
  });

  it("parses mixed text, variable, and permit package file tokens in order", () => {
    expect(
      parseConditionText("See {permit_package_file:fig-guid} for {mine_name} details.")
    ).toEqual([
      { type: "text", value: "See " },
      { type: "permitPackageFile", guid: "fig-guid" },
      { type: "text", value: " for " },
      { type: "variable", value: "{mine_name}" },
      { type: "text", value: " details." },
    ]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseConditionText("")).toEqual([]);
  });
});
