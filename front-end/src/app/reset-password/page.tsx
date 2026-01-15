import ResetPassword from '@/components/auth/reset-password'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Reset Password - Genwrite',
    description: 'Create a new password for your account.',
}

export default function ResetPasswordPage() {
    return <ResetPassword />
}
