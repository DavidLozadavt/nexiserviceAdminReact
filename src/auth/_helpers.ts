import { getData, setData } from '@/utils';
const AUTH_LOCAL_STORAGE_KEY = 'auth_token';
const API_URL = import.meta.env.VITE_APP_API_URL;

const getAuth = (): any | undefined => {
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY) as any | undefined;
    if (auth) {
      return auth;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error);
  }
};

const setAuth = (token: string) => {
  setData(AUTH_LOCAL_STORAGE_KEY, token);
};

const removeAuth = () => {
  if (!localStorage) {
    return;
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error);
  }
};

export function setupAxios(axios: any) {
  axios.defaults.headers.Accept = 'application/json';
  axios.defaults.baseURL = API_URL;

  axios.interceptors.request.use(
    (config: { headers: { Authorization?: string } }) => {
      const token = getAuth();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    async (err: any) => await Promise.reject(err)
  );

  // Interceptor de respuesta: redirigir al login si el token expiró
  axios.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response?.status === 401) {
        removeAuth();
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };
