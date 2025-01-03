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
import RenderTime from "@mds/common/components/forms/RenderTime";
import RenderYear from "@mds/common/components/forms/RenderYear";

export const renderConfig = {
  SELECT: RenderSelect,
  AUTO_SIZE_FIELD: RenderAutoSizeField,
  AUTOCOMPLETE: RenderAutoComplete,
  DATE: RenderDate,
  YEAR: RenderYear,
  TIME: RenderTime,
  FIELD: RenderField,
  SCROLL_FIELD: RenderAutoSizeField,
  MULTI_SELECT: RenderMultiSelect,
  RADIO: RenderRadioButtons,
  CHECK_BOX: RenderCheckbox,
  GROUP_CHECK_BOX: RenderGroupCheckbox,
  FILE_UPLOAD: RenderFileUpload,
};
