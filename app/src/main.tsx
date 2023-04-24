import { render } from 'preact';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import SurveyPage from './pages/survey';
import NotFound from './components/ui/not-found';
import AuthenticationCallback from './pages/authentication/callback';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';

/**
 * The root component of the app
 * @constructor
 */
function App() {
  const darkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: import.meta.env.VITE_THEME_PRIMARY ?? '#1976d2',
      },
      secondary: {
        main: import.meta.env.VITE_THEME_SECONDARY ?? '#9c27b0',
      },
    },
  });

  const router = createBrowserRouter([
    {
      path: '/s/:id',
      element: <SurveyPage />,
    },
    {
      path: '/callback/:id',
      element: <AuthenticationCallback />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return <div style={{ marginTop: '20px' }}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </div>;
}

render(
    <App />,
    document.getElementById('app') as HTMLElement,
);
