import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" - evita refetches innecesarios
      staleTime: 1000 * 60 * 5, // 5 minutos por defecto

      // Tiempo que los datos se mantienen en caché después de no ser usados
      gcTime: 1000 * 60 * 30, // 30 minutos (antes era cacheTime)

      // Evitar refetch automático en estas situaciones para prevenir loops
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Solo reconectar es útil

      // Configuración de retry más conservadora
      retry: (failureCount, error) => {
        // No retry en errores de autenticación
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 401 || status === 403) {
            return false;
          }
        }

        // Solo 2 intentos para otros errores
        return failureCount < 2;
      },

      // Delay progresivo para retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Tiempo de retry para mutaciones
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Función helper para limpiar caché específico de auth
export const clearAuthCache = () => {
  queryClient.removeQueries({ queryKey: ['session'] });
  queryClient.removeQueries({ queryKey: ['user'] });
  queryClient.removeQueries({ queryKey: ['profile'] });
};

// Función helper para invalidar datos relacionados con auth
export const invalidateAuthQueries = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['session'] }),
    queryClient.invalidateQueries({ queryKey: ['user'] }),
    queryClient.invalidateQueries({ queryKey: ['profile'] }),
  ]);
};