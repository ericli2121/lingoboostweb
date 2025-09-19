import React, { useState } from 'react'import React, { useState } from 'react'

import { supabase } from '../utils/supabase'import { useAuth } from '../contexts/AuthContext'



export const LoginPage: React.FC = () => {export const LoginPage: React.FC = () => {

  const [isLoading, setIsLoading] = useState(false)  const { signInWithGoogle } = useAuth()

  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {

    try {  const handleGoogleSignIn = async () => {

      setIsLoading(true)    try {

      const { error } = await supabase.auth.signInWithOAuth({      setIsLoading(true)

        provider: 'google',      await signInWithGoogle()

        options: {    } catch (error) {

          redirectTo: window.location.origin      console.error('Failed to sign in:', error)

        }    } finally {

      })      setIsLoading(false)

      if (error) throw error    }

    } catch (error) {  }

      console.error('Failed to sign in:', error)

    } finally {  return (

      setIsLoading(false)    <div className="min-h-screen bg-slate-50 flex items-center justify-center">

    }      <div className="max-w-md w-full mx-4">

  }        <div className="bg-white rounded-lg shadow-lg p-8">

          {/* Logo/Title */}

  return (          <div className="text-center mb-8">

    <div className="min-h-screen bg-slate-50 flex items-center justify-center">            <h1 className="text-3xl font-bold text-slate-800 mb-2">LingoBoost</h1>

      <div className="max-w-md w-full mx-4">            <p className="text-slate-600">Master languages through rapid sentence construction</p>

        <div className="bg-white rounded-lg shadow-lg p-8">          </div>

          {/* Logo/Title */}

          <div className="text-center mb-8">          {/* Welcome Message */}

            <h1 className="text-3xl font-bold text-slate-800 mb-2">LingoBoost</h1>          <div className="text-center mb-8">

            <p className="text-slate-600">Master languages through rapid sentence construction</p>            <h2 className="text-xl font-semibold text-slate-700 mb-2">Welcome!</h2>

          </div>            <p className="text-slate-500">Sign in to save your progress and track your learning journey</p>

          </div>

          {/* Welcome Message */}

          <div className="text-center mb-8">          {/* Google Sign In Button */}

            <h2 className="text-xl font-semibold text-slate-700 mb-2">Welcome!</h2>          <button

            <p className="text-slate-500">Sign in to save your progress and track your learning journey</p>            onClick={handleGoogleSignIn}

          </div>            disabled={isLoading}

            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"

          {/* Google Sign In Button */}          >

          <button            {isLoading ? (

            onClick={handleGoogleSignIn}              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>

            disabled={isLoading}            ) : (

            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"              <svg className="w-5 h-5" viewBox="0 0 24 24">

          >                <path

            {isLoading ? (                  fill="#4285F4"

              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"

            ) : (                />

              <svg className="w-5 h-5" viewBox="0 0 24 24">                <path

                <path                  fill="#34A853"

                  fill="#4285F4"                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"

                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"                />

                />                <path

                <path                  fill="#FBBC05"

                  fill="#34A853"                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"

                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"                />

                />                <path

                <path                  fill="#EA4335"

                  fill="#FBBC05"                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"

                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"                />

                />              </svg>

                <path            )}

                  fill="#EA4335"            {isLoading ? 'Signing in...' : 'Continue with Google'}

                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"          </button>

                />

              </svg>          {/* Footer */}

            )}          <div className="mt-8 text-center">

            {isLoading ? 'Signing in...' : 'Continue with Google'}            <p className="text-xs text-slate-400">

          </button>              By signing in, you agree to our terms of service and privacy policy

            </p>

          {/* Footer */}          </div>

          <div className="mt-8 text-center">        </div>

            <p className="text-xs text-slate-400">      </div>

              By signing in, you agree to our terms of service and privacy policy    </div>

            </p>  )

          </div>}

        </div>
      </div>
    </div>
  )
}