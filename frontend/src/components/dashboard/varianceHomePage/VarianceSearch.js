import React, { Component } from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import VarianceSearchForm from "@/components/Forms/variances/VarianceSearchForm";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class VarianceSearch supports searching for a filtered list of variances.
 */
const propTypes = {
  handleVarianceSearch: PropTypes.func.isRequired,
  handleNameFieldReset: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string),
  mineRegionOptions: CustomPropTypes.options.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  initialValues: {},
};

// const checkAdvancedSearch = ({ status, region, tenure, commodity, tsf, major }) =>
//   tsf || major || some([status, region, tenure, commodity], negate(isEmpty));

export class VarianceSearch extends Component {
  state = {
    isAdvanceSearch: false,
  };

  toggleAdvancedSearch = () => {
    this.setState((prevState) => ({ isAdvanceSearch: !prevState.isAdvanceSearch }));
  };

  render() {
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <span className="advanced-search__container">
              <VarianceSearchForm
                handleNameFieldReset={this.props.handleNameFieldReset}
                onSubmit={this.props.handleVarianceSearch}
                handleVarianceSearch={this.props.handleVarianceSearch}
                toggleAdvancedSearch={this.toggleAdvancedSearch}
                isAdvanceSearch={this.state.isAdvanceSearch}
                initialValues={this.props.initialValues}
                complianceCodes={this.props.complianceCodes}
                mineRegionOptions={this.props.mineRegionOptions}
              />
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

VarianceSearch.propTypes = propTypes;
VarianceSearch.defaultProps = defaultProps;

export default VarianceSearch;
