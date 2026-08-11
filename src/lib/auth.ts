export function verifyAdmin(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  return password === adminPassword;
}
