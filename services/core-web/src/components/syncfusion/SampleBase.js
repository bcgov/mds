import { PureComponent } from "react";
import { enableRipple } from "@syncfusion/ej2-base";

enableRipple(true);

export class SampleBase extends PureComponent {
  renderComplete() {}

  componentDidMount() {
    setTimeout(() => {
      this.renderComplete();
    });
  }
}

export default SampleBase;
