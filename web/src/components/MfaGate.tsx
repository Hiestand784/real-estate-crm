import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { EnrollMfa } from './EnrollMfa'
import { VerifyMfa } from './VerifyMfa'

type Step = 'checking' | 'enroll' | 'verify' | 'ok' | 'error'

// Asks Supabase which MFA step the user is on. It only returns the answer;
// the component decides when to put it into state.
async function getStep(): Promise<Step> {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error || !data) return 'error' // fail closed: if we can't tell, don't show the app
    if (data.currentLevel === 'aal2') return 'ok'
    if (data.nextLevel === 'aal2') return 'verify'
    return 'enroll'
}

export function MfaGate({ children }: { children: ReactNode }) {
    const [step, setStep] = useState<Step>('checking')

    // Re-check after enrolling or verifying
    const check = useCallback(() => {
        void getStep().then(setStep)
    }, [])

    // First check on load. setState runs in the .then callback (after the
    // network call), not in the effect body. The cancelled flag stops a late
    // answer from updating a component that has already unmounted.
    useEffect(() => {
        let cancelled = false
        void getStep().then((s) => {
            if (!cancelled) setStep(s)
        })
        return () => {
            cancelled = true
        }
    }, [])

    if (step === 'checking') return <p>Loading…</p>
    if (step === 'enroll') return <EnrollMfa onDone={check} />
    if (step === 'verify') return <VerifyMfa onDone={check} />
    if (step === 'error') {
        return (
            <main>
                <p role="alert">Couldn't verify your security status. Please sign in again.</p>
                <button onClick={() => supabase.auth.signOut()}>Sign out</button>
            </main>
        )
    }
    return <>{children}</>
}
