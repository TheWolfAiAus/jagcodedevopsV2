import React from 'react';

import styles from './Supabase.css';

export interface SupabaseProps {
  prop?: string;
}

export function Supabase({prop = 'default value'}: SupabaseProps) {
  return <div className={styles.Supabase}>Supabase {prop}</div>;
}
