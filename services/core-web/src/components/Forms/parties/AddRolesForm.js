import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { AutoComplete, Collapse, Button, Icon, Popconfirm, Form, Col, Row } from "antd";
import { required } from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import { renderConfig } from "@/components/common/config";
import { COLOR } from "@/constants/styles";

const { mediumGrey, antIconGrey } = COLOR;

const propTypes = {
  addField: PropTypes.func.isRequired,
  removeField: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  handleActivePanelChange: PropTypes.func.isRequired,
  roleNumbers: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeKey: PropTypes.string.isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
};

const complexRelationships = ["EOR", "PMT"];
const simpleRelationships = (typesList) =>
  typesList.filter(({ value }) => !complexRelationships.includes(value));

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
          <img name="remove" src={TRASHCAN} alt="Remove Activity" />
        </Button>
      </Popconfirm>
    </div>
  </div>
);

const transformMineNames = (names) =>
  names.map(({ mine_name, mine_guid }) => (
    <AutoComplete.Option key={mine_guid} value={mine_guid}>
      {mine_name}
    </AutoComplete.Option>
  ));

export const AddRolesForm = (props) => (
  <div>
    <Form>
      <Collapse accordion activeKey={[props.activeKey]} onChange={props.handleActivePanelChange}>
        {props.roleNumbers.map((roleNumber) => (
          <Collapse.Panel header={panelHeader(props.removeField, roleNumber)} key={roleNumber}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Role *">
                  <Field
                    id={`mine_party_appt_type_code-${roleNumber}`}
                    name={`mine_party_appt_type_code-${roleNumber}`}
                    component={renderConfig.SELECT}
                    doNotPinDropdown
                    data={simpleRelationships(props.partyRelationshipTypesList)}
                    validate={[required]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Mine *">
                  <Field
                    id={`mine_guid-${roleNumber}`}
                    name={`mine_guid-${roleNumber}`}
                    component={renderConfig.AUTOCOMPLETE}
                    placeholder="Please add Mine"
                    data={transformMineNames(props.mineNameList)}
                    handleChange={props.handleChange(roleNumber)}
                    handleSelect={props.handleSelect(roleNumber)}
                    iconColor={antIconGrey}
                    validate={[required]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Field
                  label="Start Date"
                  id={`start_date-${roleNumber}`}
                  name={`start_date-${roleNumber}`}
                  placeholder="yyyy-mm-dd"
                  component={renderConfig.DATE}
                />
              </Col>
              <Col span={12}>
                <Field
                  label="End Date"
                  id={`end_date-${roleNumber}`}
                  name={`end_date-${roleNumber}`}
                  placeholder="yyyy-mm-dd"
                  component={renderConfig.DATE}
                />
              </Col>
            </Row>
          </Collapse.Panel>
        ))}
      </Collapse>
      <Button className="btn--dropdown" onClick={props.addField}>
        <Icon type="plus" style={{ color: mediumGrey }} />
        {props.roleNumbers.length > 0 ? "Add Another Role" : "Add Role"}
      </Button>
    </Form>
  </div>
);

AddRolesForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_ROLES,
  destroyOnUnmount: false,
})(AddRolesForm);
