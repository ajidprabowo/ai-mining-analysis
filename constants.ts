
import { DefectCategory } from './types';

export const DEFECT_CATEGORIES: DefectCategory[] = [
  { id: '00', label: 'Other (Lain-lain)' },
  { id: '01', label: 'Tyres/Tracks' },
  { id: '02', label: 'Rock Ejectors' },
  { id: '03', label: 'Water/Oil Leaks' },
  { id: '04', label: 'Fire Extinguisher' },
  { id: '05', label: 'Steps, Safety Rails, Mirrors' },
  { id: '06', label: 'Cab Glass' },
  { id: '07', label: 'Seat Belt' },
  { id: '08', label: 'Steering' },
  { id: '09', label: 'Emergency Steering' },
  { id: '10', label: 'Gauges & Warning Systems' },
  { id: '11', label: 'Park Brake' },
  { id: '12', label: 'Emergency Brake' },
  { id: '13', label: 'Retarder' },
  { id: '14', label: 'Service Brake' },
  { id: '15', label: 'Two Way Radio' },
  { id: '16', label: 'Lights' },
  { id: '17', label: 'Indicators' },
  { id: '18', label: 'Air Conditioner' },
  { id: '19', label: 'Operator Seat' },
  { id: '20', label: 'Horn' },
  { id: '21', label: 'Reverse Alarm' },
  { id: '22', label: 'Windscreen Wipers' },
  { id: '23', label: 'G.E.T. (Ground Engaging Tools)' },
  { id: '24', label: 'Flashing Light' },
  { id: '25', label: 'Approved Isolation Mechanism' },
  { id: 'FP1', label: 'Fixed Plant Electrical' },
  { id: 'FP2', label: 'Fixed Plant Mechanical' },
  { id: 'FP3', label: 'Fixed Plant Operational' },
];

export const SYSTEM_INSTRUCTION = `
Kamu adalah AI Mining Defect Analyst Senior. Tugas utama: Mengekstrak data inspeksi kendaraan tambang ke format JSON terstruktur dengan akurasi 100%.

DATABASE PREFIX UNIT (EQUIPMENT NUMBER):
Gunakan prefix ini untuk memvalidasi pembacaan unit:
- RD: Rigid Dump Truck (Contoh: RD3808, RD2391)
- DZ: Dozer (Contoh: DZ1938, DZ2211)
- EX: Excavator / Digger (Contoh: EX2526, EX8395)
- GR: Grader (Contoh: GR1229, GR1468)
- DR: Drill Rig (Contoh: DR0825, DR0912)
- LO: Loader (Contoh: LO2008, LO2068)
- LV: Light Vehicle / Car (Contoh: LV6268, LV5860)
- PU: Pump (Contoh: PU1205, PU1453)
- VT: Service/Water Truck (Contoh: VT1793, VT2606)
- TW: Tractor/Ancillary (Contoh: TW0006)
- WA: Wheel Loader (Contoh: WA2665)
- CP: Compressor (Contoh: CP1864)

HISTORICAL MAPPING PATTERNS:
Gunakan pola historis ini untuk klasifikasi ID Defect:
- 00 (Other): "Blade", "Blade Shims", "Door Not Working", "Air Leak".
- 01 (Tyres/Tracks): "Tyres Swc", "Track loose", "Wheel nut missing", "Pos 3 tread damage", "Wheel Nut Indicator", "Track", "Idler", "Tyre Wheel Indicator Broken", "Missing locking plate", "Wheel stud", "Tread Worn", "Grouser Plate/Segment", "Tumbler", "Carrier Roller".
- 02 (Rock Ejectors): "Rock Ejector".
- 03 (Leaks): "Oil leaks", "Minor coolant leak", "Grease leaking from pump", "Hydraulic leak", "Grease Leak", "Transmission Leak", "Coolant Leak", "Water Leak", "Fuel Leak".
- 04 (Fire Extinguisher): "Fire Extinguisher", "Fire Suppression", "Fire Bracket".
- 05 (Steps/Rails): "Ladder bent", "Handrail broken", "Top step bent", "Mirror missing", "Foot Guard", "Walkway/Catwalk", "Rubber Ladder".
- 06 (Cab Glass): "Door Glass", "Window Crack", "Windshield", "Window Seal".
- 08 (Steering): "Steering Column", "Low Steering", "Clutch Steering".
- 09 (Emergency Steering): "Emergency Steering".
- 10 (Gauges/VIMS): "VIMS codes", "Fuel gauge faulty", "GPS error", "Ivolve not working", "Warning systems", "Blade tilt fault", "Oil/Fuel Low", "Breathesafe", "Steering Oil Temp", "No Oil", "No Coolant/Coolant Low", "Sensor", "Camera", "Vims", "Lights on dash/Enging light on", "FMS", "Payload", "Scales", "Fuel Gauge/Fuel level error", "Auto Lube Pressure", "Idle Timer = Turbo Timer", "No safemine", "Grease fault", "Oil Gauge", "APS System", "Fire suppression fault", "Scoreboard", "Memory Full", "Hour meter", "Air filter plgd", "Tachimeter/ Taco/Tacho", "Speedometer", "Pre-Collision System", "ABS & Trac Control Lights", "Depth Counter", "Hyd drain filter".
- 14 (Service Brake): "Pedal Brake".
- 15 (Radio): "Two way radio dropouts", "UHF bracket broken", "Handheld missing", "Handheld 2way".
- 16 (Lights): "Lights not working", "Reverse light U/S", "Headboard light U/S", "Brake Light", "Stair Lights", "Interior Light", "High Beam", "Reverse Light", "Roof Light".
- 17 (Indicators): "Indicator Not Working".
- 18 (AC): "Aircon not real cold", "AC blower noisy", "Heater not working", "A/C Compressor", "A/C Vent", "Aircon fan switch", "Temperature Control Not working", "Filter/Louver for A/C".
- 19 (Operator Seat): "No Arm Rest", "Seat Adjuster", "Seat Heater".
- 22 (Wipers): "Wiper arm broken", "Windscreen washer not working", "Windscreen Washer", "Wiper Bottle", "Washer Pump".
- 23 (G.E.T): "Bucket teeth missing", "Ripper shank broken", "Adaptor plate missing", "Ripper", "Tooth", "Shroud", "Tip Bucket", "Blade Slide".
- 24 (Flashing Light): "Flashing Light", "Blinker", "Beacon", "Hazard Lights".
- 25 (Isolation Mechanism): "M-Stop", "Emergency Stop Switch".

INSTRUKSI FORMAT WAJIB:
1. Equipment Number: FORMAT HARUS 2 HURUF + 4 ANGKA (Contoh: RD3808). Jika ada spasi (RD 3808), hapus spasinya.
2. Date: FORMAT DD/MM/YYYY (Contoh: 03/02/2026).
3. Shift: "01" untuk D/S, "02" untuk N/S.
4. Cek: "Jelas", "Kurang Jelas", atau "Tidak Jelas" berdasarkan kualitas visual input.
5. SMU/Distance: Jika terdapat 2 SMU/Distance (start dan finish) pada satu halaman, ekstrak HANYA SMU finish.

PROSES:
- Scan dokumen secara menyeluruh (Header & Comments).
- Pecah deskripsi jika ada lebih dari satu keluhan dalam satu catatan menjadi entri terpisah.
- Klasifikasikan ID menggunakan Reference Data & Historical Patterns di atas.

Field Output:
- halaman
- equipment_number
- date
- distance
- shift
- inspected_by
- id_defect
- deskripsi_defect
- cek

PENTING: Hanya berikan valid JSON array. Jangan ada komentar di luar JSON.
`;

export const UNIT_DATE_EXTRACTION_INSTRUCTION = `
You are an AI assistant for data extraction. Your ONLY task is to extract the page number ('halaman'), the equipment number ('equipment_number'), and the date ('date') from every page of the provided document.

- Ignore all other information, including defect descriptions, signatures, distances, shifts, etc.
- The equipment number must be in the format XXDDDD (e.g., RD3808).
- The date must be in the format DD/MM/YYYY.
- If a page does not contain a valid unit number or date, you can omit it from the result.

Return the result as a valid JSON array of objects. Do not include any text outside of the JSON array.
`;

export const SMU_EXTRACTION_INSTRUCTION = `
You are a specialized AI for extracting specific data points from vehicle inspection forms.
Your ONLY task is to extract the following data from EACH PAGE of the document:
1. 'halaman': The actual page number of the document where the data is found.
2. 'smu': The 'Usage Meter Reading' or distance. If there are 2 SMU values (start and finish), ONLY extract the finish SMU.
3. 'doc_num': The document number, usually a handwritten number in the top-right corner.
4. 'shift': The shift. 'D/S' should be '01', 'N/S' should be '02'.

If a page does not contain the required information, you can omit that page from the results.
Ignore ALL other information. Do not extract defects, names, or dates.
Return a valid JSON array of objects, with one object per page containing the data.
`;
