export const inputMeta = {
    touched: false,
    error: false,
    warning: false,
    autofilled: false,
    asyncValidating: false,
    dirty: false,
    dispatch: jest.fn(),
    form: "FORM",
    initial: undefined,
    invalid: false,
    pristine: true,
    submitFailed: false,
    submitting: false,
    valid: true,
    visited: false,
};

export const errorInputMeta = {
    touched: true,
    error: "Error message",
    warning: false,
    autofilled: false,
    asyncValidating: false,
    dirty: true,
    dispatch: jest.fn(),
    form: "FORM",
    initial: undefined,
    invalid: true,
    pristine: true,
    submitFailed: false,
    submitting: false,
    valid: true,
    visited: true,
}

// needs a value and a name
export const inputProps = {
    onBlur: jest.fn(),
    onChange: jest.fn(),
    onDragStart: jest.fn(),
    onDrop: jest.fn(),
    onFocus: jest.fn()
}