'use client';

import { useRouter } from 'next/navigation';
import { Home, BookOpen, ShoppingBag, Video, User } from 'lucide-react';

const items = [
  { icon: Home, label: 'Início', path: '/home' },
  { icon: BookOpen, label: 'Biblioteca', path: '/biblioteca' },
  { icon: ShoppingBag, label: 'Loja', path: '/loja' },
  { icon: Video, label: 'BookTok', path: '/booktok' },
  { icon: User, label: 'Perfil', path: '/perfil' },
];

export default function BottomNav({ pathname }: { pathname: string }) {
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50">
      
        {items.map((item) => {
          const active = pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active
                  ? 'text-amber-500'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      


    </nav>
  );
}
