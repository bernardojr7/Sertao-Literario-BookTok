export type Role = 'ALUNO' | 'PROFESSOR' | 'COORDENADOR';
export type MetaTipo = 'BIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

export interface Usuario {
  uid: string;
  nomeCompleto: string;
  email: string;
  role: Role;
  booktokHandle?: string;
  fotoPerfilUrl?: string;
  temaAtivoId?: string;
  xp: number;
  cactoscoins: number;
  nivel: number;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface Escola {
  id: string;
  nome: string;
  endereco?: string;
  dataCriacao: Date;
}

export interface Turma {
  id: string;
  escolaId: string;
  nome: string;
  anoLetivo: number;
  dataCriacao: Date;
}

export interface AlunoTurma {
  id: string;
  usuarioId: string;
  turmaId: string;
  nomeCompleto: string;
  ativo: boolean;
  dataVinculo: Date;
}

export interface ProfessorTurma {
  id: string;
  usuarioId: string;
  turmaId: string;
  ativo: boolean;
  dataVinculo: Date;
}

export interface CoordenadorEscola {
  id: string;
  usuarioId: string;
  escolaId: string;
  dataVinculo: Date;
}

export interface MetaLeitura {
  id: string;
  usuarioId: string;
  tipo: MetaTipo;
  quantidadeLivros: number;
  dataDefinicao: Date;
}
