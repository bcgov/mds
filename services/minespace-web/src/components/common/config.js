import RenderSelect from "./RenderSelect";
import RenderAutoSizeField from "./RenderAutoSizeField";
import RenderDate from "./RenderDate";
import RenderYear from "./RenderYear";
import RenderTime from "./RenderTime";
import RenderField from "./RenderField";
import RenderScrollField from "./RenderScrollField";
import RenderMultiSelect from "./RenderMultiSelect";
import RenderRadioButtons from "./RenderRadioButtons";
import RenderCheckbox from "./RenderCheckbox";
import RenderGroupCheckbox from "./RenderGroupCheckbox";
import RenderRadio from "./RenderRadio";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const renderConfig = {
  SELECT: RenderSelect,
  AUTO_SIZE_FIELD: RenderAutoSizeField,
  DATE: RenderDate,
  YEAR: RenderYear,
  TIME: RenderTime,
  FIELD: RenderField,
  SCROLL_FIELD: RenderScrollField,
  MULTI_SELECT: RenderMultiSelect,
  RADIO: RenderRadioButtons,
  CHECK_BOX: RenderCheckbox,
  GROUP_CHECK_BOX: RenderGroupCheckbox,
  SINGLE_RADIO: RenderRadio,
};
