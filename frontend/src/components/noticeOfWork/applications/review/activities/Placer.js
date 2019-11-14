import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col, Table } from "antd";
import * as Strings from "@/constants/strings";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderField from "@/components/common/RenderField";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const Placer = (props) => {
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
      width: activity.width || Strings.EMPTY_FIELD,
      quantity: activity.quantity || Strings.EMPTY_FIELD,
      length: activity.length || Strings.EMPTY_FIELD,
      disturbedArea: activity.disturbed_area || Strings.EMPTY_FIELD,
      timberVolume: activity.timber_volume || Strings.EMPTY_FIELD,
    }));

  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Is this an application for Underground Placer Operations?
          </div>
          <Field
            id="is_underground"
            name="is_underground"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Is this an application for Hand Operations?</div>
          <Field
            id="is_hand_operation"
            name="is_hand_operation"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
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
          <div className="field-title">Proposed Production**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
      </Row>
      <br />
      {props.initialValues.equipment && <Equipment equipment={props.initialValues.equipment} />}

      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Total area of planned reclamation this year</div>
          <Field
            id="total_disturbed_area"
            name="total_disturbed_area"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
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
            id="reclamation_cost"
            name="reclamation_cost"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

Placer.propTypes = propTypes;

export default Placer;
