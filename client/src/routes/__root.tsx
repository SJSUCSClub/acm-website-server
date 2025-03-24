import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import '../globals.css';
import Footer from '../components/atoms/footer';
import Navbar from '../components/organisms/navbar';
import Faq from '../components/organisms/faq';
import 'acm-cs-sjsu-hero-component/dist/styles.css';

const queryClient = new QueryClient();

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page not found</p>
      <p className="mt-2 text-gray-500 dark:text-gray-500">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6">
        <a
          href="/"
          className="inline-block px-5 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Go back home
        </a>
      </div>
    </div>
  </div>
);

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div>
        <Navbar />
        <Outlet />
        <div className="flex">
          <Faq />
        </div>
        <Footer />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </QueryClientProvider>
  ),
  notFoundComponent: () => <NotFoundPage />
});
