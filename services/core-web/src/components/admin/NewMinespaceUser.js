import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineNames } from "@common/selectors/mineSelectors";

import { bindActionCreators } from "redux";
import { fetchMineNameList } from "@common/actionCreators/mineActionCreator";
import CustomPropTypes from "@/customPropTypes";
import AddMinespaceUser from "@/components/Forms/AddMinespaceUser";
import { nullableStringSorter } from "@common/utils/helpers";

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mineName),
  minespaceUserEmailHash: PropTypes.objectOf(PropTypes.any),
  handleSubmit: PropTypes.func.isRequired,
};

const defaultProps = {
  mines: [],
  minespaceUserEmailHash: {},
};

export const NewMinespaceUser = (props) => {
  const { mines, minespaceUserEmailHash, handleSubmit } = props;

  const handleSearch = (name) => {
    if (name.length > 0) {
      props.fetchMineNameList({ name });
    }
  };

  const handleChange = () => {
    props.fetchMineNameList();
  };

  return (
    <div>
      <h3>Create Proponent</h3>
      {mines && (
        <AddMinespaceUser
          mines={mines
            .map((mine) => ({
              value: mine.mine_guid,
              label: `${mine.mine_name} - ${mine.mine_no}`,
            }))
            .sort(nullableStringSorter("label"))}
          minespaceUserEmailHash={minespaceUserEmailHash}
          onSubmit={handleSubmit}
          handleChange={handleChange}
          handleSearch={handleSearch}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  mines: getMineNames(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
    },
    dispatch
  );

NewMinespaceUser.propTypes = propTypes;
NewMinespaceUser.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NewMinespaceUser);
