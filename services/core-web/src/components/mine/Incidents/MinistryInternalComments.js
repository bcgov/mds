import React, { Component } from "react";
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

const propTypes = {
  notes: PropTypes.arrayOf(CustomPropTypes.incidentNote).isRequired,
  createMineIncidentNote: PropTypes.func.isRequired,
  fetchMineIncidentNotes: PropTypes.func.isRequired,
  mineIncidentGuid: PropTypes.string,
};

const defaultProps = {
  mineIncidentGuid: null,
};

export class MinistryInternalComments extends Component {
  state = { loading: true };

  componentDidMount() {
    this.fetchNotes();
  }

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
        <h4 id="internal-ministry-comments">Internal Ministry Comments</h4>
        <br />
        <p>
          <strong>
            These comments are for interal staff only and will not be shown to proponents.
          </strong>{" "}
          Add comments to this incident for future reference. Anything written in these comments may
          be requested under FOIPPA. Keep it professional and concise.
        </p>
        <br />
        <MinistryCommentPanel
          renderEditor
          onSubmit={this.handleAddComment}
          loading={this.state.loading}
          comments={this.props.notes?.map((note) => ({
            key: note.mine_incident_note_guid,
            author: note.update_user,
            content: note.content,
            actions: null,
            datetime: note.update_timestamp,
          }))}
          createPermission={Permission.EDIT_INCIDENTS}
        />
      </div>
    );
  }
}

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
