'use client';

import { useEffect, useState } from 'react';

export interface AuthUser {
  userId: number;
  email: string;
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Hook React pour gérer l'état d'authentification
 * 
 * @returns {AuthState} L'état d'authentification actuel
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, isLoading } = useAuth();
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <div>Not logged in</div>;
 * 
 *   return <div>Welcome {user.name}!</div>;
 * }
 * ```
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      })
      .catch(error => {
        console.error('Error fetching auth state:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      });
  }, []);

  return state;
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/logout.html';
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Redirige vers la page de connexion
 * 
 * @param returnUrl URL vers laquelle rediriger après connexion (défaut: page actuelle)
 */
export function login(returnUrl?: string): void {
  const url = returnUrl || window.location.pathname;
  window.location.href = `/api/auth/login?return_url=${encodeURIComponent(url)}`;
}
