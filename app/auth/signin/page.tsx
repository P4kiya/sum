import { signIn } from "next-auth/react"

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  )
} 