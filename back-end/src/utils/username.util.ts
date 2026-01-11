export function slugifyEmail(email: string): string {
    const emailPrefix = email.split('@')[0];

    return emailPrefix
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}