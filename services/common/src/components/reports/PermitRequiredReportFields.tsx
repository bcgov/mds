import { FORM } from "@mds/common/constants/forms";
import { IPermitAmendment, IMineReportSubmission } from "@mds/common/interfaces";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  getPermits,
  getLatestAmendmentByPermitGuid,
  getMineReportPermitRequirementById,
} from "@mds/common/redux/selectors/permitSelectors";
import { getDropdownPermitConditionCategoryOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { required } from "@mds/common/redux/utils/Validate";
import { createDropDownList } from "@mds/common/redux/utils/helpers";
import { Typography, Row, Col } from "antd";
import React, { FC, useEffect, useState } from "react";
import RenderRadioButtons from "../forms/RenderRadioButtons";
import RenderSelect from "../forms/RenderSelect";
import { Field, getFormValues, change } from "@mds/common/components/forms/form";
import { PermitReportInfoBox } from "./ReportInfoBox";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import { uniqBy } from "lodash";

export const PermitReportCodeRequirement: FC<{
  amendment: IPermitAmendment;
  summary?: boolean;
}> = ({ amendment, summary = false }) => {
  const reports = amendment?.mine_report_permit_requirements.filter(report => report.permit_condition_ids.length > 0) || [];
  const reportOptions = createDropDownList(
    uniqBy(reports, "report_name"),
    "report_name",
    "mine_report_permit_requirement_id"
  );

  return (
    <Field
      name="mine_report_permit_requirement_id"
      placeholder="Enter code section number or report name"
      required
      validate={[required]}
      props={{
        label: summary ? (
          "Report Code Requirement"
        ) : (
          <Typography.Title level={5} style={{ display: "inline" }}>
            Report Code Requirement
          </Typography.Title>
        ),
        labelSubtitle: summary
          ? ""
          : "Search for a code section or the report name you would like to submit.",
        data: reportOptions,
      }}
      component={RenderSelect}
    />
  );
};

export const RenderPRRFields: FC<{
  mineGuid: string;
  fullWidth?: boolean;
  summary?: boolean;
  formName?: FORM;
}> = ({ mineGuid, fullWidth = false, summary = false, formName = FORM.VIEW_EDIT_REPORT }) => {
  const dispatch = useAppDispatch();
  const dropdownPermitConditionCategoryOptions = useAppSelector(
    getDropdownPermitConditionCategoryOptions
  );
  const permits = useAppSelector(getPermits);
  const permitDropdown = createDropDownList(permits, "permit_no", "permit_guid");
  const permitMineGuid = permits[0]?.mine_guid;
  const [loaded, setLoaded] = useState(permits.length > 0 && permitMineGuid === mineGuid);
  const isCore = useAppSelector(getIsCore);
  const formValues = useAppSelector(getFormValues(formName)) as IMineReportSubmission;
  const latestAmendment = useAppSelector(getLatestAmendmentByPermitGuid(formValues?.permit_guid));
  const { isFeatureEnabled } = useFeatureFlag();
  const hasValidatedReports =
    isFeatureEnabled(Feature.PERMIT_CONDITIONS_PAGE) &&
    latestAmendment?.conditions_review_completed &&
    latestAmendment?.mine_report_permit_requirements?.length > 0;

  const selectedPermitReportDefinition = useAppSelector(
    getMineReportPermitRequirementById(
      formValues?.permit_guid,
      formValues?.mine_report_permit_requirement_id
    )
  );

  useEffect(() => {
    if (!loaded || permitMineGuid !== mineGuid) {
      setLoaded(false);
      dispatch(fetchPermits(mineGuid)).then(() => setLoaded(true));
    }
  }, [mineGuid]);

  useEffect(() => {
    if (selectedPermitReportDefinition) {
      dispatch(change(formName, "due_date", selectedPermitReportDefinition.initial_due_date));
    }
  }, [selectedPermitReportDefinition]);

  return (
    <>
      {!isCore && (
        <>
          <Typography.Title level={5}>Select permit condition category</Typography.Title>
          <Typography.Paragraph>
            Newer regional permits have sections A to E, which are the same categories shown for
            permit-required report. If your permit does not contain the categories below, select the
            most fitting category. If you are unsure about category selection, please contact the
            permitting inspector or your regional office for assistance.
          </Typography.Paragraph>
        </>
      )}
      <Col md={!fullWidth && 12} sm={24}>
        <Field
          name="permit_guid"
          label="Permit Number"
          required
          validate={[required]}
          data={permitDropdown}
          component={RenderSelect}
        />
      </Col>

      {!isCore && !hasValidatedReports && (
        <Col span={24} className="radio-two-column-container">
          <Field
            name="permit_condition_category_code"
            required
            validate={[required]}
            label="Permit Condition Category"
            className="responsive-2-column"
            component={RenderRadioButtons}
            customOptions={dropdownPermitConditionCategoryOptions}
          />
        </Col>
      )}
      {isCore && !hasValidatedReports && (
        <Col md={!fullWidth && 12} sm={24}>
          <Field
            name="permit_condition_category_code"
            required
            validate={[required]}
            label="Permit Condition Category"
            component={RenderSelect}
            data={dropdownPermitConditionCategoryOptions}
          />
        </Col>
      )}
      {hasValidatedReports && summary && (
        <Col md={!fullWidth && 12} sm={24}>
          <PermitReportCodeRequirement
            amendment={latestAmendment}
            summary={summary}
          />
        </Col>
      )}
      {hasValidatedReports && !summary && (
        <Row gutter={24} className="margin-large--bottom">
          <Col span={12}>
            <div className="light-grey-border">
              <PermitReportCodeRequirement
                amendment={latestAmendment}
              />
            </div>
          </Col>
          <Col span={12}>
            <PermitReportInfoBox
              mineGuid={mineGuid}
              permitGuid={formValues?.permit_guid}
              permitAmendmentGuid={latestAmendment?.permit_amendment_guid}
              permitReport={selectedPermitReportDefinition}
              verb="submitting"
            />
          </Col>
        </Row>
      )}
    </>
  );
};
