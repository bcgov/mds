import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col, Table } from "antd";
import * as Strings from "@/constants/strings";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const SurfaceBulkSamples = (props) => {
  const columns = [
    {
      title: "Activity",
      dataIndex: "type",
      key: "type",
      render: (text) => <div title="Access Type">{text}</div>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <div title="Quantity">{text}</div>,
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
          <div className="field-title">Processing Methods</div>
          <Field
            id="processing_method_description"
            name="processing_method_description"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Bed rock expansion**</div>
          <Field id="" name="" component={RenderRadioButtons} disabled={props.isViewMode} />
        </Col>
      </Row>
      {props.initialValues.equipment && <Equipment equipment={props.initialValues.equipment} />}
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
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Surface water damage**</div>
          <Field id="" name="" component={RenderAutoSizeField} disabled={props.isViewMode} />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Spontaneous Combustion**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
      </Row>
    </div>
  );
};

SurfaceBulkSamples.propTypes = propTypes;

export default SurfaceBulkSamples;
