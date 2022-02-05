import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  name: string;
  isAdmin: boolean;
}

type AuthContextData = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  isLogging: boolean;
  user: User | null;
}

type AuthProviderProps = {
  children: ReactNode;
}

const USER_COLLECTION = '@gopizza:users';

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  async function loadUserStorageData() {
    setIsLogging(true);

    const storedUser = await AsyncStorage.getItem(USER_COLLECTION);

    if (storedUser) {
      const userData = JSON.parse(storedUser) as User;

      setUser(userData);
    }

    setIsLogging(false);
  }

  async function signIn(email: string, password: string) {
    if (!email || !password) {
      return Alert.alert('Login', 'Informe o e-mail e a senha.');
    }

    setIsLogging(true);

    auth()
      .signInWithEmailAndPassword(email, password)
      .then((account) => {
        firestore()
          .collection('users')
          .doc(account.user.uid)
          .get()
          .then(async (profile) => {
            const { name, isAdmin } = profile.data() as User;

            if (profile.exists) {
              const userData = {
                id: account.user.uid,
                name,
                isAdmin,
              };

              await AsyncStorage.setItem(USER_COLLECTION, JSON.stringify(userData))
              setUser(userData);
            }
          })
          .catch(() => Alert.alert('Login', 'Não foi possível buscar dados do usuário'))
      })
      .catch(error => {
        const { code } = error;

        if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
          Alert.alert('Login', 'E-mail e/ou senha inválida.');
        } else {
          Alert.alert('Login', 'Não foi possível realizar o login.');
        }
      })
      .finally(() => setIsLogging(false));
  }

  async function signOut() {
    await auth().signOut();
    await AsyncStorage.removeItem(USER_COLLECTION);

    setUser(null);
  }

  async function forgotPassword(email: string) {
    if (!email) {
      return Alert.alert('Redefinir senha', 'Informe o e-mail.');
    }

    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        return Alert.alert('Redefinir senha', 'Enviamos um link no seu e-mail.')
      })
      .catch(() => Alert.alert('Redefinir senha', 'Não foi possível redefinir sua senha.'))
  }

  useEffect(() => {
    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLogging,
      signIn,
      signOut,
      user,
      forgotPassword 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };