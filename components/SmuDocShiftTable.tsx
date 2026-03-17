
import React from 'react';
import { SmuDocShiftEntry } from '../types';

interface SmuDocShiftTableProps {
  data: SmuDocShiftEntry[];
}

const SmuDocShiftTable: React.FC<SmuDocShiftTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  const getShiftLabel = (shift: string) => {
    if (shift === '01') return 'DS (01)';
    if (shift === '02') return 'NS (02)';
    return shift || '-';
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hal</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SMU</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doc Num</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shift</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((entry, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.halaman}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{entry.smu}</td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">{entry.doc_num}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entry.shift === '01' ? 'bg-orange-100 text-orange-700' : entry.shift === '02' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                  {getShiftLabel(entry.shift)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SmuDocShiftTable;
