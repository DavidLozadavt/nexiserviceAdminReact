import '@/components/keenicons/assets/duotone/style.css';
import '@/components/keenicons/assets/outline/style.css';
import '@/components/keenicons/assets/filled/style.css';
import '@/components/keenicons/assets/solid/style.css';
import './css/styles.css';

import axios from 'axios';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { setupAxios } from './auth';
import { ProvidersWrapper } from './providers';
import React from 'react';

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ProvidersWrapper>
      <App />
    </ProvidersWrapper>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  // Solo registrar el SW si el archivo existe (evita error de MIME type en desarrollo)
  fetch('/firebase-messaging-sw.js', { method: 'HEAD' })
    .then((response) => {
      if (response.ok && response.headers.get('content-type')?.includes('javascript')) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {
          // Silenciado: SW no disponible en este entorno
        });
      }
    })
    .catch(() => {
      // Silenciado: archivo no disponible
    });
}