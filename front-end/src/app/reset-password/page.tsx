import ForgotPassword from '@/components/auth/Forgot-Password'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Reset Password - Genwrite',
    description: 'Create a new password for your account.',
}

export default function ResetPasswordPage() {
    return <ForgotPassword />
}
