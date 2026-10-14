import { Outlet, Link } from 'react-router-dom';
import nu_bulldogex_banner from '../assets/img/nu_bulldogex_banner.jpg';

const AuthLayout = () => {
  return (
    <section className="min-h-screen bg-yellow-400 text-zinc-900">
      <div className="grid min-h-screen w-full lg:grid-cols-[1fr_0.95fr]">
        <div className="flex items-center justify-center border-b-2 border-zinc-300 bg-yellow-400 p-8 sm:p-10 lg:border-b-0 lg:border-r-2 lg:border-zinc-300 lg:p-16">
          <img
            src={nu_bulldogex_banner}
            alt="NU Bulldog Exchange Banner"
            className="w-full max-w-md rounded-4xl object-contain"
          />
        </div>

        <main className="flex items-center bg-blue-900 px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Outlet />
          </div>
        </main>
      </div>
    </section>
  );
};

export default AuthLayout;
