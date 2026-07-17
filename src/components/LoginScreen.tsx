import React, { useState } from "react";
import { Trophy, Mail, Lock, Eye, EyeOff, Sparkles, LogIn, ShieldAlert } from "lucide-react";
import { UserAccount } from "../types";

interface LoginScreenProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginScreen({ users, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const matchedUser = users.find(u => u.email === trimmedEmail);

    if (!matchedUser) {
      setError("Usuário não encontrado. Verifique o e-mail digitado.");
      return;
    }

    if (matchedUser.status === "suspended") {
      setError("Este usuário está suspenso. Contate o administrador.");
      return;
    }

    if (matchedUser.passwordPlain !== password) {
      setError("Senha incorreta. Tente novamente.");
      return;
    }

    // Success!
    onLoginSuccess(matchedUser);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-emerald-100">
      
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo and Brand */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-600/10 flex items-center justify-center animate-bounce-slow">
            <Trophy className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Aprovado</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Planejador de Estudos Inteligente</p>
          </div>
        </div>

        {/* Card Panel */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
              <LogIn className="w-5 h-5 text-emerald-600" />
              Acessar sua Conta
            </h2>
            <p className="text-xs text-gray-400">
              Insira seus dados para acessar seus cronogramas, edital e revisões personalizadas.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-shake">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full bg-gray-50/50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-xs outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Senha Secreta</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full bg-gray-50/50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl pl-11 pr-11 py-2.5 text-xs outline-none transition-all font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              Entrar na Plataforma
            </button>
          </form>

          {/* Test Credentials Assistant */}
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-2.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              Credenciais de Teste Rápidas
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium text-gray-600">
              <button
                type="button"
                onClick={() => {
                  setEmail("davi.schio007@gmail.com");
                  setPassword("admin123");
                  setError(null);
                }}
                className="bg-white border border-gray-200 hover:border-purple-300 p-2 rounded-xl text-left transition-all active:scale-95 space-y-0.5"
              >
                <span className="font-bold text-purple-700 text-[10px] uppercase block">Administrador</span>
                <span className="block text-gray-500 truncate">davi.schio007@gmail.com</span>
                <span className="font-mono text-gray-400 block text-[10px]">Senha: admin123</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("joao.estudante@gmail.com");
                  setPassword("aluno2026");
                  setError(null);
                }}
                className="bg-white border border-gray-200 hover:border-blue-300 p-2 rounded-xl text-left transition-all active:scale-95 space-y-0.5"
              >
                <span className="font-bold text-blue-700 text-[10px] uppercase block">Aluno Externo</span>
                <span className="block text-gray-500 truncate">joao.estudante@gmail.com</span>
                <span className="font-mono text-gray-400 block text-[10px]">Senha: aluno2026</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer copyright */}
        <p className="text-center text-[10px] text-gray-400 font-medium">
          Aprovado App • Sistema de Acesso Seguro.
        </p>
      </div>

    </div>
  );
}
