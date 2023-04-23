import { render } from 'preact';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import SurveyPage from './pages/survey';
import NotFound from './components/ui/not-found';
import AuthenticationCallback from './pages/authentication/callback';

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

render(
    <div style={{ marginTop: '20px' }}>
      <RouterProvider router={router} />
    </div>,
    document.getElementById('app') as HTMLElement,
);
