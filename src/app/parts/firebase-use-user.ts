import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

export function useFirebaseUser() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    // Set initial user if already available
    const currentUser = auth.currentUser;
    if (currentUser) {
      setAuthState({
        user: currentUser,
        loading: false,
        initialized: true,
      });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        initialized: true,
      });
    });

    return () => unsubscribe();
  }, []);

  return authState;
}