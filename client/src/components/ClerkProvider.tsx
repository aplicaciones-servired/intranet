// Este componente ya no es necesario tras migrar de Clerk a autenticación JWT propia
import React from "react";
export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
