import Button from '../components/Button';

const NotFoundPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      
      <section className="border-y-2 border-zinc-900 bg-blue-950 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            Error
          </p>

          <h1 className="text-6xl font-bold leading-tight text-yellow-400 sm:text-7xl">
            404
          </h1>

          <p className="mt-4 text-lg leading-7 text-zinc-100">
            Page not found. The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/" variant="primary">
              Back Home
            </Button>
            <Button to="/products">View Products</Button>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-blue-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            Quick Links
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-zinc-100">
            Explore the site
          </h2>

          <div className="mt-6 space-y-4">
            
            <div className="rounded-3xl border-2 border-zinc-900 bg-yellow-400 p-5">
              <h3 className="text-lg font-semibold text-zinc-900">Home</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Return to the homepage and continue browsing products.
              </p>
              <Button to="/" className="mt-3">
                Go Home
              </Button>
            </div>

            <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-300 p-5">
              <h3 className="text-lg font-semibold text-zinc-900">Products</h3>
              <p className="mt-2 text-sm text-zinc-700">
                Browse all featured store items and categories.
              </p>
              <Button to="/products" className="mt-3">
                View Products
              </Button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default NotFoundPage;