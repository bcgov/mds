import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col, Table } from "antd";
import * as Strings from "@/constants/strings";
import RenderField from "@/components/common/RenderField";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const UndergroundExploration = (props) => {
  const columns = [
    {
      title: "Activity",
      dataIndex: "type",
      key: "type",
      render: (text) => <div title="Activity">{text}</div>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <div title="Quantity">{text}</div>,
    },
    {
      title: "Incline",
      dataIndex: "incline",
      key: "incline",
      render: (text) => <div title="Incline">{text}</div>,
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      render: (text) => <div title="Units">{text}</div>,
    },
    {
      title: "Width(m)",
      dataIndex: "width",
      key: "width",
      render: (text) => <div title="Width(m)">{text}</div>,
    },
    {
      title: "Length(km)",
      dataIndex: "length",
      key: "length",
      render: (text) => <div title="Length(km)">{text}</div>,
    },
    {
      title: "Height(m)",
      dataIndex: "height",
      key: "height",
      render: (text) => <div title="Height(m)">{text}</div>,
    },
    {
      title: "Disturbed Area (ha)",
      dataIndex: "disturbedArea",
      key: "disturbedArea",
      render: (text) => <div title="Disturbed Area (ha)">{text}</div>,
    },
    {
      title: "Merchantable timber volume (m3)",
      dataIndex: "timberVolume",
      key: "timberVolume",
      render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
    },
  ];

  const transformData = (activities) =>
    activities.map((activity) => ({
      type: activity.activity_type_description || Strings.EMPTY_FIELD,
      quantity: activity.quantity || Strings.EMPTY_FIELD,
      incline: activity.incline_unit_type_code || Strings.EMPTY_FIELD,
      units: activity.units || Strings.EMPTY_FIELD,
      length: activity.length || Strings.EMPTY_FIELD,
      width: activity.width || Strings.EMPTY_FIELD,
      height: activity.height || Strings.EMPTY_FIELD,
      disturbedArea: activity.disturbed_area || Strings.EMPTY_FIELD,
      timberVolume: activity.timber_volume || Strings.EMPTY_FIELD,
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
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed Activities**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Total Ore</div>
          <Field
            id="total_ore_amount"
            name="total_ore_amount"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Total Waste</div>
          <Field
            id="total_waste_amount"
            name="total_waste_amount"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

UndergroundExploration.propTypes = propTypes;

export default UndergroundExploration;
