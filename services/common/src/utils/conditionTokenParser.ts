export const PERMIT_PACKAGE_FILE_TOKEN_PREFIX = "permit_package_file";
export const getPermitPackageFileToken = (guid: string) => `{${PERMIT_PACKAGE_FILE_TOKEN_PREFIX}:${guid}}`;

export const CONDITION_VARIABLE_REGEX = /{(.*?)}/g;

export type ConditionToken =
  | { type: "text"; value: string }
  | { type: "permitPackageFile"; guid: string }
  | { type: "variable"; value: string };

// Splits a raw condition/preamble string into a sequence of plain-text, `{variable}`, and `{permit_package_file:<guid>}` tokens.
// Shared by ConditionVariableText (text -> JSX) and the Quill Delta serializer (text -> Delta) so both consumers parse condition text identically.
export const parseConditionText = (text: string): ConditionToken[] => {
  const tokens: ConditionToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(CONDITION_VARIABLE_REGEX);

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const token = match[1];
    const fullMatch = match[0];

    if (token.startsWith(`${PERMIT_PACKAGE_FILE_TOKEN_PREFIX}:`)) {
      tokens.push({
        type: "permitPackageFile",
        guid: token.slice(PERMIT_PACKAGE_FILE_TOKEN_PREFIX.length + 1),
      });
    } else {
      tokens.push({ type: "variable", value: fullMatch });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }

  return tokens;
};
