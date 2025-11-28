'use client';

import { useState, useRef, useEffect } from 'react';
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
  onSelectionChange?: (selected: Person[]) => void;
}

export default function LeadsTable({ data, onSelectionChange }: LeadsTableProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!onSelectionChange) return;
    const selected = data.filter((d) => selectedEmails.has(d.email));
    onSelectionChange(selected);
  }, [selectedEmails, data, onSelectionChange]);

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

  const toggleRow = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedEmails.size === data.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(data.map((d) => d.email)));
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <input
              type="checkbox"
              aria-label="Select all"
              checked={selectedEmails.size === data.length && data.length > 0}
              onChange={toggleAll}
            />
          </TableHead>
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
            <TableCell className="w-10">
              <input
                type="checkbox"
                aria-label={`Select ${lead.email}`}
                checked={selectedEmails.has(lead.email)}
                onChange={() => toggleRow(lead.email)}
              />
            </TableCell>
            <TableCell>{lead.full_name}</TableCell>
            <TableCell 
              className="cursor-pointer hover:text-aiesec-blue transition-colors"
              onClick={() => handleCopy(lead.email)}
            >
              {copiedEmail === lead.email ? 'Copié!' : lead.email}
            </TableCell>
            <TableCell>{lead.contact_detail?.phone || 'N/A'}</TableCell>
            <TableCell>{lead.dob ? format(new Date(lead.dob), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
            <TableCell>{lead.gender || 'N/A'}</TableCell>
            <TableCell>{lead.home_lc?.name || 'N/A'}</TableCell>
            <TableCell>{lead.created_at ? format(new Date(lead.created_at), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
            <TableCell>{lead.contacted_at ? 'Contacté' : 'Non Contacté'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
