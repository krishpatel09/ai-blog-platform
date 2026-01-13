import ForgotPassword from '@/components/auth/Forgot-Password'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Forgot Password - Genwrite',
    description: 'Reset your password to access your account.',
}

export default function ForgotPasswordPage() {
    return <ForgotPassword />
}
