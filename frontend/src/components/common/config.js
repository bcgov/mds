import RenderCheckbox from "./RenderCheckbox";
import RenderAutocomplete from "./RenderAutoComplete";
import RenderAutoSizeField from "./RenderAutoSizeField";
import RenderCascader from "./RenderCascader";
import RenderDate from "./RenderDate";
import RenderTime from "./RenderTime";
import RenderYear from "./RenderYear";
import RenderField from "./RenderField";
import RenderScrollField from "./RenderScrollField";
import RenderLargeSelect from "./RenderLargeSelect";
import RenderSelect from "./RenderSelect";
import RenderMultiSelect from "./RenderMultiSelect";
import RenderRadioButtons from "./RenderRadioButtons";
import RenderGroupedSelect from "./RenderGroupedSelect";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const renderConfig = {
  CHECKBOX: RenderCheckbox,
  AUTOCOMPLETE: RenderAutocomplete,
  AUTO_SIZE_FIELD: RenderAutoSizeField,
  CASCADER: RenderCascader,
  DATE: RenderDate,
  TIME: RenderTime,
  YEAR: RenderYear,
  FIELD: RenderField,
  SCROLL_FIELD: RenderScrollField,
  SELECT: RenderSelect,
  LARGE_SELECT: RenderLargeSelect,
  MULTI_SELECT: RenderMultiSelect,
  RADIO: RenderRadioButtons,
  GROUPED_SELECT: RenderGroupedSelect,
};
