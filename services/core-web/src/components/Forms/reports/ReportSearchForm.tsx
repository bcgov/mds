import React, { FC, useEffect, useState } from "react";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { isEmpty, some, negate } from "lodash";
import { Field } from "@mds/common/components/forms/form";
import { Button, Col, Row } from "antd";
import {
  getDropdownMineReportStatusOptions,
  getDropdownMineReportCategoryOptions,
  getMineRegionDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { fetchComplianceReports, getDropdownMineReportDefinitionOptions, getReportDefinitionsLoaded, reportParamsGetAll } from "@mds/common/redux/slices/complianceReportsSlice";
import { sortListObjectsByPropertyLocaleCompare } from "@mds/common/redux/utils/helpers"
import * as FORM from "@/constants/forms";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderResetButton from "@mds/common/components/forms/RenderResetButton";
import { useAppSelector as useSelector, useAppDispatch as useDispatch } from "@mds/common/redux/rootState";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderMultiSelect from "@mds/common/components/forms/RenderMultiSelect";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderSelect from "@mds/common/components/forms/RenderSelect";

interface ReportSearchFormProps {
  onSubmit: (values) => void | Promise<void>;
  handleReset: () => void | Promise<void>;
  initialValues: any;
}

export const ReportSearchForm: FC<ReportSearchFormProps> = (props) => {
  const dispatch = useDispatch();
  const mineRegionOptions = useSelector(getMineRegionDropdownOptions);
  const dropdownMineReportStatusOptions = useSelector((state) => getDropdownMineReportStatusOptions(state, false));
  const dropdownMineReportCategoryOptions = useSelector((state) => getDropdownMineReportCategoryOptions(state, false));
  const dropdownMineReportDefinitionOptions = useSelector((state) => getDropdownMineReportDefinitionOptions(state, false));
  const [receivedFirstInitialValues, setReceivedFirstInitialValues] = useState(false);
  const [expandAdvancedSearch, setExpandAdvancedSearch] = useState(false);

  const reportsLoaded = useSelector(getReportDefinitionsLoaded(reportParamsGetAll));

  useEffect(() => {
    if (!reportsLoaded) {
      dispatch(fetchComplianceReports(reportParamsGetAll));
    }
  }, []);

  const handleReset = () => {
    props.handleReset();
  };

  const toggleIsAdvancedSearch = () => {
    setExpandAdvancedSearch(!expandAdvancedSearch);
  }

  const haveAdvancedSearchFilters = ({
    report_type,
    report_name,
    due_date_after,
    due_date_before,
    received_date_after,
    received_date_before,
    received_only,
    compliance_year,
    status,
    requested_by,
    major,
    region,
  }) =>
    due_date_after ||
    due_date_before ||
    received_date_after ||
    received_date_before ||
    received_only ||
    compliance_year ||
    requested_by ||
    major ||
    some([report_type, report_name, status, region], negate(isEmpty));

  useEffect(() => {
    if (!receivedFirstInitialValues) {
      setReceivedFirstInitialValues(true);
      const hasAdvancedFilters = haveAdvancedSearchFilters(props.initialValues);
      setExpandAdvancedSearch(hasAdvancedFilters && hasAdvancedFilters !== "false");
    }
  }, [props.initialValues]);

  return (
    <FormWrapper
      initialValues={props.initialValues}
      name={FORM.REPORT_ADVANCED_SEARCH}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
      onSubmit={props.onSubmit} onReset={handleReset}>
      <Row gutter={6}>
        <Col md={24} xs={24}>
          <Field
            id="search"
            name="search"
            placeholder="Search by mine name or number"
            component={RenderField}
            allowClear
          />
        </Col>
      </Row>
      {expandAdvancedSearch && (
        <div>
          <Row gutter={6}>
            <Col md={12} xs={24}>
              <Field
                id="report_type"
                name="report_type"
                placeholder="Select Report Type"
                component={RenderMultiSelect}
                data={dropdownMineReportCategoryOptions}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="report_name"
                name="report_name"
                placeholder="Select Report Name"
                component={RenderMultiSelect}
                data={sortListObjectsByPropertyLocaleCompare(
                  dropdownMineReportDefinitionOptions,
                  "label"
                )}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col md={12} xs={24}>
              <Field
                id="due_date_after"
                name="due_date_after"
                placeholder="Select Earliest Due Date"
                component={RenderDate}
                allowClear
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="due_date_before"
                name="due_date_before"
                placeholder="Select Latest Due Date"
                component={RenderDate}
                allowClear
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col md={8} xs={24}>
              <Field
                id="received_date_after"
                name="received_date_after"
                placeholder="Select Earliest Received Date"
                component={RenderDate}
                allowClear
              />
            </Col>
            <Col md={8} xs={24}>
              <Field
                id="received_date_before"
                name="received_date_before"
                placeholder="Select Latest Received Date"
                component={RenderDate}
                allowClear
              />
            </Col>
            <Col md={8} xs={24}>
              <Field
                id="received_only"
                name="received_only"
                component={RenderSelect}
                data={[
                  { value: "", label: "Received Only" },
                  { value: "false", label: "Received and Unreceived" },
                ]}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col md={12} xs={24}>
              <Field
                id="compliance_year"
                name="compliance_year"
                placeholder="Select Compliance Year"
                component={RenderDate}
                yearMode
                allowClear
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="status"
                name="status"
                placeholder="Select Report Status"
                component={RenderMultiSelect}
                data={dropdownMineReportStatusOptions}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col xs={24}>
              <Field
                id="requested_by"
                name="requested_by"
                placeholder="Search Requested By"
                component={RenderField}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col md={12} xs={24}>
              <Field
                id="major"
                name="major"
                component={RenderSelect}
                data={[
                  { value: "", label: "Major and Regional Mines" },
                  { value: "true", label: "Major Mine" },
                  { value: "false", label: "Regional Mine" },
                ]}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="region"
                name="region"
                placeholder="Select Mine Region"
                component={RenderMultiSelect}
                data={mineRegionOptions}
              />
            </Col>
          </Row>
        </div>
      )}
      <div className="left center-mobile">
        <Button className="btn--dropdown" onClick={toggleIsAdvancedSearch}>
          {expandAdvancedSearch ? "Collapse Filters" : "Expand Filters"}
          {expandAdvancedSearch ? <UpOutlined /> : <DownOutlined />}
        </Button>
      </div>
      <div className="right center-mobile">
        <RenderResetButton className="full-mobile" buttonText="Clear Filters" />
        <Button className="full-mobile" type="primary" htmlType="submit">
          Apply Filters
        </Button>
      </div>
    </FormWrapper>
  );
}

export default ReportSearchForm;
