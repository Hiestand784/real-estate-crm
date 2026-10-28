import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function VerifyMfa({ onDone }: { onDone: () => void }) {
    const [code, setCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setBusy(true)
        setError(null)

        const { data: factors } = await supabase.auth.mfa.listFactors()
        const factor = factors?.totp[0]
        if (!factor) {
            setError('No authenticator found. Please sign out and sign in again.')
            setBusy(false)
            return
        }

        const { error } = await supabase.auth.mfa.challengeAndVerify({
            factorId: factor.id,
            code,
        })
        if (error) {
            setError('That code was not accepted. Check the code and try again.')
            setBusy(false)
            return
        }
        onDone()
    }

    return (
        <main>
            <h1>Enter your code</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    6-digit code from your authenticator app
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.trim())}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                    />
                </label>
                <button type="submit" disabled={busy}>
                    Verify
                </button>
            </form>
            {error && <p role="alert">{error}</p>}
            <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </main>
    )
}