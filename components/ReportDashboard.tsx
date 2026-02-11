import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppState, Articolo, SiglaLotto } from '../types';

interface ReportProps {
  data: AppState;
  articolis: Articolo[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportDashboard: React.FC<ReportProps> = ({ data, articolis }) => {
  // 1. Prepare data for Production by Article
  const prodByArticle = articolis.map(art => {
    const pedaneArt = data.pedane.filter(p => {
        const session = data.sessioni.find(s => s.id === p.sessioneId);
        return session?.articoloId === art.id;
    });
    return {
        name: art.nome.split(' ')[0] + '..', // Short name
        colli: pedaneArt.reduce((acc, curr) => acc + curr.numeroColli, 0),
        kg: pedaneArt.reduce((acc, curr) => acc + curr.pesoTotale, 0),
        pedane: pedaneArt.length
    };
  }).filter(d => d.kg > 0);

  // 2. Prepare Waste by Type
  const wasteByType = Object.values(data.scarti.reduce((acc: any, curr) => {
    if (!acc[curr.tipologia]) acc[curr.tipologia] = { name: curr.tipologia, value: 0 };
    acc[curr.tipologia].value += curr.peso;
    return acc;
  }, {}));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Production Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Produzione (Kg) per Articolo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prodByArticle}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="kg" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Scarti per Tipologia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {wasteByType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articolo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedane</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Colli</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kg Tot</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prodByArticle.map((row, idx) => (
                <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{row.pedane}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{row.colli}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">{row.kg.toLocaleString()}</td>
                </tr>
            ))}
             {prodByArticle.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Nessun dato di produzione registrato</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportDashboard;