import React, { FC, FormEventHandler, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, getFormValues, reset } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import {
  getDropdownMineReportCategoryOptions,
  getDropdownMineReportStatusOptions,
  getDropdownPermitConditionCategoryOptions,
  getMineReportDefinitionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { createDropDownList, sortListObjectsByPropertyLocaleCompare } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import * as Strings from "@mds/common/constants/strings";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { MineReportParams } from "@mds/common";

interface ReportFilterFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
  onReset: () => void;
  initialValues: MineReportParams;
  mineReportType: string;
}

export const ReportFilterForm: FC<ReportFilterFormProps> = ({
  onReset,
  onSubmit,
  initialValues,
  mineReportType,
}) => {
  const dispatch = useDispatch();
  const [
    dropdownMineReportDefinitionOptionsFiltered,
    setDropdownMineReportDefinitionOptionsFiltered,
  ] = useState([]);
  const [
    dropdownMineReportCategoryOptionsFiltered,
    setDropdownMineReportCategoryOptionsFiltered,
  ] = useState();

  const permits = useSelector(getPermits);
  const dropdownMineReportStatusOptions = useSelector(getDropdownMineReportStatusOptions);
  const dropdownPermitConditionCategoryOptions = useSelector(
    getDropdownPermitConditionCategoryOptions
  );
  const dropdownMineReportCategoryOptions = useSelector(getDropdownMineReportCategoryOptions);
  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);
  const {
    report_type: selectedMineReportCategory,
    report_name: selectedMineReportDefinitionGuid,
  } = useSelector((state) => getFormValues(FORM.FILTER_REPORTS)(state) ?? {});

  const handleReset = () => {
    dispatch(reset(FORM.FILTER_REPORTS));
    onReset();
  };

  const updateMineReportDefinitionOptions = (
    mineReportDefinitionOptions,
    selectedMineReportCategory = undefined
  ) => {
    let mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions;

    if (selectedMineReportCategory) {
      mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions.filter(
        (rd) =>
          rd.categories.filter((c) => c.mine_report_category === selectedMineReportCategory)
            .length > 0
      );
    }

    let newDropdownMineReportDefinitionOptionsFiltered = createDropDownList(
      mineReportDefinitionOptionsFiltered,
      "report_name",
      "mine_report_definition_guid"
    );
    newDropdownMineReportDefinitionOptionsFiltered = sortListObjectsByPropertyLocaleCompare(
      newDropdownMineReportDefinitionOptionsFiltered,
      "label"
    );

    setDropdownMineReportDefinitionOptionsFiltered(newDropdownMineReportDefinitionOptionsFiltered);
  };

  const updateMineReportCategoryOptions = (
    dropdownMineReportCategoryOptions,
    selectedMineReportDefinitionGuid = undefined
  ) => {
    let newDropdownMineReportCategoryOptionsFiltered = dropdownMineReportCategoryOptions;

    if (selectedMineReportDefinitionGuid) {
      const selectedMineReportDefinition = mineReportDefinitionOptions.filter(
        (option) => option.mine_report_definition_guid === selectedMineReportDefinitionGuid
      )[0];

      newDropdownMineReportCategoryOptionsFiltered = dropdownMineReportCategoryOptions.filter(
        (cat) =>
          selectedMineReportDefinition.categories
            .map((category) => category.mine_report_category)
            .includes(cat.value)
      );
    }

    setDropdownMineReportCategoryOptionsFiltered(newDropdownMineReportCategoryOptionsFiltered);
  };

  useEffect(() => {
    updateMineReportDefinitionOptions(mineReportDefinitionOptions);
    updateMineReportCategoryOptions(dropdownMineReportCategoryOptions);
  }, []);

  useEffect(() => {
    updateMineReportDefinitionOptions(mineReportDefinitionOptions);
  }, [mineReportDefinitionOptions]);

  useEffect(() => {
    updateMineReportCategoryOptions(mineReportDefinitionOptions);
  }, [dropdownMineReportCategoryOptions]);

  useEffect(() => {
    updateMineReportDefinitionOptions(mineReportDefinitionOptions, selectedMineReportCategory);
  }, [selectedMineReportCategory]);

  useEffect(() => {
    updateMineReportCategoryOptions(
      dropdownMineReportCategoryOptions,
      selectedMineReportDefinitionGuid
    );
  }, [selectedMineReportDefinitionGuid]);

  let permitDropdown = [];
  if (permits) {
    permitDropdown = createDropDownList(permits, "permit_no", "permit_guid");
  }

  return (
    <FormWrapper
      name={FORM.FILTER_REPORTS}
      reduxFormConfig={{ touchOnBlur: false, enableReinitialize: true }}
      onSubmit={onSubmit}
      initialValues={initialValues}
    >
      <Form layout="vertical" onReset={handleReset}>
        <div>
          <Row gutter={16}>
            <Col md={8} sm={24}>
              <Field
                id="report_type"
                name="report_type"
                label="Report Type"
                placeholder="Select report type"
                component={renderConfig.SELECT}
                data={
                  mineReportType === Strings.MINE_REPORTS_TYPE.codeRequiredReports
                    ? dropdownMineReportCategoryOptionsFiltered
                    : dropdownPermitConditionCategoryOptions
                }
                format={null}
              />
            </Col>
            {mineReportType === Strings.MINE_REPORTS_TYPE.codeRequiredReports && (
              <Col md={8} sm={24}>
                <Field
                  id="report_name"
                  name="report_name"
                  label="Report Name"
                  placeholder="Select report name"
                  component={renderConfig.SELECT}
                  data={dropdownMineReportDefinitionOptionsFiltered}
                  format={null}
                />
              </Col>
            )}
            {mineReportType === Strings.MINE_REPORTS_TYPE.permitRequiredReports && (
              <Col md={8} sm={24}>
                <Field
                  id="permit_guid"
                  name="permit_guid"
                  label="Permit"
                  placeholder="Select a Permit"
                  component={renderConfig.SELECT}
                  data={permitDropdown}
                  format={null}
                />
              </Col>
            )}
            <Col md={8} sm={24}>
              <Field
                id="compliance_year"
                name="compliance_year"
                label="Compliance Year"
                placeholder="Select compliance year"
                component={renderConfig.YEAR}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={8} sm={24}>
              <Form.Item label="Due Date Range">
                <Row gutter={16}>
                  <Col md={12} sm={24}>
                    <Field
                      id="due_date_start"
                      name="due_date_start"
                      placeholder="Select earliest date"
                      component={renderConfig.DATE}
                    />
                  </Col>
                  <Col md={12} sm={24}>
                    <Field
                      id="due_date_end"
                      name="due_date_end"
                      placeholder="Select latest date"
                      component={renderConfig.DATE}
                    />
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item label="Received Date Range">
                <Row gutter={16}>
                  <Col md={12} sm={24}>
                    <Field
                      id="received_date_start"
                      name="received_date_start"
                      placeholder="Select earliest date"
                      component={renderConfig.DATE}
                    />
                  </Col>
                  <Col md={12} sm={24}>
                    <Field
                      id="received_date_end"
                      name="received_date_end"
                      placeholder="Select latest date"
                      component={renderConfig.DATE}
                    />
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Field
                id="requested_by"
                name="requested_by"
                label="Requested By"
                placeholder="Enter keyword"
                component={renderConfig.FIELD}
                allowClear
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={8} sm={24}>
              <Field
                id="status"
                name="status"
                label="Status"
                placeholder="Select status"
                component={renderConfig.MULTI_SELECT}
                data={dropdownMineReportStatusOptions}
                format={null}
              />
            </Col>
            <Col md={8} sm={24}>
              <Field
                id="received_only"
                name="received_only"
                label="Received Status"
                placeholder="Select received status"
                component={renderConfig.SELECT}
                data={[
                  { value: "true", label: "Received Only" },
                  {
                    value: "false",
                    label: "Received and Unreceived",
                  },
                ]}
                format={null}
              />
            </Col>
          </Row>
        </div>
        <div className="right center-mobile">
          <Button className="full-mobile" htmlType="reset">
            Clear Filters
          </Button>
          <Button className="full-mobile" type="primary" htmlType="submit">
            Apply Filters
          </Button>
        </div>
      </Form>
    </FormWrapper>
  );
};

export default ReportFilterForm;
