import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Row, Col } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, some, negate } from "lodash";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import AdvancedContactSearchForm from "@/components/Forms/AdvancedContactSearchForm";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class ContactSearch supports searching for a filtered list of parties.
 */
const propTypes = {
  fetchParties: PropTypes.func.isRequired,
  handleContactSearch: PropTypes.func,
  handleCoordinateSearch: PropTypes.func,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName),
  isMapView: PropTypes.bool,
};

const defaultProps = {
  mineNameList: [],
  handleContactSearch: () => {},
  handleCoordinateSearch: () => {},
  isMapView: false,
};

const checkAdvancedSearch = ({ status, region, tenure, commodity, tsf, major }) =>
  tsf || major || some([status, region, tenure, commodity], negate(isEmpty));

export class ContactSearch extends Component {
  state = {
    isAdvanceSearch: checkAdvancedSearch(this.props.initialValues),
  };

  /**
   *  re-center the map to the mines coordinates
   * @param value = 'mine.long, mine.lat';
   */
  handleCoordinateSearch = (value) => {
    this.props.handleCoordinateSearch(value);
  };

  /**
   *  If the user has typed more than 3 characters filter the search
   * If they clear the search, revert back to default search set
   */
  handleChange = (name) => {
    if (name.length > 2) {
      // Only used by the map view, which searches by name
      this.props.fetchMineNameList({ name });
    } else if (name.length === 0) {
      this.props.fetchMineNameList();
    }
  };

  /**
   * filter mineList with new search input;
   */
  handleSearch = (value = {}) => {
    const { commodity, region, status, tenure, tsf, major, search } = value;

    this.props.handleContactSearch({
      search,
      tsf,
      major,
      commodity: commodity && commodity.join(","),
      region: region && region.join(","),
      status: status && status.join(","),
      tenure: tenure && tenure.join(","),
    });
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
