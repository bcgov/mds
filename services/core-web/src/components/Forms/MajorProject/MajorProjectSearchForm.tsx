import React, { FC } from "react";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { Field } from "redux-form";
import { Button, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderResetButton from "@mds/common/components/forms/RenderResetButton";

interface MajorProjectsSearchFormProps {
  onSubmit: (params: any) => void;
  toggleAdvancedSearch: () => void;
  handleReset: () => void;
  isAdvanceSearch: boolean;
  initialValues: any;
}

export const MajorProjectsSearchForm: FC<MajorProjectsSearchFormProps> = ({
  onSubmit,
  toggleAdvancedSearch,
  handleReset,
  isAdvanceSearch,
  initialValues
}) => {

  const handleSearchFormReset = () => {
    handleReset();
  };

  return (
    <FormWrapper
      initialValues={initialValues}
      name={FORM.MAJOR_MINE_APPLICATION_ADVANCED_SEARCH}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
      onSubmit={onSubmit}
      onReset={handleSearchFormReset}
    >
      <Row gutter={6}>
        <Col md={24} xs={24}>
          <Field
            id="search"
            name="search"
            component={RenderField}
            placeholder="Search by mine name or number"
          />
        </Col>
      </Row>
      {isAdvanceSearch && (
        <div>
          <Row gutter={6}>
            <Col md={24} xs={24}>
              <Field
                id="updated_date"
                name="updated_date"
                placeholder="Select Latest Updated Date"
                component={RenderDate}
              />
              <Field
                id="project_lead_name"
                name="project_lead_name"
                placeholder="Search by MCM project lead"
                component={RenderField}
              />
            </Col>
          </Row>
        </div>
      )}
      <div className="left center-mobile">
        <Button className="btn--dropdown" onClick={toggleAdvancedSearch}>
          {isAdvanceSearch ? "Collapse Filters" : "Expand Filters"}
          {isAdvanceSearch ? <UpOutlined /> : <DownOutlined />}
        </Button>
      </div>

      <div className="right center-mobile">
        <RenderResetButton buttonText="Clear Filters" className="full-mobile" />
        <Button className="full-mobile" type="primary" htmlType="submit">
          Apply Filters
        </Button>
      </div>
    </FormWrapper>
  );
}

export default MajorProjectsSearchForm;
