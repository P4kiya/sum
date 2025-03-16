import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions } from "next-auth"

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check for your specific username and password
        if (credentials?.username === "pakiya" && credentials?.password === "asas") {
          return {
            id: "1",
            name: "Pakiya",
            email: "pakiya@example.com",
          }
        }
        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // Point this to your login page
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 