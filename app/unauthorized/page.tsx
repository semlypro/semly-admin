import { SignOutButton } from '@clerk/nextjs';
import { ShieldX } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access the admin panel. Please contact an administrator if you believe this is a mistake.
        </p>
        <div className="space-y-3">
          <SignOutButton>
            <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded">
              Sign Out
            </button>
          </SignOutButton>
          <Link href="https://semlypro.com" className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded">
            Go to Main App
          </Link>
        </div>
      </div>
    </div>
  );
}
