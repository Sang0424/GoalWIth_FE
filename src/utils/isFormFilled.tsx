export const isFormFilled = (form: {}) => {
  return Object.values(form).every(value => value !== '');
};
