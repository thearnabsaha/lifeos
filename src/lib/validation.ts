/**
 * Auth form / API validation shared by login + signup (client and server).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Owner exemption: only the exact identifier `arnab` (case-insensitive,
 * trimmed) may skip email-format and password-strength rules on login.
 * Nobody else gets a free pass; signup never allows this username.
 */
export function isExemptIdentifier(identifier: string): boolean {
  return identifier.trim().toLowerCase() === "arnab";
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && EMAIL_RE.test(trimmed);
}

/** Password strength for everyone except the exempt login identifier. */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  return /[A-Za-z]/.test(password) && /\d/.test(password);
}

export type FieldErrors = {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
};

export function validateLoginFields(
  email: string,
  password: string
): FieldErrors {
  const errors: FieldErrors = {};
  const id = typeof email === "string" ? email : "";
  const pw = typeof password === "string" ? password : "";
  const exempt = isExemptIdentifier(id);

  if (!id.trim()) {
    errors.email = "Email is required";
  } else if (!exempt && !isValidEmail(id)) {
    errors.email = "Enter a valid email address";
  }

  if (!pw) {
    errors.password = "Password is required";
  } else if (!exempt && pw.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

export function validateSignupFields(
  email: string,
  password: string,
  name: string,
  confirmPassword?: string
): FieldErrors {
  const errors: FieldErrors = {};
  const id = typeof email === "string" ? email : "";
  const pw = typeof password === "string" ? password : "";
  const nm = typeof name === "string" ? name : "";

  if (!nm.trim()) {
    errors.name = "Name is required";
  }

  if (!id.trim()) {
    errors.email = "Email is required";
  } else if (isExemptIdentifier(id)) {
    errors.email = "This username is reserved";
  } else if (!isValidEmail(id)) {
    errors.email = "Enter a valid email address";
  }

  if (!pw) {
    errors.password = "Password is required";
  } else if (pw.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!isStrongPassword(pw)) {
    errors.password = "Password must include a letter and a number";
  }

  if (confirmPassword !== undefined) {
    if (!confirmPassword) {
      errors.confirmPassword = "Confirm your password";
    } else if (confirmPassword !== pw) {
      errors.confirmPassword = "Passwords do not match";
    }
  }

  return errors;
}

export function firstError(errors: FieldErrors): string | undefined {
  return (
    errors.name ||
    errors.email ||
    errors.password ||
    errors.confirmPassword
  );
}
