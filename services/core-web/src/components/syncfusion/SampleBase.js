import React, { PureComponent } from "react";
import { enableRipple } from "@syncfusion/ej2-base";
enableRipple(true);

export class SampleBase extends PureComponent {
  rendereComplete() {
    /**custom render complete function */
  }
  componentDidMount() {
    setTimeout(() => {
      this.rendereComplete();
    });
  }
}

export default SampleBase;
