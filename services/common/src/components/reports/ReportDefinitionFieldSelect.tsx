import { formatComplianceCodeReportName } from "@mds/common/redux/utils/helpers";
import React, { useEffect, useState } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@mds/common/redux/rootState";
import { Field } from "@mds/common/components/forms/form";
import { fetchComplianceReports, getMineReportDefinitionOptions, getReportDefinitionsLoaded, reportParamsGetAll } from "@mds/common/redux/slices/complianceReportsSlice";
import RenderSelect from "../forms/RenderSelect";
import { uniqBy } from "lodash";
import moment from "moment";

export interface ReportDefinitionFieldSelectProps {
  id: string;
  name: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  validate?: any[];
}

export const ReportDefinitionFieldSelect = (props: ReportDefinitionFieldSelectProps) => {
  const dispatch = useDispatch();
  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);
  const [formattedMineReportDefinitionOptions, setFormattedMineReportDefinitionOptions] = useState([]);
  const reportDefinitionsLoaded = useSelector(getReportDefinitionsLoaded(reportParamsGetAll));

  useEffect(() => {
    // Format the mine report definition options for the search bar
    const newFormattedMineReportDefinitionOptions = mineReportDefinitionOptions
      .filter((m) => {
        // Only include reports that are linked to a compliance code that have expired
        // Reason: A report definition can only be linked to a single compliance code as it currently stands
        return !m.compliance_articles.find((c) => moment().isBefore(moment(c.expiry_date)));
      })
      .map((report) => {
        return {
          label: formatComplianceCodeReportName(report),
          value: report.mine_report_definition_guid,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    setFormattedMineReportDefinitionOptions(uniqBy(newFormattedMineReportDefinitionOptions, "value"));
  }, [mineReportDefinitionOptions]);

  useEffect(() => {
    if (!reportDefinitionsLoaded) {
      dispatch(fetchComplianceReports(reportParamsGetAll));
    }
  }, []);

  return (
    <Field
      component={RenderSelect}
      id={props.id}
      name={props.name}
      label={props.label || "Report Name"}
      disabled={props.disabled || false}
      props={{
        data: formattedMineReportDefinitionOptions,
      }}
      required={props.required || false}
      placeholder={props.placeholder || "Select a report type"}
      validate={props.validate || undefined}
    />
  );
};
