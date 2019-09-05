import { chain, flatMap, uniqBy } from "lodash";
import { createSelector } from "reselect";
import * as staticContentReducer from "@/reducers/staticContentReducer";
import { createLabelHash, createDropDownList, compareCodes } from "@/utils/helpers";

export const { getMineReportDefinitionOptions } = staticContentReducer;

export const getDropdownMineReportDefinitionOptions = createSelector(
  [getMineReportDefinitionOptions],
  (options) => createDropDownList(options, "report_name", "mine_report_definition_guid")
);

export const getDropdownMineReportCategoryOptions = createSelector(
  [getMineReportDefinitionOptions],
  (options) =>
    createDropDownList(
      uniqBy(flatMap(options, "categories"), "mine_report_category"),
      "description",
      "mine_report_category"
    )
);
