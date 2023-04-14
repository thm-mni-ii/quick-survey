import { render } from 'preact';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import SurveyPage from './pages/survey';
import { NotFound } from './components/ui/not-found';

const router = createBrowserRouter([
  {
    path: '/s/:id',
    element: <SurveyPage />,
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
