import { Search, Plus } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useMutation, useQuery } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { DarkModeSwitch } from "./ui/dark-mode-switch"
import { ProfileModal } from "@/pages/ProfileModal"
import { CreateChatModal } from "@/pages/CreateChatModal"
import { Chat } from "@/types/chat"
import { User } from "@/types/user"

export function AppSidebar() {
    const { state, setOpen } = useSidebar()
    const isCollapsed = state === "collapsed"
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState("")
    const navigate = useNavigate()
    const { user } = useAuthStore((state) => state)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isCreateChatOpen, setIsCreateChatOpen] = useState(false)

    const { data: chats, isError, error } = useQuery({
        queryKey: ['user-chats'],
        queryFn: () => usersApi.getChats(),
        initialData: { chats: [] },
        select: (data) => ({
            chats: data.chats.sort((a, b) => {
                const aTime = a.last_message ? new Date(a.last_message.created_at).getTime() : new Date(a.updated_at).getTime()
                const bTime = b.last_message ? new Date(b.last_message.created_at).getTime() : new Date(b.updated_at).getTime()
                return bTime - aTime
            })
        })
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

    const openChat = (id: number, type: 'dm' | 'group', name: string, isChatId: boolean, avatarUrl: string) => {
        navigate(`/chat/${id}?type=${type}&name=${name}&isChatId=${isChatId}&avatarUrl=${avatarUrl}`)
        setQuery("")
    }


    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex pb-0">
                <div className={cn("flex w-full", isCollapsed ? "justify-center" : "flex-col gap-2")}>
                    {!isCollapsed ? (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="font-bold h-fit py-1">
                                        <Avatar>
                                            <AvatarImage src={user?.avatar_url} />
                                            <AvatarFallback>{user?.username[0]}</AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm text-muted-foreground">{user?.username}</p>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => setIsProfileOpen(true)}>
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={(event) => {
                                            event.preventDefault()
                                        }}>
                                        <DarkModeSwitch />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <ProfileModal
                                open={isProfileOpen}
                                onOpenChange={setIsProfileOpen}
                            />
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
                                onClick={() => openChat(chat.id, chat.type, chat.name, false, chat.avatar_url)}
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
                        <div className="flex justify-between items-center pl-4 pt-2">
                            <span className="text-sm font-medium cursor-default">Chats</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Create a new chat"
                                onClick={() => setIsCreateChatOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {isError || !chats?.chats ? (
                                    <div className="p-4 text-sm text-red-500">
                                        Failed to load chats: {error?.toString()}
                                    </div>
                                ) : (chats?.chats.map((chat) => {
                                    if (!user) return null
                                    return (
                                        <ChatSidebarItem 
                                            chat={chat} 
                                            isCollapsed={isCollapsed} 
                                            openChat={openChat} 
                                            user={user} 
                                            key={chat.id} 
                                        />
                                    )
                                }))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <CreateChatModal
                open={isCreateChatOpen}
                onOpenChange={setIsCreateChatOpen}
                openChat={openChat}
            />
        </Sidebar>
    )
}

type SidebarItemProps = {
    chat: Chat,
    isCollapsed: boolean,
    openChat: (id: number, type: 'dm' | 'group', name: string, isChatId: boolean, avatarUrl: string) => void,
    user: User
}

const ChatSidebarItem = ({ chat, isCollapsed, openChat, user }: SidebarItemProps) => {
    const isDm = chat.type === 'dm'
    const recipient = isDm ? chat.members.find(member => member.user.id !== user?.id) : null
    const name = isDm ? recipient?.user.username : chat.name
    const avatarUrl = isDm ? recipient?.user.avatar_url : chat.settings.avatar_url

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <button
                    onClick={() => openChat(
                        chat.id,
                        chat.type,
                        name ?? "",
                        true,
                        avatarUrl ?? ""
                    )}
                    className="flex items-center gap-3 px-2 py-1 h-fit w-full"
                >
                    <Avatar>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>{name?.[0]}</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex flex-1 min-w-0">
                            <div className="w-full overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium truncate">
                                        {name}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                        {formatTime(chat.last_message?.created_at ?? chat.updated_at)}
                                    </span>
                                </div>
                                <div className="w-full overflow-hidden">
                                    <span className="text-sm text-muted-foreground truncate inline-block w-full">
                                        {chat.last_message?.content ?? "No messages yet"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </button>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    } else if (days === 1) {
        return 'Yesterday'
    } else if (days < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
}