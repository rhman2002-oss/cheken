"use server";

export async function verifySuperPassword(password: string): Promise<boolean> {
  const secret = process.env.SUPER_CONFIG_PASSWORD || "chicken2026_super";
  return password.trim() === secret.trim();
}
