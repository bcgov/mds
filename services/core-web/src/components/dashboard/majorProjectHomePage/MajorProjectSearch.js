import React, { Component } from "react";
import { Row, Col } from "antd";
import { isEmpty, some, negate } from "lodash";
import PropTypes from "prop-types";
import MajorProjectSearchForm from "@/components/Forms/MajorProject/MajorProjectSearchForm";

const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  statusCodes: PropTypes.string.isRequired,
  handleReset: PropTypes.func.isRequired,
};

export class MajorProjectSearch extends Component {
  state = {
    receivedFirstInitialValues: false,
    expandAdvancedSearch: false,
  };

  toggleIsAdvancedSearch = () =>
    this.setState((prevState) => ({
      expandAdvancedSearch: !prevState.expandAdvancedSearch,
    }));

  haveAdvancedSearchFilters = ({ status_code, application_stage, Update_timestamp }) =>
    status_code ||
    application_stage ||
    Update_timestamp ||
    some([status_code, application_stage, Update_timestamp], negate(isEmpty));

  componentWillReceiveProps = (nextProps) => {
    if (
      !this.state.receivedFirstInitialValues &&
      this.props.initialValues !== nextProps.initialValues
    ) {
      this.setState({
        receivedFirstInitialValues: true,
        expandAdvancedSearch: this.haveAdvancedSearchFilters(nextProps.initialValues),
      });
    }
  };

  render() {
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <span className="advanced-search__container">
              <MajorProjectSearchForm
                handleReset={this.props.handleReset}
                onSubmit={this.props.handleSearch}
                toggleAdvancedSearch={this.toggleIsAdvancedSearch}
                isAdvanceSearch={this.state.expandAdvancedSearch}
                initialValues={this.props.initialValues}
                statusCodes={this.props.statusCodes}
              />
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

MajorProjectSearch.propTypes = propTypes;

export default MajorProjectSearch;
