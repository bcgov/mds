import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, submit, reset } from "redux-form";
import { Steps, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { createParty } from "@/actionCreators/partiesActionCreator";
import AddFullPartyForm from "@/components/Forms/parties/AddFullPartyForm";

const { Step } = Steps;

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {
  title: "",
};

export class AddTenureModal extends Component {
  state = { isPerson: true, current: 0 };

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  handlePartySubmit = (event, addAnother) => {
    event.preventDefault();
    const type = this.state.isPerson ? "PER" : "ORG";
    const payload = { type, ...this.props.AddPartyFormValues };
    return this.props
      .createParty(payload)
      .then(() => {
        if (addAnother) {
          this.prev();
        } else {
          this.props.handleAfterSubmit();
          // this.props.reset(FORM.ADD_FULL_PARTY);
        }
      })
      .catch(() => {
        this.prev();
      });
  };

  next() {
    if (!this.props.AddPartyForm.syncErrors) {
      const current = this.state.current + 1;
      this.setState({ current });
    } else {
      // submit form to trigger validation errors.... smelly, suggestions??
      this.props.submit(FORM.ADD_FULL_PARTY);
    }
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
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
          If you would like to add another contact, click on the add another contact below. Your
          current contact will be submitted once you add a new contact.
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
  AddPartyFormValues: getFormValues(FORM.ADD_FULL_PARTY)(state) || {},
  AddPartyForm: state.form[FORM.ADD_FULL_PARTY],
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

AddTenureModal.propTypes = propTypes;
AddTenureModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddTenureModal);
