import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, submit, reset } from "redux-form";
import { Steps, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { createParty } from "@/actionCreators/partiesActionCreator";
import AddFullPartyForm from "@/components/Forms/parties/AddFullPartyForm";

const { Step } = Steps;

const propTypes = {
  fetchData: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  title: PropTypes.string,
  addPartyFormValues: PropTypes.objectOf(PropTypes.strings),
  addPartyForm: PropTypes.objectOf(CustomPropTypes.genericFormState),
};

const defaultProps = {
  addPartyFormValues: {},
  addPartyForm: {},
  title: "",
};

export class AddPartyModal extends Component {
  state = { isPerson: true, current: 0 };

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  handlePartySubmit = (event, addAnother) => {
    event.preventDefault();
    const type = this.state.isPerson ? "PER" : "ORG";
    const payload = { type, ...this.props.addPartyFormValues };
    return this.props
      .createParty(payload)
      .then(() => {
        this.props.reset(FORM.ADD_FULL_PARTY);
        if (addAnother) {
          this.prev();
        } else {
          this.props.fetchData();
          this.props.closeModal();
        }
      })
      .catch(() => {
        this.prev();
      });
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
        {...this.props}
        onSubmit={this.handlePartySubmit}
        isPerson={this.state.isPerson}
        togglePartyChange={this.togglePartyChange}
        handleFormReset={this.handleFormReset}
      />
    );
  }

  // WIP
  renderStepTwo() {
    return (
      <div className="center">
        <p>
          If you would like to add another contact, click on the button below. Your current contact
          will be submitted once you opt to add a new contact.
        </p>
        <Button
          type="primary"
          className="full-mobile center"
          onClick={(event) => this.handlePartySubmit(event, true)}
        >
          Submit and Add another contact
        </Button>
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
              onConfirm={this.props.closeModal}
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
  addPartyForm: state.form[FORM.ADD_FULL_PARTY],
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      submit,
      reset,
      createParty,
    },
    dispatch
  );

AddPartyModal.propTypes = propTypes;
AddPartyModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPartyModal);
