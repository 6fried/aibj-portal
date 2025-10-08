export interface Office {
  id: number;
  name: string;
  type: 'MC' | 'LC';
  parent_id: number | null;
}
