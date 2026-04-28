import axios, { AxiosResponse } from 'axios';
import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  PropsWithChildren
} from 'react';
import { AuthModel } from '../_models';
import * as authHelper from '../_helpers';

interface AuthContextProps {
  isLoading: boolean;
  auth: AuthModel | undefined;
  persona: any | undefined;
  setPersona: Dispatch<SetStateAction<any | undefined>>;
  empresa: any | undefined;
  setEmpresa: Dispatch<SetStateAction<any | undefined>>;
  user: any | undefined;
  setUser: Dispatch<SetStateAction<any | undefined>>;
  permissions: string;
  setPermissions: Dispatch<SetStateAction<string>>;
  getUserAuthenticated: (force?: boolean) => Promise<void>;
  logout: () => void;
  login: (email: string, password: string, device_token:string) => Promise<void>;
  register: (email: string, password: string, changepassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string, changepassword: string, token: string) => Promise<void>;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState<any | undefined>(null);
  const [empresa, setEmpresa] = useState<any | undefined>(null);
  const [permissions, setPermissions] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());

  const verify = async () => {
    if (auth) {
      try {
        await getUserAuthenticated();
      } catch (error) {
        saveAuth(undefined);
      }
    }
  };

  useEffect(() => {
    verify().finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAuth = (auth: any | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email: string, password: string, deviceToken: string) => {
    try {
      const response = await axios.post<any>(`login_web`, {
        email,
        password,
        device_token: deviceToken
      });
      saveAuth(response.data.access_token);
      await getUserAuthenticated();
    } catch (error) {
      throw new Error(`Login error: ${error}`);
    }
  };

  const register = async (email: string, password: string, changepassword: string) => {
    try {
      await axios.post(`register_web`, {
        email,
        password,
        changepassword
      });
    } catch (error) {
      throw new Error(`Registration error: ${error}`);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await axios.post(`forgot_password_web`, { email });
    } catch (error) {
      throw new Error(`Forgot password error: ${error}`);
    }
  };

  const resetPassword = async (password: string, changepassword: string, token: string) => {
    try {
      await axios.post(`reset_password_web`, {
        password,
        changepassword,
        token
      });
    } catch (error) {
      throw new Error(`Reset password error: ${error}`);
    }
  };

  const selectCompany = async () => {
    try {
      const response = await axios.post<any>(`set_company`);
      setPermissions(response.data.payload.permissions);
    } catch (error) {
      saveAuth(undefined);

      throw new Error(`Error fetching user: ${error}`);
    }
  };

  const getUserAuthenticated = async (force: boolean = false) => {
    try {
      const response = await axios.post<any>(`user_logged`);
      const auth = response.data;

      await selectCompany();
      await getActiveUser(force);

      setPersona(auth.persona);
      setUser(auth);
    } catch (error) {
      saveAuth(undefined);
      console.error(`Error fetching authenticated user: ${error}`);
      logout();
    }
  };

  // Referencia para cachear web_active_users y evitar 429
  const lastActiveUserFetch = React.useRef<{ time: number, data: any } | null>(null);

  const getActiveUser = async (force: boolean = false) => {
    // Cache por 60 segundos para evitar Rate Limit 429
    const now = Date.now();
    if (!force && lastActiveUserFetch.current && (now - lastActiveUserFetch.current.time < 60000)) {
      if (lastActiveUserFetch.current.data?.length > 0) {
        setEmpresa(lastActiveUserFetch.current.data[0].company);
      }
      return;
    }

    try {
      const response = await axios.post<any>(`web_active_users`);
      lastActiveUserFetch.current = { time: now, data: response.data };
    
      if (Array.isArray(response.data) && response.data.length > 0) {
        setEmpresa(response.data[0].company);
      }
    } catch (error) {
      console.error(`Error fetching authenticated user: ${error}`);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`logout_web`);
      setUser(undefined);
      saveAuth(undefined);
      setPersona(undefined);
      setEmpresa(undefined);
      setPermissions('');
    } catch (error) {
      console.error(`Logout error: ${error}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading: loading,
        auth,
        persona,
        setPersona,
        empresa,
        setEmpresa,
        permissions,
        setPermissions,
        user,
        setUser,
        getUserAuthenticated,
        login,
        register,
        forgotPassword,
        resetPassword,
        verify,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
