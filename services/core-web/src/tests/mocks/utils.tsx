import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { store } from "@/App";

export const renderWithProvider = (ui, options = {}) => {
  return render(<Provider store={store}>{ui}</Provider>, options);
};

export default { renderWithProvider };
