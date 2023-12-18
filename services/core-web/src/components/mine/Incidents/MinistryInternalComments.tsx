import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMineIncidentNotes } from "@mds/common/redux/selectors/incidentSelectors";
import {
  createMineIncidentNote,
  fetchMineIncidentNotes,
} from "@mds/common/redux/actionCreators/incidentActionCreator";
import MinistryCommentPanel from "@/components/common/comments/MinistryCommentPanel";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

interface MinistryInternalCommentsProps {
  mineIncidentGuid: string;
  isEditMode: boolean;
  createPermission?: string;
}

export const MinistryInternalComments: FC<MinistryInternalCommentsProps> = ({
  mineIncidentGuid,
  isEditMode = true,
  createPermission = Permission.EDIT_INCIDENTS,
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const notes = useSelector(getMineIncidentNotes);

  const fetchNotes = async () => {
    setIsLoading(true);
    await dispatch(fetchMineIncidentNotes(mineIncidentGuid));
    setIsLoading(false);
  };

  const handleAddComment = async (values) => {
    const formValues = {
      content: values.comment,
    };
    await dispatch(createMineIncidentNote(mineIncidentGuid, formValues));
    fetchNotes();
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
                These comments are for internal staff only and will not be shown to proponents.
              </strong>{" "}
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
        comments={notes?.map((note) => ({
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

export default MinistryInternalComments;
