import { currencyMask } from "@common/utils/helpers";
import { required, number, currency } from "@common/utils/Validate";

export const CURRENCY = [currencyMask, { validate: [required, number, currency] }];

export const CONTEXT_PROPS = { currency: CURRENCY };

export const getContextProps = (contextProps) => {
  let props = {};
  if (contextProps) {
    contextProps.map((contextProp) =>
      CONTEXT_PROPS[contextProp].map((prop) => (props = { ...props, ...prop }))
    );
  }
  return props;
};
