import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useSession() {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Ask Supabase if there's already a saved session (e.g. after a page refresh)
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setLoading(false)
        })

        // Stay in sync when the user signs in or out
        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
        })

        // Cleanup: stop listening when the component goes away
        return () => listener.subscription.unsubscribe()
    }, [])

    return { session, loading }
}