import { useEffect, useState } from 'react';

/**
 * Estado persistido em localStorage. Suficiente para o protótipo com Mock Data;
 * em producao, a persistencia ficaria a cargo do back-end.
 */
export function usePersistedState<T>(chave: string, inicial: T | (() => T)) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const bruto = window.localStorage.getItem(chave);
      if (bruto !== null) return JSON.parse(bruto) as T;
    } catch {
      // storage indisponivel ou JSON invalido: usa o valor inicial
    }
    return typeof inicial === 'function' ? (inicial as () => T)() : inicial;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // quota cheia ou modo privado: mantem apenas em memoria
    }
  }, [chave, valor]);

  return [valor, setValor] as const;
}
