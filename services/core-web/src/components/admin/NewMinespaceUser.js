import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineNames } from "@common/selectors/mineSelectors";

import CustomPropTypes from "@/customPropTypes";
import AddMinespaceUser from "@/components/Forms/AddMinespaceUser";

const propTypes = {
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

  return (
    <div>
      <h3>Create Proponent</h3>
      {mines && (
        <AddMinespaceUser
          mines={mines.map((mine) => ({
            value: mine.mine_guid,
            label: `${mine.mine_name} - ${mine.mine_no}`,
          }))}
          minespaceUserEmailHash={minespaceUserEmailHash}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  mines: getMineNames(state),
});

NewMinespaceUser.propTypes = propTypes;
NewMinespaceUser.defaultProps = defaultProps;

export default connect(mapStateToProps)(NewMinespaceUser);
