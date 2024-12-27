import React, { FC, useState } from "react";
import { ActionCreator, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getMineNames } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineNameList } from "@mds/common/redux/actionCreators/mineActionCreator";

import { getMinespaceUserMines } from "@mds/common/redux/reducers/minespaceReducer";
import EditMinespaceUser from "@/components/Forms/EditMinespaceUser";
import { IMine, IMineSearch } from "@mds/common/interfaces";

interface UpdateMinespaceUserProps {
  fetchMineNameList?: ActionCreator<typeof fetchMineNameList>,
  mines: IMineSearch[],
  minespaceUserEmailHash?: any,
  handleSubmit?: () => void,
  initialValues?: any,
  minespaceUserMines?: IMine[]
};

export const UpdateMinespaceUser: FC<UpdateMinespaceUserProps> = ({
  mines = [],
  minespaceUserEmailHash = {},
  minespaceUserMines = [],
  fetchMineNameList,
  handleSubmit = () => { },
  initialValues
}) => {

  const [searching, setSearching] = useState(false);

  const handleSearch = (name) => {
    setSearching(true);
    if (name.length > 0) {
      fetchMineNameList({ name });
    } else {
      handleChange();
    }
  };

  const handleChange = () => {
    setSearching(false)
    fetchMineNameList();
  };

  const parseMinesAsOptions = (mines) => {
    return mines.map((mine) => ({
      value: mine.mine_guid,
      label: `${mine.mine_name} - ${mine.mine_no}`,
    }));
  };

  const dedupe = (mines, userMines) => {
    const mineGuids = new Set(mines.map(m => m.mine_guid));
    let uniqueMines = mines;
    for (const mine of userMines) {
      if (!mineGuids.has(mine.mine_guid)) {
        uniqueMines.push(mine);
      }
    }
    return uniqueMines;
  }

  const getMines = () => {
    return searching ? [...mines] : [...dedupe(mines, minespaceUserMines)];
  }

  const EditMinespaceUserProps = {
    mines: parseMinesAsOptions(getMines()),
    initialValueOptions: initialValues.mineNames,
    initialValues:{
      ...initialValues,
      mine_guids: initialValues.mineNames.map((mn) => mn.mine_guid),
    },
    onSubmit: handleSubmit,
    handleChange: handleChange,
    handleSearch: handleSearch,
  }

  return (
    <div>
      <h3>Edit Proponent</h3>
      {mines && (
        <EditMinespaceUser
          {...EditMinespaceUserProps}
        />
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  mines: getMineNames(state),
  minespaceUserMines: getMinespaceUserMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(UpdateMinespaceUser);
