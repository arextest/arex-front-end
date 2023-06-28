import 'allotment/dist/style.css';
import 'antd/dist/reset.css';
import '@arextest/arex-core/dist/style.css';
import './style/style.css';
import 'dayjs/locale/zh-cn';
import './helpers/adapter';
import './assets/css/index.css';

import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
if (import.meta.env.MODE !== 'development') {
  Sentry.init({
    dsn: 'https://93269396efbd4d9eb84c60aabe220cb5@o4505063820034048.ingest.sentry.io/4505418776510464',
    integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
