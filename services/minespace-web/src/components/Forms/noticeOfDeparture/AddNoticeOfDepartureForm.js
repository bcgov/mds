import React, { Component } from "react";
import PropTypes from "prop-types";
import { change, Field, reduxForm } from "redux-form";
import { Col, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import { maxLength, required, requiredList } from "@common/utils/Validate";
import { remove } from "lodash";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

class AddNoticeOfDepartureForm extends Component {
  state = {
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

  render() {
    return (
      <div>
        <Form layout="vertical" onSubmit={this.props.handleSubmit}>
          <Typography.Text>
            Please complete the following form to submit your notice of departure and any relevant
            supporting documents. For more information on the purpose and intent of a notice of
            departure click here.
          </Typography.Text>
          <Typography.Title level={4}>Basic Information</Typography.Title>
          <Typography.Text>
            Enter the following information about your notice of departure.
          </Typography.Text>
          <Form.Item label="Project Title">
            <Field
              id="nodTitle"
              name="nod_title"
              placeholder="Departure Project Title"
              component={renderConfig.FIELD}
              validate={[required, maxLength(50)]}
            />
          </Form.Item>
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
          </Row>
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
