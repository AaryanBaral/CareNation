import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/Components/ui/toaster";
import { Toaster as Sonner } from "@/Components/ui/sonner";
import { TooltipProvider } from "@/Components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./Components/Context/AuthContext";
import { AuthRoutes } from "./Components/auth/AuthRoute";
import { DarkModeProvider } from "./Components/Context/DarkModeContext";
const queryClient = new QueryClient();
function App() {
  // localStorage.clear();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster  />
      <Sonner richColors position="top-center" />
      <DarkModeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AuthRoutes />
          </BrowserRouter>
        </AuthProvider>
      </DarkModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
