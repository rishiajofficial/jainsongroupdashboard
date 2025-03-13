
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/pages/DashboardPage';

interface QueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

export function useTrainingProgress(userId: string): QueryResult<any> {
  const [result, setResult] = useState<QueryResult<any>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('training_video_progress')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        
        setResult({
          data,
          loading: false,
          error: null
        });
      } catch (error) {
        setResult({
          data: null,
          loading: false,
          error: error as Error
        });
      }
    };

    fetchData();
  }, [userId]);

  return result;
}

export function useQuizResults(userId: string): QueryResult<any> {
  const [result, setResult] = useState<QueryResult<any>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('training_quiz_results')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        
        setResult({
          data,
          loading: false,
          error: null
        });
      } catch (error) {
        setResult({
          data: null,
          loading: false,
          error: error as Error
        });
      }
    };

    fetchData();
  }, [userId]);

  return result;
}

export function useCandidateAssessments(candidateId: string): QueryResult<any> {
  const [result, setResult] = useState<QueryResult<any>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('candidate_assessments')
          .select('*, assessments:assessment_id(*)')
          .eq('candidate_id', candidateId);

        if (error) throw error;
        
        setResult({
          data,
          loading: false,
          error: null
        });
      } catch (error) {
        setResult({
          data: null,
          loading: false,
          error: error as Error
        });
      }
    };

    fetchData();
  }, [candidateId]);

  return result;
}

export function useSalespersonManagers(salespersonId: string): QueryResult<any> {
  const [result, setResult] = useState<QueryResult<any>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('salesperson_managers')
          .select('*, profiles:manager_id(full_name, email, avatar_url)')
          .eq('salesperson_id', salespersonId);

        if (error) throw error;
        
        setResult({
          data,
          loading: false,
          error: null
        });
      } catch (error) {
        setResult({
          data: null,
          loading: false,
          error: error as Error
        });
      }
    };

    fetchData();
  }, [salespersonId]);

  return result;
}

export function useUsersByRole(role: UserRole): QueryResult<any> {
  const [result, setResult] = useState<QueryResult<any>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', role);

        if (error) throw error;
        
        setResult({
          data,
          loading: false,
          error: null
        });
      } catch (error) {
        setResult({
          data: null,
          loading: false,
          error: error as Error
        });
      }
    };

    fetchData();
  }, [role]);

  return result;
}
