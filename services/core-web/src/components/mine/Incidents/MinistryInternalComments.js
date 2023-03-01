import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineIncidentNotes } from "@common/selectors/incidentSelectors";
import {
  createMineIncidentNote,
  fetchMineIncidentNotes,
} from "@common/actionCreators/incidentActionCreator";
import MinistryCommentPanel from "@/components/common/comments/MinistryCommentPanel";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  notes: PropTypes.arrayOf(CustomPropTypes.incidentNote).isRequired,
  createMineIncidentNote: PropTypes.func.isRequired,
  fetchMineIncidentNotes: PropTypes.func.isRequired,
  mineIncidentGuid: PropTypes.string,
  isEditMode: PropTypes.bool,
  createPermission: PropTypes.string,
};

const defaultProps = {
  mineIncidentGuid: null,
  isEditMode: true,
  createPermission: Permission.EDIT_INCIDENTS,
};

export const MinistryInternalComments = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const { createPermission, isEditMode, mineIncidentGuid } = props;

  const fetchNotes = () => {
    setIsLoading(true);
    props.fetchMineIncidentNotes(mineIncidentGuid).then(() => setIsLoading(false));
  };

  const handleAddComment = (values) => {
    const formValues = {
      content: values.comment,
    };
    return props.createMineIncidentNote(mineIncidentGuid, formValues).then(() => {
      fetchNotes();
    });
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div>
      <h4 id="internal-ministry-comments">Internal Ministry Comments</h4>
      {isEditMode && (
        <AuthorizationWrapper permission={createPermission}>
          <div className="margin-large--top margin-large--bottom">
            <p>
              <strong>
                These comments are for interal staff only and will not be shown to proponents.
              </strong>
              {" "}
              Add comments to this incident for future reference. Anything written in these comments
              may be requested under FOIPPA. Keep it professional and concise.
            </p>
          </div>
        </AuthorizationWrapper>
      )}
      <MinistryCommentPanel
        renderEditor={isEditMode}
        onSubmit={handleAddComment}
        loading={isLoading}
        comments={props.notes?.map((note) => ({
          key: note.mine_incident_note_guid,
          author: note.update_user,
          content: note.content,
          actions: null,
          datetime: note.update_timestamp,
        }))}
        createPermission={createPermission}
      />
    </div>
  );
};

MinistryInternalComments.propTypes = propTypes;
MinistryInternalComments.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  notes: getMineIncidentNotes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createMineIncidentNote,
      fetchMineIncidentNotes,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MinistryInternalComments);
