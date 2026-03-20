'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  PieChart,
  TrendingUp,
  Calendar,
  Ship,
  DollarSign,
  Wrench,
  Fuel,
  Users,
  Filter,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { reportService } from '@/services';
import type { ReportData } from '@/types';

const reportTypes = [
  {
    id: 'financeiro',
    title: 'Relatório Financeiro',
    description: 'Resumo completo de receitas, despesas e fluxo de caixa por período.',
    icon: DollarSign,
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'despesas',
    title: 'Análise de Despesas',
    description: 'Detalhamento de despesas por categoria, embarcação e período.',
    icon: PieChart,
    color: 'bg-red-50 text-red-700',
  },
  {
    id: 'combustivel',
    title: 'Consumo de Combustível',
    description: 'Análise de consumo, custos e eficiência por embarcação.',
    icon: Fuel,
    color: 'bg-amber-50 text-amber-700',
  },
  {
    id: 'manutencao',
    title: 'Relatório de Manutenção',
    description: 'Histórico e previsão de manutenções, custos e peças.',
    icon: Wrench,
    color: 'bg-blue-50 text-blue-700',
  },
  {
    id: 'saidas',
    title: 'Registro de Saídas',
    description: 'Histórico de saídas por embarcação, destino e passageiros.',
    icon: Ship,
    color: 'bg-nautify-50 text-nautify-700',
  },
  {
    id: 'socios',
    title: 'Contribuições dos Sócios',
    description: 'Status de pagamentos, adimplência e participação dos sócios.',
    icon: Users,
    color: 'bg-purple-50 text-purple-700',
  },
];

export default function RelatoriosPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: reportHistory, loading, error, refetch } = useApi<ReportData[]>(
    () => reportService.list(),
  );

  const handleGenerate = async (format: string) => {
    if (!selectedType) return;
    setGenerating(true);
    try {
      await reportService.generate({
        type: selectedType as ReportData['type'],
        period: 'personalizado',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });
      refetch();
    } finally {
      setGenerating(false);
      setSelectedType(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !reportHistory) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-muted-foreground">{error || 'Erro ao carregar relatórios'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Gere e exporte relatórios detalhados</p>
        </div>
      </div>

      {/* Report Types */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Selecione o tipo de relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isSelected = selectedType === report.id;
            return (
              <Card
                key={report.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-nautify-500 shadow-md' : ''
                }`}
                onClick={() => setSelectedType(isSelected ? null : report.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${report.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">{report.title}</h3>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Config Panel */}
      {selectedType && (
        <Card className="border-nautify-200 bg-nautify-50/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Configurar Relatório: {reportTypes.find((r) => r.id === selectedType)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Data Início" type="date" defaultValue="2026-01-01" />
              <Input label="Data Fim" type="date" defaultValue="2026-03-31" />
              <Select label="Embarcação">
                <option value="">Todas</option>
                <option value="1">Mar Azul</option>
                <option value="2">Veleiro Sol</option>
              </Select>
              <Select label="Agrupamento">
                <option value="mensal">Mensal</option>
                <option value="semanal">Semanal</option>
                <option value="diario">Diário</option>
              </Select>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => handleGenerate('pdf')} disabled={generating}>
                {generating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <><FileText className="h-4 w-4 mr-2" /> Gerar PDF</>
                )}
              </Button>
              <Button variant="outline" onClick={() => handleGenerate('xlsx')} disabled={generating}>
                <BarChart3 className="h-4 w-4 mr-2" /> Exportar XLSX
              </Button>
              <Button variant="outline" onClick={() => handleGenerate('csv')} disabled={generating}>
                <Download className="h-4 w-4 mr-2" /> Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section (Mock chart) */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-sm font-bold mt-1">Jan - Mar 2026</p>
                </div>
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Receitas</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">{formatCurrency(94500)}</p>
                </div>
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Despesas</p>
                  <p className="text-sm font-bold text-red-600 mt-1">{formatCurrency(62300)}</p>
                </div>
                <div className="p-3 sm:p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className="text-sm font-bold text-nautify-700 mt-1">{formatCurrency(32200)}</p>
                </div>
              </div>

              {/* Mini Chart placeholder */}
              <div className="flex items-end gap-2 h-40 px-4">
                {[65, 48, 72, 55, 80, 62, 90, 45, 78, 60, 85, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t ${i % 2 === 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400" /> Receitas</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400" /> Despesas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relatórios Gerados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Relatório</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Gerado em</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Formato</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Tamanho</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportHistory.map((report) => {
                  const typeInfo = reportTypes.find((r) => r.id === report.type);
                  const TypeIcon = typeInfo?.icon || FileText;
                  return (
                    <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{report.title}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">
                          <TypeIcon className="h-3 w-3 mr-1" /> {typeInfo?.title.split(' ')[0]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{report.generatedAt}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{report.period}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-muted-foreground">-</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
