import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ReactNode } from "react"


export default function ChatLayout({ children, header }: { children: ReactNode, header?: ReactNode }) {
  return (
    <div className="h-screen flex">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {header}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}