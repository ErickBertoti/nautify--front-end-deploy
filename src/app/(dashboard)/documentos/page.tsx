'use client';

import React, { useState } from 'react';
import {
  FileText,
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
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { useApi } from '@/hooks/useApi';
import { useCanWrite } from '@/hooks/useCanWrite';
import { useBoats } from '@/hooks/useEntityOptions';
import { documentService } from '@/services';
import { uploadFile } from '@/lib/storage';
import type { Document as NautifyDocument } from '@/types';

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
  const [boatFilter, setBoatFilter] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const canWrite = useCanWrite();
  const { boats } = useBoats();

  const { data: documents, loading, error, refetch } = useApi<NautifyDocument[]>(
    () => documentService.list({ boatId: boatFilter || undefined }),
    [boatFilter],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !documents) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-muted-foreground">{error || 'Erro ao carregar documentos'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  const validos = documents.filter((d) => d.status === 'valido').length;
  const vencendo = documents.filter((d) => d.status === 'vencendo').length;
  const vencidos = documents.filter((d) => d.status === 'vencido').length;

  const filtered = documents.filter((d) => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
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
        {canWrite && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Enviar Documento
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={String(documents.length)} subtitle="documentos" icon={FileText} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Válidos" value={String(validos)} subtitle="em dia" icon={CheckCircle2} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Vencendo" value={String(vencendo)} subtitle="próx. 30 dias" icon={Clock} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Vencidos" value={String(vencidos)} subtitle="requer ação" icon={AlertTriangle} iconBgColor="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* Upload Area */}
      {canWrite && <Card
        className={`border-2 border-dashed transition-colors ${dragActive ? 'border-nautify-400 bg-nautify-50/50' : 'border-border'}`}
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={async (e: React.DragEvent) => {
          e.preventDefault();
          setDragActive(false);
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            try {
              setUploading(true);
              const file = files[0];
              const { url } = await uploadFile('documents', file);
              await documentService.create({
                title: file.name.replace(/\.[^/.]+$/, ''),
                category: 'outro',
                fileUrl: url,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
              });
              refetch();
              toast.success('Documento enviado com sucesso!');
            } catch (err) {
              toast.error(getErrorMessage(err, 'Erro ao enviar documento.'));
            } finally {
              setUploading(false);
            }
          }
        }}
      >
        <CardContent className="py-8 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-nautify-600" />
              <p className="text-sm font-medium">Enviando arquivo...</p>
            </>
          ) : (
            <>
              <Upload className={`h-8 w-8 mx-auto mb-3 ${dragActive ? 'text-nautify-600' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium">Arraste arquivos aqui ou clique para enviar</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — Máximo 10 MB</p>
            </>
          )}
        </CardContent>
      </Card>}

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
        <Select value={boatFilter} onChange={(e) => setBoatFilter(e.target.value)}>
          <option value="">Todas embarcações</option>
          {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
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
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.color}`}>
                      <StIcon className="h-3 w-3" /> {st.label}
                    </span>
                    {doc.expirationDate && doc.status === 'vencendo' && (
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        {differenceInDays(parseISO(doc.expirationDate), new Date())} dias restantes
                      </p>
                    )}
                    {doc.expirationDate && doc.status === 'vencido' && (
                      <p className="text-[10px] text-red-600 mt-0.5">
                        Vencido há {Math.abs(differenceInDays(parseISO(doc.expirationDate), new Date()))} dias
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-semibold mb-1 line-clamp-2">{doc.title}</h3>
                <Badge variant="outline" className="mb-3">{cat.label}</Badge>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {doc.boatName && (
                    <div className="flex items-center gap-1.5">
                      <Ship className="h-3 w-3" /> {doc.boatName}
                    </div>
                  )}
                  {doc.expirationDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Vencimento: {formatDate(doc.expirationDate)}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3" /> {doc.fileName} — {(doc.fileSize / 1024).toFixed(0)} KB
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = doc.fileUrl;
                      a.download = doc.fileName;
                      a.target = '_blank';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Baixar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState 
          icon={FolderOpen} 
          title="Nenhum documento encontrado" 
          description="Tente ajustar os filtros ou envie um novo documento" 
        />
      )}

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enviar Documento">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (!selectedFile) return;
          try {
            setUploading(true);
            const form = e.currentTarget;
            const formData = new FormData(form);
            const { url } = await uploadFile('documents', selectedFile);
            await documentService.create({
              title: formData.get('title') as string,
              description: formData.get('description') as string || undefined,
              category: formData.get('category') as string,
              boatId: (formData.get('boatId') as string) || undefined,
              fileUrl: url,
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
              mimeType: selectedFile.type,
              expirationDate: formData.get('expirationDate') as string || undefined,
            });
            refetch();
            setSelectedFile(null);
            setIsModalOpen(false);
            toast.success('Documento enviado com sucesso!');
          } catch (err) {
            toast.error(getErrorMessage(err, 'Erro ao enviar documento.'));
          } finally {
            setUploading(false);
          }
        }}>
          <Input name="title" label="Nome do Documento" placeholder="Ex: Seguro Marítimo 2026" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="category" label="Categoria">
              <option value="seguro">Seguro</option>
              <option value="habilitacao">Habilitação</option>
              <option value="contrato">Contrato</option>
              <option value="licenca">Licença</option>
              <option value="vistoria">Vistoria</option>
              <option value="outro">Outro</option>
            </Select>
            <Select name="boatId" label="Embarcação">
              <option value="">Nenhuma (pessoal)</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          <Input name="expirationDate" label="Data de Vencimento" type="date" required />
          <div>
            <label className="block text-sm font-medium mb-1.5">Arquivo</label>
            <input
              type="file"
              name="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="doc-file-input"
              required
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
              }}
            />
            <label htmlFor="doc-file-input" className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-nautify-300 transition-colors cursor-pointer block">
              {selectedFile ? (
                <>
                  <FileText className="h-6 w-6 mx-auto mb-2 text-nautify-600" />
                  <p className="text-sm font-medium text-nautify-700">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024).toFixed(0)} KB — Clique para trocar</p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para selecionar ou arraste o arquivo</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — Máximo 10 MB</p>
                </>
              )}
            </label>
          </div>
          <Input name="description" label="Observações" placeholder="Observações opcionais..." />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setSelectedFile(null); setIsModalOpen(false); }}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={uploading || !selectedFile}>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
