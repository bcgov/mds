import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col, Table } from "antd";
import * as Strings from "@/constants/strings";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const SettlingPonds = (props) => {
  const columns = [
    {
      title: "Pond ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <div title="Pond ID">{text}</div>,
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
      title: "Depth(m)",
      dataIndex: "depth",
      key: "depth",
      render: (text) => <div title="Depth(m)">{text}</div>,
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
      id: activity.activity_type_description || Strings.EMPTY_FIELD,
      width: activity.width || Strings.EMPTY_FIELD,
      depth: activity.depth || Strings.EMPTY_FIELD,
      length: activity.length || Strings.EMPTY_FIELD,
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
          <div className="field-title">
            Disposal of fines from clean out (i.e. use as a subsoil material)**
          </div>
          <Field id="" name="" component={RenderAutoSizeField} disabled={props.isViewMode} />
        </Col>
      </Row>
      <Row gutter={16}>
        <div className="field-title">Water from Ponds will be</div>
        <Col md={8} sm={24}>
          <Field
            label="Recycled"
            id="is_ponds_recycled"
            name="is_ponds_recycled"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={8} sm={24}>
          <Field
            label="Exfiltrated to Ground"
            id="is_ponds_exfiltrated"
            name="is_ponds_exfiltrated"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={8} sm={24}>
          <Field
            label="Discharged to Environment"
            id="is_ponds_discharged"
            name="is_ponds_discharged"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity**
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
            Estimated Cost of reclamation activities described above**
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

SettlingPonds.propTypes = propTypes;

export default SettlingPonds;
