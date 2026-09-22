import { getPermitPackageFileToken, parseConditionText } from "@mds/common/utils/conditionTokenParser";

export interface PermitPackageFileEmbedValue {
  guid: string;
  // Only populated once resolved against live NoW/document data
  found?: boolean;
  label?: string;
}

// Minimal structural typing for the subset of Quill's Delta shape this serializer needs - avoids a hard dependency on Quill's own types.
export interface ConditionDeltaOp {
  insert: string | { permitPackageFile: PermitPackageFileEmbedValue };
}

export interface ConditionDelta {
  ops: ConditionDeltaOp[];
}

// Converts a raw condition string (the exact shape, including literal `{permit_package_file:<guid>}` tokens) into a Quill Delta.
// This ensures plain text stays plain text, and each permit-package-file token becomes an atomic embed.
// A trailing "\n" is always appended, since Quill requires document content to end in a newline.
export const conditionTextToQuillDelta = (text: string): ConditionDelta => {
  const tokens = parseConditionText(text);
  const ops: ConditionDeltaOp[] = tokens.map((token) =>
    token.type === "permitPackageFile"
      ? { insert: { permitPackageFile: { guid: token.guid } } }
      : { insert: token.value }
  );
  ops.push({ insert: "\n" });
  return { ops };
};

// Inverse of conditionTextToQuillDelta: reconstructs the exact raw condition string (with literal `{permit_package_file:<guid>}` tokens) from a Quill Delta.
// This ensures the value stored in Redux Form / submitted to the backend never changes shape.
// Strips the single trailing "\n" Quill always adds to document content.
export const quillDeltaToConditionText = (delta: ConditionDelta): string => {
  const raw = delta.ops
    .map((op) => {
      if (typeof op.insert === "string") {
        return op.insert;
      }
      if (op.insert && "permitPackageFile" in op.insert) {
        return getPermitPackageFileToken(op.insert.permitPackageFile.guid);
      }
      return "";
    })
    .join("");

  return raw.endsWith("\n") ? raw.slice(0, -1) : raw;
};

export type PermitPackageFileResolver = (guid: string) => { found: boolean; label?: string };

// Like conditionTextToQuillDelta, but enriches each permit-package-file embed with its live resolved found/label data via resolveReference.
// Used to build the Delta actually fed into the Quill editor, so chips render their pill immediately instead of needing a second pass.
export const conditionTextToResolvedQuillDelta = (
  text: string,
  resolveReference: PermitPackageFileResolver
): ConditionDelta => {
  const tokens = parseConditionText(text);
  const ops: ConditionDeltaOp[] = tokens.map((token) => {
    if (token.type === "permitPackageFile") {
      const resolved = resolveReference(token.guid);
      return { insert: { permitPackageFile: { guid: token.guid, ...resolved } } };
    }
    return { insert: token.value };
  });
  ops.push({ insert: "\n" });
  return { ops };
};
