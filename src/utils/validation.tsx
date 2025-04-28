import type { RegisterErrors } from '../types/registerErrors';

export const validateForm = ({
  name,
  email,
  password,
  passwordConfirm,
}: {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}) => {
  const errorMsg: RegisterErrors = {};
  if (!name) {
    errorMsg['name'] = '이름을 입력해주세요.';
  } else if (name.length < 2) {
    errorMsg['name'] = '이름은 2글자 이상 입력해주세요.';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  //const isEmail = emailRegex.test(email);
  if (!email) {
    errorMsg['email'] = '이메일을 입력해주세요.';
  } else if (!emailRegex.test(email)) {
    errorMsg['email'] = '이메일 형식이 올바르지 않습니다.';
  }
  if (!password) {
    errorMsg['password'] = '비밀번호를 입력해주세요.';
  } else if (password.length < 8) {
    errorMsg['password'] = '비밀번호는 8자리 이상 입력해주세요.';
  }
  if (!passwordConfirm) {
    errorMsg['passwordConfirm'] = '비밀번호를 입력해주세요.';
  } else if (passwordConfirm !== password) {
    errorMsg['passwordConfirm'] = '비밀번호가 일치하지 않습니다.';
  }
  return errorMsg;
};
