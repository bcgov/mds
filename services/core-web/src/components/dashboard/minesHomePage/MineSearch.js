import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Row, Col } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchMineNameList } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMineNames } from "@mds/common/redux/selectors/mineSelectors";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import AdvancedMineSearchForm from "@/components/Forms/AdvancedMineSearchForm";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class MineSearch contains logic for both landing page List view and Map view, searches though mine_name and mine_no to either Redirect to Mine Summary page, or to locate coordinates of a mine on the landing page map.
 */

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  handleReset: PropTypes.func,
  mineNameList: PropTypes.arrayOf(CustomPropTypes.mineName),
  isMapView: PropTypes.bool,
};

const defaultProps = {
  handleReset: () => {},
  mineNameList: [],
  isMapView: false,
};

export class MineSearch extends Component {
  handleMapViewSearchOnChange = (name) => {
    if (!name) {
      return;
    }
    if (name.length > 2) {
      this.props.fetchMineNameList({ name });
    } else if (name.length === 0) {
      this.props.fetchMineNameList();
    }
  };

  transformData = (data) =>
    data.map(({ latitude = "", longitude = "", mine_name = "", mine_no = "", mine_guid }) => ({
      label: `${mine_name} - ${mine_no}`,
      value: JSON.stringify({ latitude, longitude, mine_name, mine_guid }),
    }));

  render() {
    if (this.props.isMapView) {
      return (
        <RenderAutoComplete
          placeholder="Search for a mine by name"
          handleSelect={this.props.handleSearch}
          data={this.transformData(this.props.mineNameList)}
          handleChange={this.handleMapViewSearchOnChange}
          initialValues={this.props.initialValues}
        />
      );
    }

    return (
      <Row>
        <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
          <span className="advanced-search__container">
            <AdvancedMineSearchForm
              initialValues={this.props.initialValues}
              onSubmit={this.props.handleSearch}
              onReset={this.props.handleReset}
              {...this.props}
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
