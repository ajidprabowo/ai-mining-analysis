
import React from 'react';
import { DefectEntry } from '../types';
import { DEFECT_CATEGORIES } from '../constants';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DefectTableProps {
  data: DefectEntry[];
}

const DefectTable: React.FC<DefectTableProps> = ({ data }) => {
  const getCategoryLabel = (id: string) => {
    return DEFECT_CATEGORIES.find(c => c.id === id)?.label || id;
  };

  const getShiftLabel = (shift: string) => {
    if (shift === '01') return 'DS (01)';
    if (shift === '02') return 'NS (02)';
    return shift || '-';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Jelas': 
        return {
          badge: 'bg-green-100 text-green-700 border-green-200',
          row: '',
          icon: <CheckCircle2 className="w-3 h-3 mr-1" />
        };
      case 'Kurang Jelas': 
        return {
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          row: 'bg-yellow-50/50',
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        };
      case 'Tidak Jelas': 
        return {
          badge: 'bg-red-100 text-red-700 border-red-200',
          row: 'bg-red-50/50',
          icon: <AlertCircle className="w-3 h-3 mr-1" />
        };
      default: 
        return {
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          row: '',
          icon: null
        };
    }
  };

  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hal</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No Unit</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shift</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Distance</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inspected</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Cek</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((entry, idx) => {
            const styles = getStatusStyles(entry.cek);
            return (
              <tr key={idx} className={`hover:bg-gray-100 transition-colors ${styles.row}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.halaman}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 tracking-tight">{entry.equipment_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                    {entry.id_defect}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">{getCategoryLabel(entry.id_defect)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{entry.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entry.shift === '01' ? 'bg-orange-100 text-orange-700' : entry.shift === '02' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                    {getShiftLabel(entry.shift)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.distance}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{entry.deskripsi_defect}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.inspected_by}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-bold ${styles.badge}`}>
                    {styles.icon}
                    {entry.cek || 'N/A'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DefectTable;
