import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getPersonnelById } from '@/actionCreators/personnelActionCreator';
import { getPersonnel } from '@/selectors/personnelSelectors';
import Loading from '@/components/reusables/Loading';


const propTypes = {
  getPersonnelById: PropTypes.func,
  personnel: PropTypes.object,
  match: PropTypes.object
};

const defaultProps = {
 personnel: {},
};

export class PersonnelProfile extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.getPersonnelById(id);
  }

  render() {
    const { id } = this.props.match.params;
    const personnel = this.props.personnel[id];
    if (personnel) {
      return (
        <div className="landing-page">
          <div className="landing-page__header">
            <h1>hi</h1>
          </div>
          <div className="landing-page__content">
          </div>
        </div>
      )
    } else {
      return (<Loading />)
    }
  }
}


const mapStateToProps = (state) => {
  return {
    personnel: getPersonnel(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getPersonnelById
  }, dispatch);
};

PersonnelProfile.propTypes = propTypes;
PersonnelProfile.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PersonnelProfile);
