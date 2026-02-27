'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Upload,
  Download,
  Eye,
  Shield,
  FileCheck,
  FileClock,
  FileWarning,
  Ship,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { formatDate } from '@/lib/utils';

const mockDocuments = [
  {
    id: '1', name: 'Seguro Marítimo - Mar Azul', category: 'seguro', boatName: 'Mar Azul',
    status: 'valido', expiresAt: '2026-12-31', uploadedAt: '2026-01-15', uploadedBy: 'Gabriel Santos',
    fileSize: '2.4 MB', fileType: 'PDF',
  },
  {
    id: '2', name: 'Habilitação Náutica - Gabriel', category: 'habilitacao', boatName: null,
    status: 'vencendo', expiresAt: '2026-04-15', uploadedAt: '2025-06-01', uploadedBy: 'Gabriel Santos',
    fileSize: '845 KB', fileType: 'PDF',
  },
  {
    id: '3', name: 'Contrato Sociedade - Mar Azul', category: 'contrato', boatName: 'Mar Azul',
    status: 'valido', expiresAt: '2027-06-01', uploadedAt: '2024-06-01', uploadedBy: 'Gabriel Santos',
    fileSize: '1.8 MB', fileType: 'PDF',
  },
  {
    id: '4', name: 'TIEM - Mar Azul', category: 'licenca', boatName: 'Mar Azul',
    status: 'vencido', expiresAt: '2026-01-10', uploadedAt: '2025-01-10', uploadedBy: 'Pedro Oliveira',
    fileSize: '600 KB', fileType: 'PDF',
  },
  {
    id: '5', name: 'Laudo Vistoria 2025 - Veleiro Sol', category: 'vistoria', boatName: 'Veleiro Sol',
    status: 'valido', expiresAt: '2026-08-20', uploadedAt: '2025-08-20', uploadedBy: 'Ana Costa',
    fileSize: '3.1 MB', fileType: 'PDF',
  },
  {
    id: '6', name: 'Seguro Veleiro Sol', category: 'seguro', boatName: 'Veleiro Sol',
    status: 'vencendo', expiresAt: '2026-04-01', uploadedAt: '2025-04-01', uploadedBy: 'Ana Costa',
    fileSize: '2.1 MB', fileType: 'PDF',
  },
];

const categoryConfig: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  seguro: { label: 'Seguro', icon: Shield, color: 'bg-blue-50 text-blue-700' },
  habilitacao: { label: 'Habilitação', icon: FileCheck, color: 'bg-purple-50 text-purple-700' },
  contrato: { label: 'Contrato', icon: FileText, color: 'bg-nautify-50 text-nautify-700' },
  licenca: { label: 'Licença', icon: FileClock, color: 'bg-teal-50 text-teal-700' },
  vistoria: { label: 'Vistoria', icon: FileWarning, color: 'bg-orange-50 text-orange-700' },
  outro: { label: 'Outro', icon: FolderOpen, color: 'bg-gray-100 text-gray-700' },
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  valido: { label: 'Válido', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  vencendo: { label: 'Vencendo', color: 'bg-amber-50 text-amber-700', icon: Clock },
  vencido: { label: 'Vencido', color: 'bg-red-50 text-red-700', icon: AlertTriangle },
};

export default function DocumentosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dragActive, setDragActive] = useState(false);

  const validos = mockDocuments.filter((d) => d.status === 'valido').length;
  const vencendo = mockDocuments.filter((d) => d.status === 'vencendo').length;
  const vencidos = mockDocuments.filter((d) => d.status === 'vencido').length;

  const filtered = mockDocuments.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'todos' && d.category !== categoryFilter) return false;
    if (statusFilter !== 'todos' && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Gerencie documentos de embarcações e sócios</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" /> Enviar Documento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={String(mockDocuments.length)} subtitle="documentos" icon={FileText} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Válidos" value={String(validos)} subtitle="em dia" icon={CheckCircle2} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Vencendo" value={String(vencendo)} subtitle="próx. 30 dias" icon={Clock} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Vencidos" value={String(vencidos)} subtitle="requer ação" icon={AlertTriangle} iconBgColor="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${dragActive ? 'border-nautify-400 bg-nautify-50/50' : 'border-border'}`}
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e: React.DragEvent) => { e.preventDefault(); setDragActive(false); }}
      >
        <CardContent className="py-8 text-center">
          <Upload className={`h-8 w-8 mx-auto mb-3 ${dragActive ? 'text-nautify-600' : 'text-muted-foreground'}`} />
          <p className="text-sm font-medium">Arraste arquivos aqui ou clique para enviar</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — Máximo 10 MB</p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar documento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="todos">Todas categorias</option>
          <option value="seguro">Seguro</option>
          <option value="habilitacao">Habilitação</option>
          <option value="contrato">Contrato</option>
          <option value="licenca">Licença</option>
          <option value="vistoria">Vistoria</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="todos">Todos status</option>
          <option value="valido">Válido</option>
          <option value="vencendo">Vencendo</option>
          <option value="vencido">Vencido</option>
        </Select>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const cat = categoryConfig[doc.category] || categoryConfig.outro;
          const st = statusConfig[doc.status];
          const CatIcon = cat.icon;
          const StIcon = st.icon;

          return (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.color}`}>
                    <StIcon className="h-3 w-3" /> {st.label}
                  </span>
                </div>

                <h3 className="text-sm font-semibold mb-1 line-clamp-2">{doc.name}</h3>
                <Badge variant="outline" className="mb-3">{cat.label}</Badge>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {doc.boatName && (
                    <div className="flex items-center gap-1.5">
                      <Ship className="h-3 w-3" /> {doc.boatName}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Vencimento: {formatDate(doc.expiresAt)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3" /> {doc.fileType} — {doc.fileSize}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-3.5 w-3.5 mr-1" /> Baixar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhum documento encontrado</p>
          <p className="text-sm">Tente ajustar os filtros ou envie um novo documento</p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enviar Documento">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <Input label="Nome do Documento" placeholder="Ex: Seguro Marítimo 2026" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Categoria">
              <option value="seguro">Seguro</option>
              <option value="habilitacao">Habilitação</option>
              <option value="contrato">Contrato</option>
              <option value="licenca">Licença</option>
              <option value="vistoria">Vistoria</option>
              <option value="outro">Outro</option>
            </Select>
            <Select label="Embarcação">
              <option value="">Nenhuma (pessoal)</option>
              <option value="1">Mar Azul</option>
              <option value="2">Veleiro Sol</option>
            </Select>
          </div>
          <Input label="Data de Vencimento" type="date" required />
          <div>
            <label className="block text-sm font-medium mb-1.5">Arquivo</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-nautify-300 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Clique para selecionar ou arraste o arquivo</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — Máximo 10 MB</p>
            </div>
          </div>
          <Input label="Observações" placeholder="Observações opcionais..." />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1"><Upload className="h-4 w-4 mr-2" /> Enviar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
