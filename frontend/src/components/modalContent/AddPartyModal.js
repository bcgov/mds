import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, submit, reset, change } from "redux-form";
import { Row, Col, Steps, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { createParty, addPartyRelationship } from "@/actionCreators/partiesActionCreator";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import AddFullPartyForm from "@/components/Forms/parties/AddFullPartyForm";
import AddRolesForm from "@/components/Forms/parties/AddRolesForm";

const { Step } = Steps;

const propTypes = {
  fetchData: PropTypes.func.isRequired,
  fetchMineNameList: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  addPartyFormValues: PropTypes.objectOf(PropTypes.strings),
  addRolesFormValues: PropTypes.objectOf(PropTypes.strings),
  addPartyForm: PropTypes.objectOf(CustomPropTypes.genericFormState),
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  addPartyRelationship: PropTypes.func.isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName).isRequired,
};

const defaultProps = {
  addPartyFormValues: {},
  addRolesFormValues: {},
  addPartyForm: {},
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

export class AddPartyModal extends Component {
  state = { isPerson: true, current: 0, roleNumbers: [] };

  componentWillMount() {
    this.props.fetchMineNameList();
  }

  handleChange = (name) => {
    if (name.length > 2) {
      this.props.fetchMineNameList({ name });
    } else if (name.length === 0) {
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
    const type = this.state.isPerson ? "PER" : "ORG";
    const payload = { type, ...this.props.addPartyFormValues };
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
        this.prev();
      });

    if (!party) {
      return Promise.resolve();
    }

    const rolePayloads = groupRolePayloads(this.props.addRolesFormValues, party.party_guid);
    const createdRoles = Object.values(rolePayloads).map(this.props.addPartyRelationship);

    return Promise.all(createdRoles).then(() => {
      this.props.reset(FORM.ADD_ROLES);
    });
  };

  addField = () => {
    this.setState(({ roleNumbers: prevNumbers }) => {
      const highestRoleNumber = Number(prevNumbers[prevNumbers.length - 1] || 0);
      return { roleNumbers: [...prevNumbers, String(highestRoleNumber + 1)] };
    });
  };

  removeField = (roleNumber) => () => {
    this.setState(({ roleNumbers: prevNumbers }) => ({
      roleNumbers: prevNumbers.filter((x) => x !== roleNumber),
    }));
  };

  cancel = () => {
    this.props.closeModal();
    this.props.reset(FORM.ADD_FULL_PARTY);
    this.props.reset(FORM.ADD_ROLES);
  };

  next() {
    if (!this.props.addPartyForm.syncErrors) {
      this.setState((prevState) => ({ current: prevState.current + 1 }));
    } else {
      // submit form to trigger validation errors.... alternate suggestions??
      this.props.submit(FORM.ADD_FULL_PARTY);
    }
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

  // WIP
  renderStepTwo() {
    return (
      <div>
        <Row>
          <Col md={10} sm={22} xs={22}>
            <AddRolesForm
              roleNumbers={this.state.roleNumbers}
              addField={this.addField}
              removeField={this.removeField}
              partyRelationshipTypesList={this.props.partyRelationshipTypesList}
              mineNameList={this.props.mineNameList}
              handleChange={this.handleChange}
              handleSelect={this.handleSelect}
            />
          </Col>

          <Col md={2} sm={2} xs={2} />

          <Col md={10} sm={22} xs={22}>
            <p>
              You cannot add a role of Permittee or Engineer of Record through this section. Please
              go to the designated mine, under the contact information tab, to add the role of a
              Permittee or Engineer of Record.
            </p>
            <p className="bold">
              If you would like to add another contact, click on the button below. Your current
              contact will be submitted once you opt to add a new contact.
            </p>
            <Button
              type="primary"
              className="full-mobile"
              style={{ marginLeft: 0 }}
              onClick={(event) => this.handlePartySubmit(event, true)}
            >
              Submit and Add another contact
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
        title: "Confirmation",
        content: this.renderStepTwo(),
      },
    ];

    return (
      <div>
        <div>
          <Steps current={this.state.current}>
            {steps.map((step) => (
              <Step key={step.title} title={step.title} />
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
            >
              <Button type="secondary" className="full-mobile">
                Cancel
              </Button>
            </Popconfirm>
            {this.state.current > 0 && (
              <Button type="tertiary" className="full-mobile" onClick={() => this.prev()}>
                Previous
              </Button>
            )}
            {this.state.current < steps.length - 1 && (
              <Button type="primary" className="full-mobile" onClick={() => this.next()}>
                Next
              </Button>
            )}
            {this.state.current === steps.length - 1 && (
              <Button
                type="primary"
                className="full-mobile"
                onClick={(event) => this.handlePartySubmit(event, false)}
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
  mineNameList: getMineNames(state).mines,
  addPartyForm: state.form[FORM.ADD_FULL_PARTY],
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPartyModal);
