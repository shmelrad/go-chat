import { Route, Routes, BrowserRouter } from "react-router-dom"
import Home from "@/pages/Home"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ChatPage from "@/pages/Chat/Chat"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import AuthRoute from "@/components/AuthRoute"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ThemeProvider } from "./components/ThemeProvider"

function App() {
  const queryClient = new QueryClient()

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/chat"
                element={
                  <AuthRoute>
                    <ChatPage />
                  </AuthRoute>
                }
              />
              <Route path="/chat/:chatId" element={<AuthRoute><ChatPage /></AuthRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
