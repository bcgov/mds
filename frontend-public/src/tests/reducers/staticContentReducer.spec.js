const baseExpectedValue = {
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));
