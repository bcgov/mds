import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, submit, reset, change } from "redux-form";
import { Row, Col, Steps, Button, Popconfirm } from "antd";
import { createParty, addPartyRelationship } from "@mds/common/redux/actionCreators/partiesActionCreator";
import { fetchMineNameList } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMineNames } from "@mds/common/redux/selectors/mineSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import AddFullPartyForm from "@/components/Forms/parties/AddFullPartyForm";
import AddRolesForm from "@/components/Forms/parties/AddRolesForm";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";

const propTypes = {
  fetchData: PropTypes.func.isRequired,
  fetchMineNameList: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  addPartyFormValues: PropTypes.objectOf(PropTypes.strings),
  addRolesFormValues: PropTypes.objectOf(PropTypes.strings),
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  addPartyRelationship: PropTypes.func.isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
};

const defaultProps = {
  addPartyFormValues: {},
  addRolesFormValues: {},
};

const groupRolePayloads = (formValues, party_guid) => {
  const rolePayloads = {};
  Object.entries(formValues).forEach(([key, value]) => {
    const [field, roleNumber] = key.split("-");
    rolePayloads[roleNumber] = rolePayloads[roleNumber] || {};
    rolePayloads[roleNumber][field] = value;
    rolePayloads[roleNumber].party_guid = party_guid;
  });
  return rolePayloads;
};

const invalidPartyPayload = (addPartyFormValues, isPerson) =>
  (isPerson && addPartyFormValues.first_name === undefined) ||
  addPartyFormValues.party_name === undefined ||
  addPartyFormValues.phone_no === undefined;

const invalidRolePayload = (roleNumbers, addRolesFormValues) =>
  Object.keys(addRolesFormValues).length > 0 &&
  roleNumbers.some(
    (roleNumber) =>
      addRolesFormValues[`mine_guid-${roleNumber}`] === undefined ||
      addRolesFormValues[`mine_party_appt_type_code-${roleNumber}`] === undefined
  );

export class AddPartyModal extends Component {
  state = { isPerson: true, current: 0, roleNumbers: [], submitting: false };

  componentWillMount() {
    this.props.fetchMineNameList();
  }

  handleChange = (roleNumber) => (name) => {
    if (name.length > 2) {
      this.props.fetchMineNameList({ name });
    } else if (name.length === 0) {
      this.props.change(FORM.ADD_ROLES, `mine_guid-${roleNumber}`, name);
      this.props.fetchMineNameList();
    }
  };

  handleSelect = (roleNumber) => (value) => {
    this.props.change(FORM.ADD_ROLES, `mine_guid-${roleNumber}`, value);
  };

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  handlePartySubmit = async (event, addAnother) => {
    event.preventDefault();
    this.setState({ submitting: true });
    const party_type_code = this.state.isPerson ? "PER" : "ORG";
    const address_type_code =
      this.props.provinceOptions.find(
        (prov) => prov.value === this.props.addPartyFormValues.sub_division_code
      )?.subType ?? null;
    const payload = { party_type_code, address_type_code, ...this.props.addPartyFormValues };
    const party = await this.props
      .createParty(payload)
      .then(({ data }) => {
        this.props.reset(FORM.ADD_FULL_PARTY);
        if (addAnother) {
          this.prev();
        } else {
          this.props.fetchData();
          this.props.closeModal();
        }
        return data;
      })
      .catch(() => {
        this.setState({ submitting: false });
        return Promise.resolve();
      });

    if (!party) {
      this.setState({ submitting: false });
      return Promise.resolve();
    }

    const rolePayloads = groupRolePayloads(this.props.addRolesFormValues, party.party_guid);
    const createdRoles = Object.values(rolePayloads).map(this.props.addPartyRelationship);

    return Promise.all(createdRoles)
      .then(() => {
        this.props.reset(FORM.ADD_ROLES);
      })
      .finally(() => this.setState({ submitting: false }));
  };

  clearFieldValues = (roleNumber) => {
    this.props.change(FORM.ADD_ROLES, `mine_guid-${roleNumber}`, "");
    this.props.change(FORM.ADD_ROLES, `mine_party_appt_type_code-${roleNumber}`, "");
    this.props.change(FORM.ADD_ROLES, `start_date-${roleNumber}`, "");
    this.props.change(FORM.ADD_ROLES, `end_date-${roleNumber}`, "");
  };

  addField = () => {
    this.setState(({ roleNumbers: prevNumbers }) => {
      const highestRoleNumber = Number(prevNumbers[prevNumbers.length - 1] || 0);
      const newRoleNumber = String(highestRoleNumber + 1);
      return { roleNumbers: [...prevNumbers, newRoleNumber], activeKey: newRoleNumber };
    });
  };

  removeField = (roleNumber) => () => {
    // Clear field values from Redux store
    this.clearFieldValues(roleNumber);
    // Remove role number from state
    this.setState(({ roleNumbers: prevNumbers }) => ({
      roleNumbers: prevNumbers.filter((x) => x !== roleNumber),
    }));
  };

  cancel = () => {
    this.props.closeModal();
    this.props.reset(FORM.ADD_FULL_PARTY);
    this.props.reset(FORM.ADD_ROLES);
  };

  handleActivePanelChange = (roleNumber) => {
    this.setState({ activeKey: roleNumber });
  };

  next() {
    this.setState((prevState) => ({ current: prevState.current + 1 }));
  }

  prev() {
    this.setState((prevState) => ({ current: prevState.current - 1 }));
  }

  renderStepOne() {
    return (
      <AddFullPartyForm
        isPerson={this.state.isPerson}
        togglePartyChange={this.togglePartyChange}
        provinceOptions={this.props.provinceOptions}
      />
    );
  }

  renderStepTwo() {
    return (
      <div>
        <Row gutter={48}>
          <Col
            md={12}
            sm={24}
            xs={24}
            className="border--right--layout"
            style={{ marginTop: "16px" }}
          >
            <p>
              You cannot add a role of Permittee or Engineer of Record through this section. Please
              go to the designated mine.
            </p>
            <AddRolesForm
              roleNumbers={this.state.roleNumbers}
              addField={this.addField}
              removeField={this.removeField}
              partyRelationshipTypesList={this.props.partyRelationshipTypesList}
              mineNameList={this.props.mineNameList}
              handleChange={this.handleChange}
              handleSelect={this.handleSelect}
              activeKey={this.state.activeKey}
              handleActivePanelChange={this.handleActivePanelChange}
            />
          </Col>

          <Col md={12} sm={24} xs={24} style={{ marginTop: "16px" }}>
            <p>If you would like to create this contact and add another, click the button below.</p>
            <Button
              type="primary"
              className="full-mobile"
              htmlType="submit"
              style={{ marginLeft: 0 }}
              onClick={(event) => this.handlePartySubmit(event, true)}
              loading={this.state.submitting}
            >
              Submit and Add Another Contact
            </Button>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const steps = [
      {
        title: "Basic Information",
        content: this.renderStepOne(),
      },
      {
        title: "Role",
        content: this.renderStepTwo(),
      },
    ];

    return (
      <div>
        <div>
          <Steps current={this.state.current}>
            {steps.map((step) => (
              <Steps.Step key={step.title} title={step.title} />
            ))}
          </Steps>
          <div>{steps[this.state.current].content}</div>
          <div className="right center-mobile">
            <Popconfirm
              placement="top"
              title="Are you sure you want to cancel?"
              okText="Yes"
              cancelText="No"
              onConfirm={this.cancel}
              disabled={this.state.submitting}
            >
              <Button type="secondary" className="full-mobile" disabled={this.state.submitting}>
                Cancel
              </Button>
            </Popconfirm>
            {this.state.current > 0 && (
              <Button
                type="tertiary"
                className="full-mobile"
                onClick={() => this.prev()}
                disabled={this.state.submitting}
              >
                Previous
              </Button>
            )}
            {this.state.current < steps.length - 1 && (
              <Button
                type="primary"
                className="full-mobile"
                onClick={() => this.next()}
                disabled={
                  this.state.submitting ||
                  invalidPartyPayload(this.props.addPartyFormValues, this.state.isPerson)
                }
              >
                Next
              </Button>
            )}
            {this.state.current === steps.length - 1 && (
              <Button
                type="primary"
                className="full-mobile"
                htmlType="submit"
                onClick={(event) => this.handlePartySubmit(event, false)}
                loading={this.state.submitting}
                disabled={invalidRolePayload(this.state.roleNumbers, this.props.addRolesFormValues)}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  addPartyFormValues: getFormValues(FORM.ADD_FULL_PARTY)(state) || {},
  addRolesFormValues: getFormValues(FORM.ADD_ROLES)(state) || {},
  mineNameList: getMineNames(state),
  addPartyForm: state.form[FORM.ADD_FULL_PARTY],
  provinceOptions: getDropdownProvinceOptions(state),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      addPartyRelationship,
      fetchMineNameList,
      submit,
      reset,
      createParty,
      change,
    },
    dispatch
  );

AddPartyModal.propTypes = propTypes;
AddPartyModal.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(AddPartyModal);
