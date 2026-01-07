// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase/supabaseClient'

// export default function AuthCallback() {
//   const router = useRouter()

//   useEffect(() => {
//     const handleAuthCallback = async () => {
//       try {
//         const { data, error } = await supabase.auth.getSession()
        
//         if (error) {
//           console.error('Error getting session:', error)
//           router.push('/sign-in?error=auth_failed')
//           return
//         }

//         if (data.session) {
//           router.push('/')
//           router.refresh()
//         } else {
//           router.push('/sign-in')
//         }
//       } catch (error) {
//         console.error('Unexpected error:', error)
//         router.push('/sign-in?error=unexpected')
//       }
//     }

//     handleAuthCallback()
//   }, [router])

//   return (
//     <div className="flex min-h-screen items-center justify-center">
//       <div className="text-center">
//         <p className="text-lg text-gray-600 dark:text-gray-400">
//           Completing sign in...
//         </p>
//       </div>
//     </div>
//   )
// }

