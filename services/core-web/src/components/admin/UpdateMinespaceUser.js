import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineNames } from "@common/selectors/mineSelectors";

import CustomPropTypes from "@/customPropTypes";
import EditMinespaceUser from "@/components/Forms/EditMinespaceUser";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mineName),
  minespaceUserEmailHash: PropTypes.objectOf(PropTypes.any),
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {
  mines: [],
  minespaceUserEmailHash: {},
};

export const UpdateMinespaceUser = (props) => {
  const { mines, minespaceUserEmailHash, handleSubmit, initialValues } = props;
  return (
    <div>
      <h3>Edit Proponent</h3>
      {mines && (
        <EditMinespaceUser
          mines={mines.map((mine) => ({
            value: mine.mine_guid,
            label: `${mine.mine_name} - ${mine.mine_no}`,
          }))}
          initialValues={{
            ...initialValues,
            mine_guids: initialValues.mineNames.map((mn) => mn.mine_guid),
          }}
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

UpdateMinespaceUser.propTypes = propTypes;
UpdateMinespaceUser.defaultProps = defaultProps;

export default connect(mapStateToProps)(UpdateMinespaceUser);
