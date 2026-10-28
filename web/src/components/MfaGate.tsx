import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { EnrollMfa } from './EntollMfa'
import { VerifyMfa } from './VerifyMfa'

type Step = 'checking' | 'enroll' | 'verify' | 'ok' | 'error'

export function MfaGate({ children }: { children: ReactNode }) {
    const [step, setStep] = useState<Step>('checking')

    const check = useCallback(async () => {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (error || !data) {
            setStep('error') // fail closed: if we can't tell, don't show the app
            return
        }
        if (data.currentLevel === 'aal2') setStep('ok')
        else if (data.nextLevel === 'aal2') setStep('verify')
        else setStep('enroll')
    }, [])

    useEffect(() => {
        void check()
    }, [check])

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