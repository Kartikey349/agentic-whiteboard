"use client"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { Sparkles } from "lucide-react"

const WelcomeBanner = () => {
    const {user} = useUser()
  return (
    <div>
        <div className="p-10 m-5 border rounded-2xl
        bg-linear-to-r from-gray-200 to-gray-400
        dark:from-gray-800 dark:to-gray-950
        dark:border-gray-700">
            <h2 className="text-2xl font-bold">
                Hello, {user?.fullName}
            </h2>
            <p>
                Bring Your Ideas to life on Infinite canvas
            </p>
            <div className="mt-5 flex items-center gap-2">
                <Button variant={"outline"}><Sparkles/>AI Helper</Button>
            </div>
        </div>
    </div>
  )
}

export default WelcomeBanner