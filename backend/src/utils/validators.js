export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/;

export const phoneRegex = /^\+?\d{10,15}$/;

export const isStrongPassword = (password = '') => passwordRegex.test(password);

export const isValidPhone = (phone = '') => !phone || phoneRegex.test(phone);

