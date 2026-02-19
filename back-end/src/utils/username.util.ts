export function slugifyEmail(email: string): string {
  const emailPrefix = email.split('@')[0];

  const baseUsername = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseUsername}${randomSuffix}`;
}
