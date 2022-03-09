import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getMineComments } from "@common/selectors/mineSelectors";
import {
  deleteMineIncidentNote,
  createMineIncidentNote,
  fetchMineIncidentNotes,
} from "@common/actionCreators/incidentActionCreator";
import CommentPanel from "@/components/common/comments/CommentPanel";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineIncidentGuid: PropTypes.string.isRequired,
  notes: PropTypes.arrayOf(CustomPropTypes.incidentNote).isRequired,
  deleteMineIncidentNote: PropTypes.func.isRequired,
  createMineIncidentNote: PropTypes.func.isRequired,
  fetchMineIncidentNotes: PropTypes.func.isRequired,
};

export class MineIncidentNotes extends Component {
  state = { loading: true };

  componentDidMount() {
    this.fetchNotes();
  }

  handleRemoveComment = (mineIncidentNoteGuid) => {
    this.props
      .deleteMineIncidentNote(
        this.props.mineGuid,
        this.props.mineIncidentGuid,
        mineIncidentNoteGuid
      )
      .then(() => this.fetchMineIncidentNotes());
  };

  handleAddComment = async (values) => {
    const formValues = {
      content: values.comment,
    };
    return this.props
      .createMineIncidentNote(this.props.mineGuid, this.props.mineIncidentGuid, formValues)
      .then(() => {
        this.fetchMineIncidentNotes();
      });
  };

  fetchNotes() {
    this.setState({ loading: true });
    this.props
      .fetchMineIncidentNotes(this.props.mineGuid)
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
        />
      </div>
    );
  }
}

MineIncidentNotes.propTypes = propTypes;

const mapStateToProps = (state) => ({
  comments: getMineComments(state),
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
