import VerifyEmail from '@/components/auth/verify-email'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Verify Email - Genwrite',
    description: 'Verify your email address to complete registration.',
}

export default function VerifyEmailPage() {
    return <VerifyEmail />
}
