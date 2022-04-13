import React, { Component } from "react";
import PropTypes from "prop-types";
import { change, Field, reduxForm } from "redux-form";
import { Col, Radio, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import { required, requiredList, maxLength } from "@common/utils/Validate";
import { remove } from "lodash";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import { NOTICE_OF_DEPARTURE_DOCUMENTS } from "@/constants/API";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  mineManagerOptions: CustomPropTypes.options.isRequired,
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

class AddNoticeOfDepartureForm extends Component {
  state = {
    substantial: null,
    uploadedFiles: [],
    documentNameGuidMap: {},
    permitOptions: [],
  };

  componentDidMount() {
    if (this.props.permits.length > 0) {
      this.setState({
        permitOptions: this.props.permits.map((permit) => ({
          label: permit.permit_no,
          value: permit.permit_guid,
        })),
      });
    }
  }

  onFileLoad = (documentName, document_manager_guid) => {
    this.state.uploadedFiles.push({ documentName, document_manager_guid });
    this.setState(({ documentNameGuidMap }) => ({
      documentNameGuidMap: {
        [document_manager_guid]: documentName,
        ...documentNameGuidMap,
      },
    }));
    change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (fileItem) => {
    remove(this.state.documentNameGuidMap, { document_manager_guid: fileItem.serverId });
    change("uploadedFiles", this.state.uploadedFiles);
  };

  onChange = (e) => {
    this.setState({
      substantial: e.target.value,
    });
  };

  render() {
    return (
      <div>
        <Form layout="vertical">
          <Typography.Text>
            Please complete the following form to submit your notice of departure and any relevant
            supporting documents. For more information on the purpose and intent of a notice of
            departure click here.
          </Typography.Text>
          <Typography.Title level={4}>Basic Information</Typography.Title>
          <Typography.Text>
            Enter the following information about your notice of departure.
          </Typography.Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Permit #">
                <Field
                  id="permitGuid"
                  name="permit_guid"
                  placeholder="Select Permit #"
                  component={renderConfig.SELECT}
                  validate={[requiredList]}
                  data={this.state.permitOptions}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mine Manager">
                <Field
                  disabled
                  id="mineManager"
                  name="mineManager"
                  placeholder="Select Mine Manager"
                  component={renderConfig.MULTI_SELECT}
                  // validate={[requiredList]}
                  data={this.props.mineManagerOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Project Title">
            <Field
              id="nodTitle"
              name="nod_title"
              placeholder="Departure Project Title"
              component={renderConfig.FIELD}
              validate={[required, maxLength(50)]}
            />
          </Form.Item>
          <Form.Item label="Departure Summary">
            <Field
              // disabled
              id="departureSummary"
              name="departure_summary"
              placeholder="Departure Summary..."
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[required]}
            />
          </Form.Item>
          <Typography.Title level={4}>
            Upload Notice of Departure Self-Assessment Form
          </Typography.Title>
          <Form.Item>
            <Typography.Paragraph>
              Please upload your completed Self-assessment form (click here to download) below.
              Remember your completed form must be signed by the Mine Manager and any supporting
              information included or uploaded.
            </Typography.Paragraph>
            <Field
              id="uploadedFiles"
              name="uploadedFiles"
              onFileLoad={this.onFileLoad}
              onRemoveFile={this.onRemoveFile}
              uploadUrl={NOTICE_OF_DEPARTURE_DOCUMENTS(this.state.mineGuid)}
              mineGuid={this.props.mineGuid}
              component={FileUpload}
            />
          </Form.Item>
          <Typography.Title level={4}>
            Notice of Departure Self-Assessment Determination
          </Typography.Title>
          <Typography.Paragraph>
            Based on the information established in your self-assessment form please determine your
            submissions notice of departure type. If you are unsure what category you fall under,
            please contact us.
          </Typography.Paragraph>
          <Form.Item>
            <Radio.Group disabled onChange={this.onChange} value={this.state.substantial}>
              <Radio value={false}>
                This notice of departure is non-substantial and does not require ministry review.
                (Proponent is responsible for ensuring all details have been completed correctly for
                submission and can begin work immediately)
              </Radio>
              <Radio value>
                This notice of departure is potentially substantial and requires ministry review.
                (Ministry staff will review submission and determine if work can move forward as
                notice of departure)
              </Radio>
            </Radio.Group>
          </Form.Item>
          {this.state.substantial && (
            <div>
              <Typography.Title level={4}>Upload Application Documents</Typography.Title>
              <Typography.Paragraph>
                You have indicated that your notice of departure is potentially substantial. Please
                support your notice of departure by uploading supporting application documents.
                These items documents should include:
              </Typography.Paragraph>
              <ul>
                <li>A detailed project description</li>
                <li>Location (with map, showing Mine boundary)</li>
                <li>Total disturbance area</li>
                <li>Total new disturbance area</li>
                <li>Relevant supporting info (management plans, field survey’s, etc...)</li>
              </ul>
              <Form.Item>
                <Field
                  disabled
                  id="uploadedFiles"
                  name="uploadedFiles"
                  component={FileUpload}
                  uploadUrl={NOTICE_OF_DEPARTURE_DOCUMENTS(this.state.mineGuid)}
                  acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
                  onFileLoad={this.onFileLoad}
                  onRemoveFile={this.onRemoveFile}
                  allowRevert
                  allowMultiple
                />
              </Form.Item>
            </div>
          )}
        </Form>
      </div>
    );
  }
}

AddNoticeOfDepartureForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_NOTICE_OF_DEPARTURE,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  touchOnBlur: true,
})(AddNoticeOfDepartureForm);
