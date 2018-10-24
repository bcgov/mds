import React, { Component } from 'react';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import AddPartyForm from '@/components/Forms/AddPartyForm';
import * as String from '@/constants/strings';
import { connect } from 'react-redux';
import { getParties, getPartyIds } from '@/selectors/partiesSelectors';


class UpdateMineManager extends Component {
  render() { 
    console.log(this.props);
    return (
      <div>
        <UpdateMineManagerForm {...this.props}/>
        <p className="center">{String.PERSON_NOT_FOUND}</p>
        <AddPartyForm onSubmit={this.props.handlePartySubmit} isPerson/>
      </div>
      );
  }
}

const mapStateToProps = (state) => {
  return {
    parties: getParties(state),
    partyIds: getPartyIds(state),
  };
};

export default connect(mapStateToProps, null)(UpdateMineManager);