import React from 'react'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('la public key de Clerk no está definida. Asegúrate de tener PUBLIC_CLERK_PUBLISHABLE_KEY en tu archivo .env')
}

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            {children}
        </ClerkProvider>
    )
} 