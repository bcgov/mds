import React, { PureComponent } from "react";
import { enableRipple } from "@syncfusion/ej2-base";

enableRipple(true);

export class SampleBase extends PureComponent {
  renderComplete() {
    /** custom render complete function */
  }

  componentDidMount() {
    setTimeout(() => {
      this.renderComplete();
    });
  }
}

export default SampleBase;
