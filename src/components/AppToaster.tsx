import { ToastContainer } from "react-toastify";
import { useTheme } from "@/theme";

export function AppToaster() {
    const { isDark } = useTheme();

    return (
        <ToastContainer
            position="top-right"
            autoClose={2500}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover
            theme={isDark ? "dark" : "light"}
        />
    );
}
