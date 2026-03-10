import { getDb } from '@/lib/db';
import AdminLinhaEditClient from './AdminLinhaEditClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const db = getDb();
  return db.linhas.map((linha) => ({ id: String(linha.id) }));
}

export default async function AdminLinhaEditPage({ params }: Props) {
  const { id } = await params;
  return <AdminLinhaEditClient id={Number(id)} />;
}
