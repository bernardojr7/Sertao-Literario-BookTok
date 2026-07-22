export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function validateName(name) {
  return name.trim().length >= 2;
}

export function validateSecurityCode(code, type) {
  const codes = {
    teacher: 'SERTAO-PROF-2026',
    coordinator: 'SERTAO-COORD-2026'
  };
  return code === codes[type];
}
