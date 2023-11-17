import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineIncidentNotes } from "@mds/common/redux/selectors/incidentSelectors";
import {
  deleteMineIncidentNote,
  createMineIncidentNote,
  fetchMineIncidentNotes,
} from "@mds/common/redux/actionCreators/incidentActionCreator";
import CommentPanel from "@/components/common/comments/CommentPanel";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";

const propTypes = {
  notes: PropTypes.arrayOf(CustomPropTypes.incidentNote).isRequired,
  deleteMineIncidentNote: PropTypes.func.isRequired,
  createMineIncidentNote: PropTypes.func.isRequired,
  fetchMineIncidentNotes: PropTypes.func.isRequired,
  mineIncidentGuid: PropTypes.string,
};

const defaultProps = {
  mineIncidentGuid: null,
};

export class MineIncidentNotes extends Component {
  state = { loading: true };

  componentDidMount() {
    this.fetchNotes();
  }

  handleRemoveComment = (mineIncidentNoteGuid) => {
    this.props
      .deleteMineIncidentNote(this.props.mineIncidentGuid, mineIncidentNoteGuid)
      .then(() => this.fetchNotes());
  };

  handleAddComment = (values) => {
    const formValues = {
      content: values.comment,
    };
    return this.props.createMineIncidentNote(this.props.mineIncidentGuid, formValues).then(() => {
      this.fetchNotes();
    });
  };

  fetchNotes() {
    this.setState({ loading: true });
    this.props
      .fetchMineIncidentNotes(this.props.mineIncidentGuid)
      .then(() => this.setState({ loading: false }));
  }

  render() {
    return (
      <div>
        <span className="ant-comment-content-author-time inline-flex flex-center">
          Message history is only shown for one year
        </span>
        <CommentPanel
          renderEditor
          onSubmit={this.handleAddComment}
          loading={this.state.loading}
          onRemove={this.handleRemoveComment}
          comments={this.props.notes.map((note) => ({
            key: note.mine_incident_note_guid,
            author: note.update_user,
            content: note.content,
            actions: null,
            datetime: note.update_timestamp,
          }))}
          deletePermission={Permission.EDIT_INCIDENTS}
          createPermission={Permission.EDIT_INCIDENTS}
        />
      </div>
    );
  }
}

MineIncidentNotes.propTypes = propTypes;
MineIncidentNotes.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  notes: getMineIncidentNotes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      deleteMineIncidentNote,
      createMineIncidentNote,
      fetchMineIncidentNotes,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MineIncidentNotes);
