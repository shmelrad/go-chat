import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Link, Navigate } from "react-router-dom";

export default function Home() {
    const token = useAuthStore((state) => state.token)
    if (token) {
        return <Navigate to="/chat" replace />
    }   
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-6xl font-bold">go-chat</h1>
            <p className="text-lg text-gray-500 mt-2">A simple chat application built with Go and React</p>
            <div className="flex gap-2 mt-4">
                <Button asChild>
                    <Link to="/register">Get started</Link>
                </Button>
            </div>
        </div>
    );
}