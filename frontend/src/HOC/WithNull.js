import * as React from "react";
import hoistNonReactStatics from 'hoist-non-react-statics';
import { TENURE, MINER, NO_MINE, MINER_TWO  } from '@/constants/assets';
import * as String from '@/constants/strings';

const WithNull = (prop, arr, generic, small) => WrappedComponent => {
  class WithNull extends React.PureComponent {
    render() {
      console.log(this.props);
      console.log(this.props[prop][arr]);
      if (this.props[prop][arr].length === 0) {
        return (
          <div>
            {(arr === 'mineral_tenure_xref') &&
                <div className="null-screen">
                  <img src={TENURE} />
                  <h1></h1>
                  <h5>Please add tenure number below</h5>
                </div>
            }
            {(arr === 'mgr_appointment') &&
                <div className="null-screen">
                  <img src={small ? MINER_TWO : MINER} />
                  <h1>No assigned mine manager</h1>
                  <h5>Please add mine manager below</h5>
                </div>
            }
            { generic &&
                <div className="null-screen">
                  <img src={NO_MINE} />
                  <h1>No data at this time</h1>
                </div>
            }
          </div>
        )
    } else {
      return <WrappedComponent {...this.props} />;
    }
    }
  }
  hoistNonReactStatics(WithNull, WrappedComponent);
  return WithNull
};

export default WithNull;