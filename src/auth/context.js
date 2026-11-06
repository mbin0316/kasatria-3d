import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

/** @returns {{ user: null | {id:string,name:string,email:string,picture:string}, signIn:(credential:string)=>void, signInDemo:()=>void, signOut:()=>void }} */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
