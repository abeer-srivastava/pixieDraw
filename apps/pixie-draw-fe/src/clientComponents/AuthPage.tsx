"use client"

import React, { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import axios from "axios"
import Link from "next/link"
import { Feather } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"




interface AuthPageProps {
  isSignIn: boolean
}

export default function AuthPage({ isSignIn }: AuthPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router=useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if(isSignIn){
      const res = await axios.post("http://localhost:8080/api/v1/signin",formData);

      if (!res.status) {
        console.log("Error occured during signin");
        throw new Error("Error Occured during Signin")

      }
      const data = await res.data.token
      localStorage.setItem("token",data);
      // console.log("✅ Auth success:", data)
      router.replace("/room");
      }
      else{
        const res = await axios.post("http://localhost:8080/api/v1/signup",formData);
        
         if (!res.status) {
          console.log("Error occured during signup");
          throw new Error("Error Occured during Signin");
      }
        router.replace("/signin"); 
      // const data = await res.data.token
      // console.log("✅ Auth success:", data.token)
      }

    } catch (error: unknown) {
    if (error instanceof Error) {
    console.log(error.message);
  } else {
    console.log('An unknown error occurred.');
  }
  } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-neutral-100">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#332351] border border-black shadow-lg">
       <Feather
              size={30}
              className="mr-2 bg-[#a78bfa] text-black border-2 border-black rounded-lg p-1"
        />
        <h1 className="text-4xl font-semibold mb-2">
          {isSignIn ? "Welcome Back To PixieDraw"  : "Create an Account TO PixieDraw"}
        </h1>
 
        <p className="text-sm text-neutral-400 mb-10">
          {isSignIn
            ? "Sign in to continue to your dashboard."
            : "Fill in your details to get started."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <label htmlFor="name" className="text-neutral-400">
              Name
            <Input
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700 text-neutral-100"
            />
        </label>
          )}
          <label className="text-neutral-400">
            Email
          <Input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="bg-neutral-800  border-neutral-700 text-neutral-100"
          />
          </label>
          <label className="text-neutral-400">
            Password
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="bg-neutral-800  border-neutral-700 text-neutral-100"
          />
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white m-2"
            disabled={loading}
          >
            {loading ? "Processing..." : isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-neutral-400 text-center">
          {isSignIn ? (
            <p>
              Don’t have an account?{" "}
              <Link href="/signup" className="text-purple-400 font-medium">
                Sign Up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link href="/signin" className="text-purple-400 font-medium">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
