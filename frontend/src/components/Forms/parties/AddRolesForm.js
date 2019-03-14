import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Collapse, Button, Icon, Popconfirm, Form, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  addField: PropTypes.func.isRequired,
  removeField: PropTypes.func.isRequired,
  roleNumbers: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const panelHeader = (removeField, roleNumber) => (
  <div className="inline-flex between">
    <Form.Item style={{ marginTop: "15px" }} label={`Role ${roleNumber}`} />
    <div>
      <Popconfirm
        placement="topRight"
        title={`Are you sure you want to remove Role ${roleNumber}?`}
        onConfirm={removeField(roleNumber)}
        okText="Yes"
        cancelText="No"
      >
        <Button ghost>
          <Icon type="minus-circle" theme="outlined" style={{ color: "#BC2929" }} />
        </Button>
      </Popconfirm>
    </div>
  </div>
);

export const AddRolesForm = (props) => (
  <div>
    <Form>
      <Collapse>
        {props.roleNumbers.map((roleNumber) => (
          <Collapse.Panel header={panelHeader(props.removeField, roleNumber)} key={roleNumber}>
            <Row gutter={16}>
              <Col span={12}>
                <Field
                  label="Role"
                  id={`role${roleNumber}`}
                  name={`role${roleNumber}`}
                  placeholder="Please add Role"
                  component={renderConfig.SELECT}
                  // TODO: Insert real list via props
                  data={[{ value: "MMG", label: "Mine Manager" }]}
                />
              </Col>
              <Col span={12}>
                <Field
                  label="Mine"
                  id={`mine${roleNumber}`}
                  name={`mine${roleNumber}`}
                  placeholder="Please add Mine"
                  component={renderConfig.SELECT}
                  // TODO: Search by input and fill with mine list
                  data={[{ value: "hi", label: "Hi There" }]}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Field
                  label="Start Date"
                  id={`start_date${roleNumber}`}
                  name={`start_date${roleNumber}`}
                  placeholder="yyyy-mm-dd"
                  component={renderConfig.FIELD}
                />
              </Col>
              <Col span={12}>
                <Field
                  label="End Date"
                  id={`end_date${roleNumber}`}
                  name={`end_date${roleNumber}`}
                  placeholder="yyyy-mm-dd"
                  component={renderConfig.FIELD}
                />
              </Col>
            </Row>
          </Collapse.Panel>
        ))}
      </Collapse>
      <Button className="btn--dropdown" onClick={props.addField}>
        <Icon type="plus" style={{ color: "#000" }} />
        {props.roleNumbers.length > 0 ? "Add Another Role" : "Add Role"}
      </Button>
    </Form>
  </div>
);

AddRolesForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_FULL_PARTY,
  destroyOnUnmount: false,
})(AddRolesForm);
