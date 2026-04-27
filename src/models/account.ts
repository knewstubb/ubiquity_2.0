export interface Account {
  id: string;
  name: string;
  parentId: string | null;
  childIds: string[];
  region: string;
  status: 'active' | 'inactive';
}
