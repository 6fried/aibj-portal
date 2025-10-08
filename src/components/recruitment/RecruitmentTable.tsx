'use client';

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MemberLead } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RecruitmentTableProps {
  data: MemberLead[];
}

export default function RecruitmentTable({ data }: RecruitmentTableProps) {
    const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [tableData, setTableData] = useState(data);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000); // Reset after 2 seconds
  };

  const formatPhoneNumber = (lead: MemberLead) => {
    if (lead.country_code === '229' && lead.phone && lead.phone.length === 8) {
      return `01${lead.phone}`;
    }
    return lead.phone;
  };
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvCount, setCsvCount] = useState(1000);
  const handleCsvDownload = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', '1');
    params.set('per_page', csvCount.toString());
    window.open(`/apps/recruitment/csv?${params.toString()}`, '_blank');
    setCsvDialogOpen(false);
  };
  return (
    <>
      <div className="flex justify-end mb-2">
        <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Télécharger CSV
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Télécharger les données</DialogHeader>
            <div className="flex flex-col gap-2">
              <label htmlFor="csv-count">Combien de résultats voulez-vous télécharger ?</label>
              <input
                id="csv-count"
                type="number"
                min={1}
                max={10000}
                value={csvCount}
                onChange={e => setCsvCount(Number(e.target.value))}
                className="border rounded px-2 py-1"
              />
              <button
                className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleCsvDownload}
              >
                Télécharger
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Date de Naissance</TableHead>
          <TableHead>Niveau Académique</TableHead>
          <TableHead>Comité Local</TableHead>
          <TableHead>Date de Création</TableHead>
<TableHead>Statut</TableHead>
<TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.map((lead, index) => (
          <TableRow key={index}>
            <TableCell>{lead.id}</TableCell>
<TableCell>{lead.lead_name}</TableCell>
                        <TableCell 
              className="cursor-pointer hover:text-aiesec-blue transition-colors"
              onClick={() => handleCopy(lead.email)}
            >
              {copiedEmail === lead.email ? 'Copied!' : lead.email}
            </TableCell>
            <TableCell>{formatPhoneNumber(lead)}</TableCell>
            <TableCell>{lead.date_of_birth ? format(new Date(lead.date_of_birth), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
            <TableCell>{lead.academic_level.name}</TableCell>
            <TableCell>{lead.home_lc.name}</TableCell>
            <TableCell>{format(new Date(lead.created_at), 'dd MMM yyyy', { locale: fr })}</TableCell>
<TableCell>{lead.status}</TableCell>
<TableCell>
  <button
    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    onClick={async () => {
      setLoadingIds(ids => [...ids, lead.id]);
      try {
        console.log('[DEBUG] Envoi contactMemberLead, lead.id =', lead.id, lead);
        const res = await fetch(`/api/recruitment/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lead.id }),
        });
        const result = await res.json();
        // Suppose the backend returns the new status
        if (result?.data?.contactMemberLead?.id || res.ok) {
          setTableData(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'contacted' } : l));
        }
      } catch (e) {
        alert(`Erreur lors du changement de statut : ${e}`);
      } finally {
        setLoadingIds(ids => ids.filter(id => id !== lead.id));
      }
    }} disabled={lead.status !== 'applied' || loadingIds.includes(lead.id)}
  >
    {lead.status !== 'applied' ? 'Non éligible' : loadingIds.includes(lead.id) ? '...' : 'Contacter'}
  </button>
</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </>
  );
}
