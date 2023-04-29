const password =
  '(?=^.{8,10}$)(?=.*\\d)(?=.*[AZ])(?=.*[ !@ #$%^ &*()_+}{":;\'?/>.<,])(?!.*\\s).*$';

export const RegExHelper = {
  password,
};
