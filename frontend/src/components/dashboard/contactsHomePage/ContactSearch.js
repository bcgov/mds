import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Row, Col } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, some, negate } from "lodash";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import AdvancedContactSearchForm from "@/components/Forms/AdvancedContactSearchForm";

/**
 * @class ContactSearch supports searching for a filtered list of parties.
 */
const propTypes = {
  fetchParties: PropTypes.func.isRequired,
};

const defaultProps = {};

const checkAdvancedSearch = ({ status, region, tenure, commodity, tsf, major }) =>
  tsf || major || some([status, region, tenure, commodity], negate(isEmpty));

export class ContactSearch extends Component {
  state = {
    isAdvanceSearch: checkAdvancedSearch(this.props.initialValues),
  };

  handleSearch = (value = {}) => {
    this.props.fetchParties({ ...value, relationships: "mine_party_appt" });
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
              <AdvancedContactSearchForm
                {...this.props}
                onSubmit={this.handleSearch}
                toggleAdvancedSearch={this.toggleAdvancedSearch}
                isAdvanceSearch={this.state.isAdvanceSearch}
                handleSearch={this.handleSearch}
                initialValues={{ type: "PER" }}
                partyTypeOptions={[
                  /* TODO: Pass this in from Redux store */
                  { value: "PER", label: "Person" },
                  { value: "ORG", label: "Organization" },
                ]}
                relationshipTypes={[
                  /* TODO: Pass this in from Redux store */
                  { value: "", label: "All Roles" },
                  { value: "PMT", label: "Permittee" },
                  { value: "MMG", label: "Mine Manager" },
                ]}
              />
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineNameList: getMineNames(state).mines,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
    },
    dispatch
  );

ContactSearch.propTypes = propTypes;
ContactSearch.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactSearch);
