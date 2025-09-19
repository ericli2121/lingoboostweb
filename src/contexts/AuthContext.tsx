import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

import { User, Session } from '@supabase/supabase-js'

import { supabase } from '../utils/supabase'import { User, Session } from '@supabase/supabase-js'import { User, Session } from '@supabase/supabase-js'



interface AuthContextType {import { supabase } from '../utils/supabase'import { supabase } from '../utils/supabase'

  user: User | null

  session: Session | null

  loading: boolean

  signInWithGoogle: () => Promise<void>interface AuthContextType {interface AuthContextType {

  signOut: () => Promise<void>

}  user: User | null  user: User | null



const AuthContext = createContext<AuthContextType | undefined>(undefined)  session: Session | null  session: Session | null



export const useAuth = () => {  loading: boolean  loading: boolean

  const context = useContext(AuthContext)

  if (context === undefined) {  signInWithGoogle: () => Promise<void>  signInWithGoogle: () => Promise<void>

    throw new Error('useAuth must be used within an AuthProvider')

  }  signOut: () => Promise<void>  signOut: () => Promise<void>

  return context

}}}



interface AuthProviderProps {

  children: ReactNode

}const AuthContext = createContext<AuthContextType | undefined>(undefined)const AuthContext = createContext<AuthContextType | undefined>(undefined)



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null)

  const [session, setSession] = useState<Session | null>(null)export const useAuth = () => {export const useAuth = () => {

  const [loading, setLoading] = useState(true)

  const context = useContext(AuthContext)  const context = useContext(AuthContext)

  useEffect(() => {

    // Get initial session  if (context === undefined) {  if (context === undefined) {

    supabase.auth.getSession().then(({ data: { session } }) => {

      setSession(session)    throw new Error('useAuth must be used within an AuthProvider')    throw new Error('useAuth must be used within an AuthProvider')

      setUser(session?.user ?? null)

      setLoading(false)  }  }

    })

  return context  return context

    // Listen for auth changes

    const {}}

      data: { subscription },

    } = supabase.auth.onAuthStateChange((_event, session) => {

      setSession(session)

      setUser(session?.user ?? null)interface AuthProviderProps {interface AuthProviderProps {

      setLoading(false)

    })  children: ReactNode  children: ReactNode



    return () => subscription.unsubscribe()}}

  }, [])



  const signInWithGoogle = async () => {

    try {export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

      const { error } = await supabase.auth.signInWithOAuth({

        provider: 'google',  const [user, setUser] = useState<User | null>(null)  const [user, setUser] = useState<User | null>(null)

        options: {

          redirectTo: window.location.origin  const [session, setSession] = useState<Session | null>(null)  const [session, setSession] = useState<Session | null>(null)

        }

      })  const [loading, setLoading] = useState(true)  const [loading, setLoading] = useState(true)

      if (error) throw error

    } catch (error) {

      console.error('Error signing in with Google:', error)

      throw error  useEffect(() => {  useEffect(() => {

    }

  }    // Get initial session    // Get initial session



  const signOut = async () => {    supabase.auth.getSession().then(({ data: { session } }) => {    supabase.auth.getSession().then(({ data: { session } }) => {

    try {

      const { error } = await supabase.auth.signOut()      setSession(session)      setSession(session)

      if (error) throw error

    } catch (error) {      setUser(session?.user ?? null)      setUser(session?.user ?? null)

      console.error('Error signing out:', error)

      throw error      setLoading(false)      setLoading(false)

    }

  }    })    })



  const value: AuthContextType = {

    user,

    session,    // Listen for auth changes    // Listen for auth changes

    loading,

    signInWithGoogle,    const {    const {

    signOut,

  }      data: { subscription },      data: { subscription },



  return (    } = supabase.auth.onAuthStateChange((_event, session) => {    } = supabase.auth.onAuthStateChange((_event, session) => {

    <AuthContext.Provider value={value}>

      {children}      setSession(session)      setSession(session)

    </AuthContext.Provider>

  )      setUser(session?.user ?? null)      setUser(session?.user ?? null)

}
      setLoading(false)      setLoading(false)

    })    })



    return () => subscription.unsubscribe()    return () => subscription.unsubscribe()

  }, [])  }, [])



  const signInWithGoogle = async () => {  const signInWithGoogle = async () => {

    try {    try {

      const { error } = await supabase.auth.signInWithOAuth({      const { error } = await supabase.auth.signInWithOAuth({

        provider: 'google',        provider: 'google',

        options: {        options: {

          redirectTo: window.location.origin          redirectTo: window.location.origin

        }        }

      })      })

      if (error) throw error      if (error) throw error

    } catch (error) {    } catch (error) {

      console.error('Error signing in with Google:', error)      console.error('Error signing in with Google:', error)

      throw error      throw error

    }    }

  }  }



  const signOut = async () => {  const signOut = async () => {

    try {    try {

      const { error } = await supabase.auth.signOut()      const { error } = await supabase.auth.signOut()

      if (error) throw error      if (error) throw error

    } catch (error) {    } catch (error) {

      console.error('Error signing out:', error)      console.error('Error signing out:', error)

      throw error      throw error

    }    }

  }  }



  const value: AuthContextType = {  const value: AuthContextType = {

    user,    user,

    session,    session,

    loading,    loading,

    signInWithGoogle,    signInWithGoogle,

    signOut,    signOut,

  }  }



  return (  return (

    <AuthContext.Provider value={value}>    <AuthContext.Provider value={value}>

      {children}      {children}

    </AuthContext.Provider>    </AuthContext.Provider>

  )  )

}}
