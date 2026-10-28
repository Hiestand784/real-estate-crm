import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            // Deliberately vague
            setError('Sign-in failed. Check your email and password.')
        }
        setSubmitting(false)
    }

    return (
        <main>
            <h1>Sign in</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>
                {error && <p role="alert">{error}</p>}
            </form>
        </main>
    )
}