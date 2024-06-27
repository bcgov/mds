import React from "react";
import { connect } from "react-redux";
import { Divider } from "antd";
import { getMines, getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import AmazonS3Provider from "@mds/common/components/syncfusion/AmazonS3Provider";
import { RootState } from "@mds/common/redux/rootState";

interface MineDocumentsProps {
  mines: Record<string, { mine_no: string }>;
  mineGuid: string;
}

/**
 * @class MineDocuments - View the mine's archived MMS files.
 */
export const MineDocuments: React.FC<MineDocumentsProps> = (props: MineDocumentsProps) => {
  const mine = props.mines[props.mineGuid];
  return (
    <div className="tab__content">
      <div>
        <h2>Archived MMS Files</h2>
        <p>Archived MMS files are available on this page. These documents are read-only.</p>
        <Divider />
        <AmazonS3Provider mineNumber={mine.mine_no} />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

export default connect(mapStateToProps)(MineDocuments);
