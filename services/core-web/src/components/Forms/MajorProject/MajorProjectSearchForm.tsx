import React, { FC } from "react";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { Field } from "redux-form";
import { Button, Col, Row } from "antd";

import * as FORM from "@/constants/forms";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

interface MajorProjectsSearchFormProps {
  handleSubmit: (params: any) => void;
  toggleAdvancedSearch: () => void;
  handleReset: () => void;
  reset: any;
  isAdvanceSearch: boolean;
}


export const MajorProjectsSearchForm: FC<MajorProjectsSearchFormProps> = ({
  handleSubmit,
  toggleAdvancedSearch,
  handleReset,
  reset,
  isAdvanceSearch,
}) => {
  const handleSearchFormReset = () => {
    reset();
    handleReset();
  };

  return (
    <FormWrapper
      name={FORM.MAJOR_MINE_APPLICATION_ADVANCED_SEARCH}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
      onSubmit={() => { }}
    // TODO: deal with
    // onReset={handleSearchFormReset}
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
                placeholder="Search by EMLI project lead"
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
        {/* @ts-ignore */}
        <Button className="full-mobile" type="secondary" htmlType="reset">
          Clear Filters
        </Button>
        <Button className="full-mobile" type="primary" htmlType="submit" onClick={handleSubmit}>
          Apply Filters
        </Button>
      </div>
    </FormWrapper>
  );
}

export default MajorProjectsSearchForm;
