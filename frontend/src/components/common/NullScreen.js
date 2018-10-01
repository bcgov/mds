import React from 'react';
import PropTypes from 'prop-types';
import { TENURE, NO_MINE, MINER_TWO  } from '@/constants/assets';
import * as String from '@/constants/strings';

const propTypes = {
  type: PropTypes.string.isRequired,
  small: PropTypes.bool
};

const NullScreen = (props) => {
  return (
    <div className="null-screen">
      {props.type === 'dashboard' &&
        <div>
          <img src={NO_MINE} />
          <h1>{String.NO_DATA}</h1>
          <h5>{String.TRY_AGAIN}</h5>
        </div>
      }
      {props.type === 'generic' &&
        <div>
          <img src={NO_MINE} />
          <h1>{String.NO_DATA}</h1>
        </div>
      }
      {props.type === 'manager' &&
        <div className="null-screen--inline">
          <img src={MINER_TWO} />
          <h1>{String.NO_MINE_MANAGER}</h1>
        </div>
      }
       {props.type === 'manager-small' &&
        <div>
          <img src={MINER_TWO} />
          <h1>{String.NO_DATA}</h1>
          <h5>{String.ADD_PARTY}</h5>
        </div>
      }
      {props.type === 'tenure' &&
        <div>
          <img src={TENURE} />
          <h1>{String.NO_DATA}</h1>
          <h5>{String.ADD_TENURE}</h5>
        </div>
      }
    </div>
  );
};

NullScreen.propTypes = propTypes;

export default NullScreen;