import RenderAutoComplete from "@mds/common/components/forms/RenderAutoComplete";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderCheckbox from "@mds/common/components/forms/RenderCheckbox";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderFileUpload from "@mds/common/components/forms/RenderFileUpload";
import RenderGroupCheckbox from "@mds/common/components/forms/RenderGroupCheckbox";
import RenderMultiSelect from "@mds/common/components/forms/RenderMultiSelect";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderCascader from "@mds/common/components/forms/RenderCascader";
import RenderGroupedSelect from "@mds/common/components/forms/RenderGroupedSelect";
import RenderLargeSelect from "@mds/common/components/forms/RenderLargeSelect";
import RenderTime from "@mds/common/components/forms/RenderTime";
import RenderLabel from "./RenderLabel";
import RenderYear from "@mds/common/components/forms/RenderYear";

export const renderConfig = {
  CHECKBOX: RenderCheckbox,
  GROUP_CHECK_BOX: RenderGroupCheckbox,
  AUTOCOMPLETE: RenderAutoComplete,
  AUTO_SIZE_FIELD: RenderAutoSizeField,
  CASCADER: RenderCascader,
  DATE: RenderDate,
  TIME: RenderTime,
  YEAR: RenderYear,
  FIELD: RenderField,
  SCROLL_FIELD: RenderAutoSizeField,
  SELECT: RenderSelect,
  LARGE_SELECT: RenderLargeSelect,
  MULTI_SELECT: RenderMultiSelect,
  RADIO: RenderRadioButtons,
  GROUPED_SELECT: RenderGroupedSelect,
  LABEL: RenderLabel,
  FILE_UPLOAD: RenderFileUpload,
};
