// Validaciones reutilizables (probadas previamente en test_logic.js)

function emailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordValida(password) {
  // Criterio de aceptacion SCRUM-10: minimo 8 caracteres, con al menos 1 numero
  return typeof password === 'string' && password.length >= 8 && /\d/.test(password);
}

module.exports = { emailValido, passwordValida };
