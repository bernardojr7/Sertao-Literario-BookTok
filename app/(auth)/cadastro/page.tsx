'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  registerStudent,
  registerProfessor,
  registerCoordenador,
} from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Turma, Role } from '@/types';

export default function CadastroPage() {
  const router = useRouter();
  const { usuario, loading } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [turmaId, setTurmaId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [pin, setPin] = useState('');
  const [turmasSel, setTurmasSel] = useState<string[]>([]);
  const [metaBim, setMetaBim] = useState(5);
  const [metaSem, setMetaSem] = useState(15);
  const [metaAnual, setMetaAnual] = useState(30);

  useEffect(() => {
    if (!loading && usuario) router.push('/home');
  }, [usuario, loading, router]);

  useEffect(() => {
    const fetchTurmas = async () => {
      const q = query(collection(db, 'turmas'), orderBy('nome'));
      const snap = await getDocs(q);
      setTurmas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Turma));
    };
    fetchTurmas();
  }, []);

  const toggleTurma = (id: string) =>
    setTurmasSel((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (pin.length !== 6) throw new Error('A senha deve ter 6 dígitos.');
      if (role === 'ALUNO') {
        if (!turmaId || !nome.trim()) throw new Error('Preencha todos os campos.');
        await registerStudent(turmaId, nome.trim(), pin, {
          bimestral: metaBim,
          semestral: metaSem,
          anual: metaAnual,
        });
      } else if (role === 'PROFESSOR') {
        if (!email.trim() || !codigo) throw new Error('Preencha todos os campos.');
        if (turmasSel.length === 0)
          throw new Error('Selecione pelo menos uma turma.');
        await registerProfessor(email.trim(), codigo, turmasSel, pin);
      } else if (role === 'COORDENADOR') {
        if (!email.trim() || !codigo) throw new Error('Preencha todos os campos.');
        await registerCoordenador(
          email.trim(),
          codigo,
          pin,
          turmas[0]?.escolaId || ''
        );
      }
      router.push('/home');
    } catch (err: any) {
      setErro(err.message || 'Erro ao criar conta.');
    } finally {
      setCarregando(false);
    }
  };

  if (!role) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🌵</div>
          <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            Criar Conta
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Qual é o seu perfil?
          </p>
        </div>
        <div className="space-y-3">
          {[
            {
              r: 'ALUNO' as Role,
              icon: '👨‍🎓',
              label: 'Sou Aluno',
              desc: 'Ler, ganhar Cactoscoins e subir de nível',
            },
            {
              r: 'PROFESSOR' as Role,
              icon: '👩‍🏫',
              label: 'Sou Professor',
              desc: 'Gerenciar turmas, biblioteca e aprovar leituras',
            },
            {
              r: 'COORDENADOR' as Role,
              icon: '🔧',
              label: 'Sou Coordenador',
              desc: 'Visão global da escola e relatórios',
            },
          ].map((opt) => (
            <button
              key={opt.r}
              onClick={() => setRole(opt.r)}
              className="w-full p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all text-left flex items-center gap-4"
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {opt.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {opt.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full mt-6 text-sm text-slate-500 hover:text-amber-600"
        >
          ← Voltar para login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">
          {role === 'ALUNO' ? '👨‍🎓' : role === 'PROFESSOR' ? '👩‍🏫' : '🔧'}
        </div>
        <h1 className="text-xl font-bold text-amber-600 dark:text-amber-400">
          {role === 'ALUNO'
            ? 'Conta de Aluno'
            : role === 'PROFESSOR'
            ? 'Conta de Professor'
            : 'Conta de Coordenador'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {role === 'ALUNO' && (
          &lt;>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Sua Turma
              </label>
              <select
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
              >
                <option value="">Selecione sua turma</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.anoLetivo})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Maria Silva Santos"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Meta Bim.', val: metaBim, set: setMetaBim },
                { label: 'Meta Sem.', val: metaSem, set: setMetaSem },
                { label: 'Meta Anual', val: metaAnual, set: setMetaAnual },
              ].map((m) => (
                <div key={m.label}>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {m.label}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={m.val}
                    onChange={(e) => m.set(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none text-center font-bold"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {role === 'PROFESSOR' && (
          &lt;>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="professor@escola.edu"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div>
              <label className
