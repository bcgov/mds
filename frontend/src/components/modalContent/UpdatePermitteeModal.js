import React, { Component } from 'react';
import { Radio } from 'antd';
import UpdatePermitteeForm from '@/components/Forms/UpdatePermitteeForm';
import AddPartyForm from '@/components/Forms/AddPartyForm';
import * as String from '@/constants/strings';
import { connect } from 'react-redux';
import { getCurrentPermitteeIds, getCurrentPermittees } from '@/selectors/mineSelectors';
import { getParties, getPartyIds } from '@/selectors/partiesSelectors';


class UpdatePermitteeModal extends Component {
  state = { isPerson: true }

  togglePartyChange = (value) => {
    this.setState({isPerson: value.target.value})
  }

  handlePartySubmit = (values) => {
    const type = this.props.isPerson ? 'PER' : 'ORG';
    this.props.handlePartySubmit(values, type);
  }

  render() { 
    return (  
      <div>
      <UpdatePermitteeForm {...this.props}/> 
      <p className="center">{String.PARTY_NOT_FOUND}</p>
      <div className="center">
        <Radio.Group defaultValue={true} size="large" onChange={this.togglePartyChange}>
          <Radio.Button value={true}>Person</Radio.Button>
          <Radio.Button value={false}>Company</Radio.Button>
        </Radio.Group>
        <AddPartyForm onSubmit={this.handlePartySubmit} isPerson={this.state.isPerson}/>
      </div>
    </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    parties: getParties(state),
    partyIds: getPartyIds(state),
    permittees: getCurrentPermittees(state),
    permitteeIds: getCurrentPermitteeIds(state),
  };
};

export default connect(mapStateToProps, null)(UpdatePermitteeModal);