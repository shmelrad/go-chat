import { useTheme } from "@/components/ThemeProvider"
import { Switch } from "./switch"

export function DarkModeSwitch() {
    const { setTheme, theme } = useTheme()

    return (
        <div className="flex justify-between"
            onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark")
            }}
        >
            <p className="mr-8">Dark mode</p>
            <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light")
                }}
            />
        </div>
    )
}
