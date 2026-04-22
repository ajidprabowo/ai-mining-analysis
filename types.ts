
export interface DefectEntry {
  halaman: string;
  equipment_number: string;
  date: string;
  distance: string;
  shift: string;
  inspected_by: string;
  id_defect: string;
  deskripsi_defect: string;
  cek: 'Jelas' | 'Kurang Jelas' | 'Tidak Jelas';
}

export interface UnitDateEntry {
  halaman: string;
  equipment_number: string;
  date: string;
}

export interface SmuDocShiftEntry {
  halaman: string;
  smu: string;
  doc_num: string;
  shift: string;
}

export interface DefectCategory {
  id: string;
  label: string;
}

export type ExtractionStatus = 'idle' | 'loading' | 'success' | 'error';