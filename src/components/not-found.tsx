import { FC } from 'react';
import Link from 'next/link';

const NotFound: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <div className="rounded-lg bg-red-100 px-2 text-sm text-red-800">
        Page Not Found
      </div>
      <Link href="/" className='text-primary hover:underline mt-4'>
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;