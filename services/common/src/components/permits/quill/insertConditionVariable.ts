import Quill from "quill";
import { parseConditionText } from "@mds/common/utils/conditionTokenParser";
import { PermitPackageFileResolver } from "@mds/common/utils/conditionRichText";
import { PERMIT_PACKAGE_FILE_BLOT_NAME } from "./PermitPackageFileBlot";

// Inserts a CDV menu selection (the menu item's `key`, e.g. "{mine_name}" or "{permit_package_file:<guid>}") at the editor's current/last-known cursor position.
// quill.getSelection(true) re-focuses the editor first, even though the dropdown click just stole focus.
// This is the Quill equivalent of the old textarea's persisted selectionStart.
export const insertConditionVariableIntoQuill = (
  quill: Quill,
  key: string,
  resolveReference: PermitPackageFileResolver
) => {
  const range = quill.getSelection(true) ?? { index: quill.getLength() - 1, length: 0 };
  const [token] = parseConditionText(key);

  if (token?.type === "permitPackageFile") {
    const resolved = resolveReference(token.guid);
    quill.insertEmbed(range.index, PERMIT_PACKAGE_FILE_BLOT_NAME, { guid: token.guid, ...resolved }, "user");
    quill.setSelection(range.index + 1, 0, "user");
    return;
  }

  const before = range.index > 0 ? quill.getText(range.index - 1, 1) : "";
  const after = quill.getText(range.index, 1);
  const needsLeadingSpace = before !== "" && before !== " " && before !== "\n";
  const needsTrailingSpace = after !== "" && after !== " " && after !== "\n";
  const textToInsert = `${needsLeadingSpace ? " " : ""}${key}${needsTrailingSpace ? " " : ""}`;

  quill.insertText(range.index, textToInsert, "user");
  quill.setSelection(range.index + textToInsert.length, 0, "user");
};
