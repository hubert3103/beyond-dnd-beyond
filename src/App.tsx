
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import PlayerDashboard from "./pages/PlayerDashboard";
import CharacterCreation from "./pages/CharacterCreation";
import CharacterSheet from "./pages/CharacterSheet";
import UnderConstruction from "./pages/UnderConstruction";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/player" element={<PlayerDashboard />} />
              <Route path="/character-creation" element={<CharacterCreation />} />
              <Route path="/character/:id" element={<CharacterSheet />} />
              <Route path="/dm" element={<UnderConstruction />} />
              <Route path="/under-construction" element={<UnderConstruction />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
