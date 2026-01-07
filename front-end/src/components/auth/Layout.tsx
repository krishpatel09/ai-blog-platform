"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const slides = [
    '/slide-1.jpg',
    '/slide-2.jpg',
    '/slide-3.jpg',
]

interface AuthLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Panel - Image Section */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <div
                        className="flex h-full w-full transition-transform duration-1000 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className="relative h-full w-full shrink-0"
                            >
                                <Image
                                    src={slide}
                                    fill
                                    className="object-cover opacity-90"
                                    priority={index === 0}
                                    alt={`Authentication background slide ${index + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-black/10" />
                </div>

                <div className="relative z-10 flex flex-col justify-end p-12 w-full h-full">
                    <div className="flex gap-2 pt-4">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-12 bg-white' : 'w-2 bg-white/50'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
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
