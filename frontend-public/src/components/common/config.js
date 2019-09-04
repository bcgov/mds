import RenderSelect from "./RenderSelect";
import RenderAutoSizeField from "./RenderAutoSizeField";
import RenderDate from "./RenderDate";
import RenderYear from "./RenderYear";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const renderConfig = {
  SELECT: RenderSelect,
  AUTO_SIZE_FIELD: RenderAutoSizeField,
  DATE: RenderDate,
  YEAR: RenderYear,
};
