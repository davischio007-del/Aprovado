import React, { useState } from "react";
import { 
  Users, UserPlus, Shield, Key, Mail, Check, AlertTriangle, 
  Trash, Eye, EyeOff, Clipboard, RefreshCw, UserCheck, Star 
} from "lucide-react";
import { UserAccount } from "../types";

interface AdminPanelProps {
  users: UserAccount[];
  onAddUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUser: (updated: UserAccount) => void;
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
}

export default function AdminPanel({
  users,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  currentUser,
  onSwitchUser,
}: AdminPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwordPlain, setPasswordPlain] = useState("");
  const [role, setRole] = useState<'admin' | 'external_student' | 'mentor'>("external_student");
  const [status, setStatus] = useState<'active' | 'suspended'>("active");
  
  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Editing state for specific user password
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !passwordPlain.trim()) return;

    onAddUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      passwordPlain: passwordPlain.trim(),
      status,
    });

    // Reset Form
    setName("");
    setEmail("");
    setPasswordPlain("");
    setRole("external_student");
    setStatus("active");
    setShowAddForm(false);
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const textToCopy = `Credenciais de Acesso:\nLink: ${window.location.origin}\nE-mail: ${user.email}\nSenha: ${user.passwordPlain}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSaveNewPassword = (user: UserAccount) => {
    if (!newPassword.trim()) return;
    onUpdateUser({
      ...user,
      passwordPlain: newPassword.trim()
    });
    setEditingUserId(null);
    setNewPassword("");
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordPlain(generated);
  };

  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const externalCount = users.filter(u => u.role === 'external_student').length;

  return (
    <div id="admin-panel-section" className="space-y-6">
      
      {/* 1. ADMIN METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total de Usuários</span>
            <span className="text-xl font-bold text-gray-800">{totalUsers}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Usuários Ativos</span>
            <span className="text-xl font-bold text-gray-800">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Administradores</span>
            <span className="text-xl font-bold text-gray-800">{adminCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Alunos Externos</span>
            <span className="text-xl font-bold text-gray-800">{externalCount}</span>
          </div>
        </div>
      </div>

      {/* 2. ADMIN STATUS WARNING / PROFILE */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-lg">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-800">Sessão Administrativa Ativa</p>
            <p className="text-[11px] text-emerald-600">
              Você está logado como <span className="font-bold">{currentUser.name} ({currentUser.role === 'admin' ? 'Administrador' : 'Usuário'})</span>. Permissões de superusuário concedidas.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-white border border-emerald-100 px-3 py-1.5 rounded-xl">
          Nível de Acesso: Alta Prioridade
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTROLLER */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 md:p-6 shadow-sm space-y-6">
        
        {/* Workspace Title bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Controle de Credenciais & Usuários Externos</h3>
            <p className="text-xs text-gray-400">Cadastre e configure logins, e-mails e senhas de acesso para seus alunos externos ou mentorados.</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Novo Usuário
          </button>
        </div>

        {/* 4. DYNAMIC ADD USER FORM */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Nome Completo do Usuário</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Roberto"
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">E-mail (Login)</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: joao@gmail.com"
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Senha de Acesso Externa</label>
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  value={passwordPlain}
                  onChange={(e) => setPasswordPlain(e.target.value)}
                  placeholder="Ex: SenhaForte123!"
                  className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="px-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl text-[10px] font-bold text-gray-700 transition-colors shrink-0"
                  title="Gerar Senha Aleatória"
                >
                  Gerar
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Perfil de Acesso</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none font-medium text-gray-700"
              >
                <option value="external_student">Estudante Externo (Aluno/Mentorado)</option>
                <option value="mentor">Mentor / Orientador</option>
                <option value="admin">Administrador Geral</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Status Inicial</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none font-medium text-gray-700"
              >
                <option value="active">Ativo / Liberado</option>
                <option value="suspended">Suspenso / Bloqueado</option>
              </select>
            </div>

            <div className="flex items-end pb-1.5 md:col-span-1">
              <span className="text-[10px] text-gray-400 font-medium italic">
                * As credenciais geradas podem ser copiadas na lista abaixo.
              </span>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2.5 pt-2 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Salvar Usuário
              </button>
            </div>
          </form>
        )}

        {/* 5. LIST OF USERS TABLE */}
        <div className="space-y-3.5">
          {users.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-6">Nenhum usuário cadastrado.</p>
          ) : (
            users.map((user) => {
              const isCurrentUser = user.id === currentUser.id;
              const isPasswordVisible = !!showPasswordMap[user.id];

              return (
                <div 
                  key={user.id} 
                  className={`border rounded-2xl p-4 hover:shadow-xs transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isCurrentUser ? "border-emerald-200 bg-emerald-50/10" : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800 text-sm">{user.name}</span>
                      
                      {/* Role Badge */}
                      <span className={`text-[9px] font-bold border rounded-lg px-2 py-0.5 uppercase ${
                        user.role === 'admin' 
                          ? "bg-purple-50 text-purple-700 border-purple-200" 
                          : user.role === 'mentor'
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'mentor' ? 'Mentor' : 'Estudante'}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[9px] font-bold border rounded-lg px-2 py-0.5 uppercase ${
                        user.status === 'active'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {user.status === 'active' ? 'Ativo' : 'Suspenso'}
                      </span>

                      {isCurrentUser && (
                        <span className="text-[9px] font-extrabold bg-gray-900 text-white rounded-lg px-2 py-0.5">
                          VOCÊ
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Key className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        Senha: {isPasswordVisible ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">{user.passwordPlain}</span>
                        ) : (
                          <span className="text-gray-400">••••••••</span>
                        )}
                        
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                          title="Mostrar/Esconder Senha"
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </span>
                    </div>

                    {/* Quick inline Password Editing */}
                    {editingUserId === user.id ? (
                      <div className="mt-2 flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-150 animate-fade-in max-w-sm">
                        <input
                          required
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nova senha externa"
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs outline-none flex-1 font-mono"
                        />
                        <button
                          onClick={() => handleSaveNewPassword(user)}
                          className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => {
                            setEditingUserId(null);
                            setNewPassword("");
                          }}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setNewPassword(user.passwordPlain);
                          }}
                          className="text-[10px] font-bold text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          [ Alterar Senha ]
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-3 self-stretch justify-between md:justify-end border-t md:border-none border-gray-50 pt-3 md:pt-0">
                    
                    {/* Copy details */}
                    <button
                      onClick={() => handleCopyCredentials(user)}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
                      title="Copiar dados para enviar ao aluno"
                    >
                      {copiedId === user.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 animate-scale-up" />
                          <span className="text-emerald-600 text-[10px]">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Copiar Acesso</span>
                        </>
                      )}
                    </button>

                    {/* Simulate Switch session */}
                    {!isCurrentUser && (
                      <button
                        onClick={() => {
                          if (confirm(`Alternar sessão e simular navegação como "${user.name}" (${user.role})?`)) {
                            onSwitchUser(user);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
                        title="Alternar para este usuário"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Simular Usuário
                      </button>
                    )}

                    {/* Toggle Status */}
                    {!isCurrentUser && (
                      <button
                        onClick={() => {
                          onUpdateUser({
                            ...user,
                            status: user.status === 'active' ? 'suspended' : 'active'
                          });
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          user.status === 'active'
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={user.status === 'active' ? "Suspender Usuário" : "Ativar Usuário"}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete button */}
                    {!isCurrentUser && (
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir permanentemente o usuário "${user.name}"?`)) {
                            onDeleteUser(user.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Deletar Usuário"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
