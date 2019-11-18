import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col, Table } from "antd";
import * as Strings from "@/constants/strings";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const WaterSupply = (props) => {
  const columns = [
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (text) => <div title="Source">{text}</div>,
    },
    {
      title: "Activity",
      dataIndex: "type",
      key: "type",
      render: (text) => <div title="Activity">{text}</div>,
    },
    {
      title: "Water Use",
      dataIndex: "water",
      key: "water",
      render: (text) => <div title="Water Use">{text}</div>,
    },
    {
      title: "Estimate",
      dataIndex: "estimate",
      key: "estimate",
      render: (text) => <div title="Estimate">{text}</div>,
    },
  ];

  const transformData = (activities) =>
    activities.map((activity) => ({
      source: activity.supply_source_description || Strings.EMPTY_FIELD,
      type: activity.activity_type_description || Strings.EMPTY_FIELD,
      water: activity.water_use_description || Strings.EMPTY_FIELD,
      estimate: activity.estimate_rate || Strings.EMPTY_FIELD,
    }));

  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={transformData(props.initialValues.details ? props.initialValues.details : [])}
        locale={{
          emptyText: "No data",
        }}
      />
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
          </div>
          <Field
            id="reclamation_description"
            name="reclamation_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Estimated Cost of reclamation activities described above
          </div>
          <Field
            id="reclamation_description"
            name="reclamation_description"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

WaterSupply.propTypes = propTypes;

export default WaterSupply;
