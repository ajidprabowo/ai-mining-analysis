
import React from 'react';
import { UnitDateEntry } from '../types';

interface UnitDateTableProps {
  data: UnitDateEntry[];
}

const UnitDateTable: React.FC<UnitDateTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hal</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No Unit</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((entry, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.halaman}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 tracking-tight">{entry.equipment_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{entry.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnitDateTable;
