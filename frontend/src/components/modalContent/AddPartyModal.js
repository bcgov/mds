import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
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
    // this.handleFormReset();
    return this.props.onSubmit(this.props.addPartyFormValues, type);
  };

  handleFormReset = () => {
    this.props.reset();
    console.log("did you do the thing??");
  };

  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

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
      <div className="inline-flex center">
        <p>there wil;l be lodts gosfd cool things in here just not ight now k wait for it.</p>
        {/* <Button type="secondary" className="full-mobile" onClick={this.handlePartySubmit}>
          Submit and Add Another Contact
        </Button>
        <Button type="primary" className="full-mobile" onClick={this.handlePartySubmit}>
          Submit
        </Button> */}
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
        title: "Roles",
        content: this.renderStepTwo(),
      },
      // {
      //   title: "Final Step",
      //   content: this.renderStepTwo(),
      // },
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
          <div>
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
              // <Button type="secondary" onClick={() => this.prev()}>
              //   Previous
              // </Button>
              <div>
                <Button type="secondary" className="full-mobile" onClick={this.handlePartySubmit}>
                  Submit and Add Another
                </Button>
                <Button type="primary" className="full-mobile" onClick={this.handlePartySubmit}>
                  Submit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  addPartyFormValues: getFormValues(FORM.ADD_PARTY)(state) || {},
});

AddTenureModal.propTypes = propTypes;
AddTenureModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  null
)(AddTenureModal);
