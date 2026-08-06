export default function VerifyEmailSuccess() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
      <p className="text-gray-600">Your email has been verified successfully.</p>
      <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded">
        Login Now
      </a>
    </main>
  );
}