import React, { FC } from "react";
import { Col, Row } from "antd";
import ReportSearchForm from "@/components/Forms/reports/ReportSearchForm";

interface ReportsSearchProps {
  handleSearch: (newParams: any) => void;
  handleReset: () => void;
  initialValues: Record<string, any>;
}

export const ReportsSearch: FC<ReportsSearchProps> = ({
  handleSearch,
  handleReset,
  initialValues,
}) => (
  <div>
    <Row>
      <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
        <span className="advanced-search__container">
          <ReportSearchForm
            onSubmit={handleSearch}
            handleReset={handleReset}
            initialValues={initialValues}
          />
        </span>
      </Col>
    </Row>
  </div>
);

export default ReportsSearch;
