import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete, Row, Col } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, some, negate } from "lodash";
import { fetchMineNameList } from "@common/actionCreators/mineActionCreator";
import { getMineNames } from "@common/selectors/mineSelectors";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import AdvancedMineSearchForm from "@/components/Forms/AdvancedMineSearchForm";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class MineSearch contains logic for both landing page List view and Map view, searches though mine_name and mine_no to either Redirect to Mine Summary page, or to locate coordinates of a mine on the landing page map.
 */

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  handleMineSearch: PropTypes.func,
  handleCoordinateSearch: PropTypes.func,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName),
  isMapView: PropTypes.bool,
  initialValues: PropTypes.shape({
    status: PropTypes.arrayOf(PropTypes.string),
    region: PropTypes.arrayOf(PropTypes.string),
    tenure: PropTypes.arrayOf(PropTypes.string),
    commodity: PropTypes.arrayOf(PropTypes.string),
    tsf: PropTypes.string,
    major: PropTypes.bool,
  }),
};

const defaultProps = {
  handleMineSearch: () => {},
  handleCoordinateSearch: () => {},
  mineNameList: [],
  isMapView: false,
  initialValues: {},
};

const checkAdvancedSearch = ({ status, region, tenure, commodity, tsf, major }) =>
  tsf || major || some([status, region, tenure, commodity], negate(isEmpty));

export class MineSearch extends Component {
  state = {
    isAdvanceSearch: checkAdvancedSearch(this.props.initialValues),
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.initialValues !== nextProps.initialValues) {
      this.setState({ isAdvanceSearch: checkAdvancedSearch(nextProps.initialValues) });
    }
  }

  handleCoordinateSearch = (value) => {
    this.props.handleCoordinateSearch(value);
  };

  handleSearchByNameChange = (name) => {
    if (!name) {
      return;
    }
    if (name.length > 2) {
      this.props.fetchMineNameList({ name });
    } else if (name.length === 0) {
      this.props.fetchMineNameList();
    }
  };

  toggleAdvancedSearch = () => {
    this.setState((prevState) => ({ isAdvanceSearch: !prevState.isAdvanceSearch }));
  };

  transformData = (data) =>
    data.map(({ latitude = "", longitude = "", mine_name = "", mine_no = "", mine_guid }) => (
      <AutoComplete.Option
        key={mine_guid}
        value={`${latitude},${longitude},${mine_name},${mine_guid}`}
      >
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
          handleChange={this.handleSearchByNameChange}
        />
      );
    }

    return (
      <Row>
        <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
          <span className="advanced-search__container">
            <AdvancedMineSearchForm
              {...this.props}
              onSubmit={this.props.handleMineSearch}
              toggleAdvancedSearch={this.toggleAdvancedSearch}
              isAdvanceSearch={this.state.isAdvanceSearch}
              handleSearch={this.props.handleMineSearch}
            />
          </span>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  mineNameList: getMineNames(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(MineSearch);
