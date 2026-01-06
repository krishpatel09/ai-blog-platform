import Link from 'next/link'
import Image from 'next/image'

interface AuthLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Panel - Image Section */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="data:image/jpeg;base64,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"
                        alt="Modern Architecture"
                        fill
                        className="object-cover opacity-90"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/90 p-2 rounded-full">
                            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className="text-2xl font-semibold tracking-tight">Realnest</span>
                    </div>

                    <div className="space-y-6 mb-8">
                        <h1 className="text-5xl font-bold leading-tight">
                            Find your sweet home
                        </h1>
                        <p className="text-xl text-gray-200 font-light max-w-md">
                            Schedule visit in just a few clicks visits in just a few clicks
                        </p>

                        <div className="flex gap-2 pt-4">
                            <div className="w-12 h-1.5 bg-white rounded-full"></div>
                            <div className="w-2 h-1.5 bg-white/50 rounded-full"></div>
                            <div className="w-2 h-1.5 bg-white/50 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Section */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 bg-white dark:bg-gray-950">
                <div className="w-full max-w-md mx-auto space-y-8">
                    {children}
                </div>
            </div>
        </div>
    )
}
