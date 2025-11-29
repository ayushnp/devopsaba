export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/;

export const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const phoneRegex = /^\+?\d{10,15}$/;

export const isValidPassword = (password = '') => passwordRegex.test(password);
export const isValidEmail = (email = '') => emailRegex.test(email);
export const isValidPhone = (phone = '') => !phone || phoneRegex.test(phone);

