export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Password should be at least 8 characters long
  // and contain at least one uppercase letter, one lowercase letter, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const getPasswordStrength = (password) => {
  if (!password) return 'weak';
  
  let strength = 0;
  
  // Add points for length
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Add points for complexity
  if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
  if (/[a-z]/.test(password)) strength += 1; // Has lowercase
  if (/\d/.test(password)) strength += 1;    // Has number
  if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special char
  
  if (strength < 3) return 'weak';
  if (strength < 5) return 'medium';
  return 'strong';
};

export const formatValidationErrors = (errors) => {
  return Object.entries(errors)
    .map(([field, message]) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`)
    .join('\n');
}; 