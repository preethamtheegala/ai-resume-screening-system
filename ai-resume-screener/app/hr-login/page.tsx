'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HRLogin() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {

    if (!email || !password) {
      alert('Please fill all fields')
      return
    }

    try {

      setLoading(true)

      const response = await fetch('https://ai-resume-screening-system-production-6bf1.up.railway.app/hr-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {

        localStorage.setItem('hrLoggedIn', 'true')

        router.push('/hr-dashboard')

      } else {

        alert(data.error)

      }

      setLoading(false)

    } catch (error) {

      console.error(error)
      alert('Server error')
      setLoading(false)

    }
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-6 text-white">

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-md shadow-2xl">

        <h1 className="text-4xl font-black text-center mb-3">
          HR Login
        </h1>

        <p className="text-center text-gray-300 mb-10">
          Resume Screening Admin Portal
        </p>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="HR Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-black/20 border border-white/10 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-black/20 border border-white/10 outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold text-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </div>

        <div className="mt-8 text-sm text-gray-400 text-center">
          Demo Login:<br />
          hr@company.com / admin123
        </div>

      </div>

    </div>
  )
}