/**
 * Whether a document row is the original vFCBC file. Reads the flag from the row, then from its nested mine_document,
 * and falls back to `defaultValue` (true for rows that come straight from the vFCBC submission).
 */
export const resolveIsOriginalVfcbcFile = (doc: any, defaultValue = false): boolean =>
  doc?.is_original_vfcbc_file ?? doc?.mine_document?.is_original_vfcbc_file ?? defaultValue;
