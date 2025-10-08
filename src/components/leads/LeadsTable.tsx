'use client';

import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Person } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeadsTableProps {
  data: Person[];
}

export default function LeadsTable({ data }: LeadsTableProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = (email: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    timerRef.current = setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom Complet</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Date de Naissance</TableHead>
          <TableHead>Genre</TableHead>
          <TableHead>Comité Local</TableHead>
          <TableHead>Date de Création</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((lead, index) => (
          <TableRow key={index}>
            <TableCell>{lead.full_name}</TableCell>
            <TableCell 
              className="cursor-pointer hover:text-aiesec-blue transition-colors"
              onClick={() => handleCopy(lead.email)}
            >
              {copiedEmail === lead.email ? 'Copié!' : lead.email}
            </TableCell>
            <TableCell>{lead.contact_detail.phone}</TableCell>
            <TableCell>{lead.dob ? format(new Date(lead.dob), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
            <TableCell>{lead.gender}</TableCell>
            <TableCell>{lead.home_lc.name}</TableCell>
            <TableCell>{format(new Date(lead.created_at), 'dd MMM yyyy', { locale: fr })}</TableCell>
            <TableCell>{lead.contacted_at ? 'Contacté' : 'Non Contacté'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
