import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function EnrollMfa({ onDone }: { onDone: () => void }) {
    const [factorId, setFactorId] = useState('')
    const [qr, setQr] = useState('')
    const [secret, setSecret] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    async function begin() {
        setBusy(true)
        setError(null)

        // Clear out any half-finished setup from an earlier attempt
        const { data: factors } = await supabase.auth.mfa.listFactors()
        for (const f of factors?.all ?? []) {
            if (f.factor_type === 'totp' && f.status === 'unverified') {
                await supabase.auth.mfa.unenroll({ factorId: f.id })
            }
        }

        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
        if (error || !data) {
            setError('Could not start setup. Please try again.')
        } else {
            setFactorId(data.id)
            setQr(data.totp.qr_code)
            setSecret(data.totp.secret)
        }
        setBusy(false)
    }

    async function handleVerify(e: FormEvent) {
        e.preventDefault()
        setBusy(true)
        setError(null)

        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
        if (error) {
            setError('That code was not accepted. Check the code and try again.')
            setBusy(false)
            return
        }
        onDone()
    }

    return (
        <main>
            <h1>Set up two-factor authentication</h1>

            {!factorId ? (
                <>
                    <p>
                        Install an authenticator app on your phone (such as Google Authenticator,
                        Microsoft Authenticator, or your password manager), then continue.
                    </p>
                    <button onClick={begin} disabled={busy}>
                        Begin setup
                    </button>
                </>
            ) : (
                <>
                    <p>Scan this code with your authenticator app:</p>
                    <img src={qr} alt="QR code for authenticator app setup" width={200} height={200} />
                    <p>
                        Can't scan? Enter this key manually: <code>{secret}</code>
                    </p>
                    <p>Save that key in your password manager as a backup.</p>

                    <form onSubmit={handleVerify}>
                        <label>
                            6-digit code
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
                            Verify and finish
                        </button>
                    </form>
                </>
            )}

            {error && <p role="alert">{error}</p>}
            <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </main>
    )
}