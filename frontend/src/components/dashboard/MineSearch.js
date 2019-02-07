import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete, Row, Col } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, some, negate } from "lodash";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import AdvancedSearchForm from "@/components/Forms/AdvancedSearchForm";

/**
 * @class MineSearch contains logic for both landing page List view and Map view, searches though mine_name and mine_no to either Redirect to Mine Summary page, or to locate coordinates of a mine on the landing page map.
 */
const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  handleMineSearch: PropTypes.func,
  handleCoordinateSearch: PropTypes.func,
  mineNameList: PropTypes.array,
  isMapView: PropTypes.bool,
};

const defaultProps = {
  mineNameList: [],
};

const checkAdvancedSearch = ({ status, region, tenure, commodity, tsf, major }) =>
  tsf || major || some([status, region, tenure, commodity], negate(isEmpty));

export class MineSearch extends Component {
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
  handleChange = (value) => {
    if (value.length > 2) {
      this.props.fetchMineNameList(value);
    } else if (value.length === 0) {
      this.props.fetchMineNameList();
    }
  };

  /**
   * filter mineList with new search input;
   */
  handleSearch = (value = {}) => {
    const { commodity, region, status, tenure, tsf, major, search } = value;

    this.props.handleMineSearch({
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
    this.setState({ isAdvanceSearch: !this.state.isAdvanceSearch });
  };

  transformData = (data) =>
    data.map(({ longitude = "", latitude = "", mine_name = "", mine_no = "", guid }) => (
      <AutoComplete.Option key={guid} value={`${longitude},${latitude},${mine_name}`}>
        {`${mine_name} - ${mine_no}`}
      </AutoComplete.Option>
    ));

  render() {
    if (this.props.isMapView) {
      return (
        <RenderAutoComplete
          placeholder="Search for a mine by name"
          handleSelect={this.handleCoordinateSearch}
          data={this.transformData(this.props.mineNameList)}
          handleChange={this.handleChange}
        />
      );
    }
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <span className="advanced-search__container">
              <AdvancedSearchForm
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

MineSearch.propTypes = propTypes;
MineSearch.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineSearch);
