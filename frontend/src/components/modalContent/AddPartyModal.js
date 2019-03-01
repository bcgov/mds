import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, submit, reset } from "redux-form";
import { Steps, Button } from "antd";
import * as FORM from "@/constants/forms";
import AddPartyForm from "@/components/Forms/AddPartyForm";

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

  handlePartySubmit = () => {
    const type = this.state.isPerson ? "PER" : "ORG";
    this.props.reset(FORM.ADD_PARTY);
    return this.props.onSubmit(this.props.addPartyFormValues, type);
  };

  next() {
    if (!this.props.addPartyForm.syncErrors) {
      const current = this.state.current + 1;
      this.setState({ current });
    } else {
      // submit form to trigger validation errors.... smelly, suggestions??
      this.props.submit(FORM.ADD_PARTY);
    }
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  handleCreateAnother = () => {
    console.log(this.state.current);
    const current = this.state.current - 1;
    this.props.reset(FORM.ADD_PARTY);
    this.setState({ current });
  };

  renderStepOne() {
    return (
      <AddPartyForm
        {...this.props}
        onSubmit={this.handlePartySubmit}
        isPerson={this.state.isPerson}
        togglePartyChange={this.togglePartyChange}
        handleFormReset={this.handleFormReset}
      />
    );
  }

  renderStepTwo() {
    return (
      <div>
        <p>there wil;l be lodts gosfd cool things in here just not ight now k wait for it.</p>
        <Button type="primary" className="full-mobile center" onClick={this.handleCreateAnother}>
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
          <Steps current={this.state.current} labelPlacement="vertical">
            {steps.map((step) => (
              <Step key={step.title} title={step.title} />
            ))}
          </Steps>
          <div>{steps[this.state.current].content}</div>
          <div className="right center-mobile">
            {this.state.current > 0 && (
              <Button type="secondary" className="full-mobile" onClick={() => this.prev()}>
                Previous
              </Button>
            )}
            {this.state.current < steps.length - 1 && (
              <Button type="primary" className="full-mobile" onClick={() => this.next()}>
                Next
              </Button>
            )}
            {this.state.current === steps.length - 1 && (
              <Button type="primary" onClick={this.handlePartySubmit}>
                Submit
              </Button>
            )}
            <Button type="tertiary" onClick={this.handlePartySubmit}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  addPartyFormValues: getFormValues(FORM.ADD_PARTY)(state) || {},
  addPartyForm: state.form[FORM.ADD_PARTY],
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      submit,
      reset,
    },
    dispatch
  );

AddTenureModal.propTypes = propTypes;
AddTenureModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddTenureModal);
