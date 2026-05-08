import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mb-6">
                Eventory V2
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
                The ultimate platform for event vendors to manage bookings, inventory, and more.
            </p>
            <Link
                href="/dashboard"
                className="px-8 py-4 bg-[#0D2531] text-white rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-all active:scale-95"
            >
                Go to Vendor Dashboard
            </Link>
        </div>
    );
}
