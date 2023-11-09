import RenderCheckbox from "./RenderCheckbox";
import RenderGroupCheckbox from "./RenderGroupCheckbox";
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
import RenderMineSelect from "./RenderMineSelect";
import RenderLabel from "./RenderLabel";
import RenderFileUpload from "./RenderFileUpload";
import RenderFieldNew from "./RenderFieldNew";
import RenderDateNew from "./RenderDateNew";
import RenderGroupedSelectNew from "./RenderGroupedSelectNew";
import RenderSelectNew from "./RenderSelectNew";
import RenderAutoSizeFieldNew from "./RenderAutoSizeFieldNew";

// This file is anticipated to have multiple exports
export const renderConfig = {
  CHECKBOX: RenderCheckbox,
  GROUP_CHECK_BOX: RenderGroupCheckbox,
  AUTOCOMPLETE: RenderAutocomplete,
  AUTO_SIZE_FIELD: RenderAutoSizeField,
  NEW_AUTO_SIZE_FIELD: RenderAutoSizeFieldNew,
  CASCADER: RenderCascader,
  DATE: RenderDate,
  NEW_DATE: RenderDateNew,
  TIME: RenderTime,
  YEAR: RenderYear,
  FIELD: RenderField,
  NEW_FIELD: RenderFieldNew,
  SCROLL_FIELD: RenderScrollField,
  SELECT: RenderSelect,
  NEW_SELECT: RenderSelectNew,
  LARGE_SELECT: RenderLargeSelect,
  MULTI_SELECT: RenderMultiSelect,
  RADIO: RenderRadioButtons,
  GROUPED_SELECT: RenderGroupedSelect,
  NEW_GROUPED_SELECT: RenderGroupedSelectNew,
  MINE_SELECT: RenderMineSelect,
  LABEL: RenderLabel,
  FILE_UPLOAD: RenderFileUpload,
};
