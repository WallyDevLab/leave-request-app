import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to dashboard from home page
  redirect("/dashboard")
}

