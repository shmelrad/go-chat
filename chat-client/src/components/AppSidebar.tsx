import { Search } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils"
import { useRef, useState } from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { useMutation, useQuery } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"

export function AppSidebar() {
    const { state, setOpen } = useSidebar()
    const isCollapsed = state === "collapsed"
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState("")
    const navigate = useNavigate()
    const { user } = useAuthStore((state) => state)

    const { data: chats, isError, error } = useQuery({
        queryKey: ['user-chats'],
        queryFn: () => usersApi.getChats(),
        initialData: { chats: [] }
    })

    const searchMutation = useMutation({
        mutationFn: (query: string) => usersApi.searchUsers({ q: query, offset: 0 }),
    })

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
        if (value.length >= 2) {
            searchMutation.mutate(value)
        }
    }

    const handleSearchClick = () => {
        if (isCollapsed) {
            setOpen(true)
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 0)
        }
    }

    const openChat = (id: number, type: 'dm' | 'group', name: string) => {
        navigate(`/chat/${id}?type=${type}&name=${name}`)
        setQuery("")
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex items-center">
                <div className={cn("flex w-full", isCollapsed ? "justify-center" : "flex-col gap-2")}>
                    {!isCollapsed ? (
                        <>
                            <p className="text-sm text-muted-foreground">Logged in as <span className="font-bold">{user?.username}</span></p>
                            <Input
                                ref={searchInputRef}
                                placeholder="Search users..."
                                value={query}
                                onChange={handleSearch}
                            />
                        </>
                    ) : (
                        <button
                            className="p-2 text-muted-foreground hover:text-primary"
                            onClick={handleSearchClick}
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                {query.length >= 2 && searchMutation.data?.users && (
                    <div className="p-2 space-y-2">
                        {searchMutation.data.users.map(chat => (
                            <div
                                key={chat.id}
                                className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer"
                                onClick={() => openChat(chat.id, chat.type, chat.name)}
                            >
                                <Avatar>
                                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{chat.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!query && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {isError || !chats?.chats ? (
                                    <div className="p-4 text-sm text-red-500">
                                        Failed to load chats: {error?.toString()}
                                    </div>
                                ) : (chats?.chats.map((chat) => {
                                    const recipient = chat.members.find(member => member.id !== user?.id)
                                    return (
                                        <SidebarMenuItem key={chat.id}>
                                            <SidebarMenuButton asChild>
                                                <button
                                                    onClick={() => openChat(chat.id, chat.type, recipient?.username ?? chat.name)}
                                                    className="flex items-center gap-3 p-2"
                                                >
                                                    {(() => {
                                                        console.log(chat)
                                                        return (
                                                            <>
                                                                <Avatar>
                                                                    <AvatarFallback>{recipient?.username[0]}</AvatarFallback>
                                                                </Avatar>
                                                                {!isCollapsed && (
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="font-medium truncate">
                                                                            {recipient?.username}
                                                                        </span>
                                                                        <span className="text-sm text-muted-foreground truncate">
                                                                            {chat.last_message?.content ?? "No messages yet"}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )
                                                    })()}
                                                </button>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                }))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
        </Sidebar>
    )
}
