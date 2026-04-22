
import React, { useState, useRef } from 'react';
import { extractDefectsFromDocument, extractUnitAndDateFromDocument, extractSmuDocShiftFromDocument } from './services/geminiService';
import { DefectEntry, UnitDateEntry, SmuDocShiftEntry, ExtractionStatus } from './types';
import DefectTable from './components/DefectTable';
import UnitDateTable from './components/UnitDateTable';
import SmuDocShiftTable from './components/SmuDocShiftTable';
import Button from './components/Button';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [defectData, setDefectData] = useState<DefectEntry[]>([]);
  const [unitDateData, setUnitDateData] = useState<UnitDateEntry[]>([]);
  const [smuData, setSmuData] = useState<SmuDocShiftEntry[]>([]);
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<'defects' | 'unit_date' | 'smu' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
        resetData();
      };
      reader.readAsDataURL(file);
    }
  };

  const processDefects = async () => {
    if (!fileData || !mimeType) return;
    resetData();
    setStatus('loading');
    setLoadingType('defects');
    setError(null);

    try {
      const extractedData = await extractDefectsFromDocument(fileData, mimeType);
      setDefectData(extractedData);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract data. Please ensure the document is clear and try again.');
      setStatus('error');
    } finally {
      setLoadingType(null);
    }
  };
  
  const processUnitAndDate = async () => {
    if (!fileData || !mimeType) return;
    resetData();
    setStatus('loading');
    setLoadingType('unit_date');
    setError(null);

    try {
      const extractedData = await extractUnitAndDateFromDocument(fileData, mimeType);
      setUnitDateData(extractedData);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract data. Please ensure the document is clear and try again.');
      setStatus('error');
    } finally {
      setLoadingType(null);
    }
  };
  
  const processSmuDocShift = async () => {
    if (!fileData || !mimeType) return;
    resetData();
    setStatus('loading');
    setLoadingType('smu');
    setError(null);

    try {
      const extractedData = await extractSmuDocShiftFromDocument(fileData, mimeType);
      setSmuData(extractedData);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract data. Please ensure the document is clear and try again.');
      setStatus('error');
    } finally {
      setLoadingType(null);
    }
  };
  
  const getBaseFileName = () => {
    return fileName ? fileName.split('.').slice(0, -1).join('.') : 'Report';
  }

  const parseDateForExcel = (dateStr: string | undefined | null) => {
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      if (d && m && y) {
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      }
    }
    return dateStr || '';
  };

  const applyDateFormat = (worksheet: XLSX.WorkSheet) => {
    Object.keys(worksheet).forEach(key => {
      if (worksheet[key] && worksheet[key].t === 'd') {
        worksheet[key].z = 'dd/mm/yyyy';
      }
    });
  };

  const exportDefectsToExcel = () => {
    const worksheetData = defectData.map(item => ({
      'Hal': item.halaman, 'No Unit': item.equipment_number, 'Category': item.id_defect, 'Date': parseDateForExcel(item.date),
      'crew': '', 'Shift': item.shift, 'Distance': item.distance, 'finish': 0, 'Inspected': item.inspected_by,
      'Description': item.deskripsi_defect, 'OP': 'L', 'Status Cek': item.cek
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    applyDateFormat(worksheet);
    worksheet['!cols'] = [
      { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, 
      { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 50 }, { wch: 10 }, { wch: 15 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Defects Found");
    XLSX.writeFile(workbook, `${getBaseFileName()}_Analyze defects.xlsx`);
  };
  
  const exportUnitDateToExcel = () => {
    const worksheetData = unitDateData.map(item => ({
      'Hal': item.halaman, 'Unit Number': item.equipment_number, 'Date': parseDateForExcel(item.date),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    applyDateFormat(worksheet);
    worksheet['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 15 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Unit-Date Extraction");
    XLSX.writeFile(workbook, `${getBaseFileName()}_Unit-Date Extraction.xlsx`);
  };
  
  const exportSmuToExcel = () => {
    const worksheetData = smuData.map(item => ({
      'Hal': item.halaman, 'SMU': item.smu, 'Blank': '', 'Doc Num': item.doc_num, 'Shift': item.shift,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    worksheet['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 10 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SMU-Doc Extraction");
    XLSX.writeFile(workbook, `${getBaseFileName()}_SMU-Doc Extraction.xlsx`);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(defectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defects-${defectData[0]?.equipment_number || 'report'}.json`;
    a.click();
  };

  const resetData = () => {
    setDefectData([]);
    setUnitDateData([]);
    setSmuData([]);
    setStatus('idle');
    setError(null);
  }

  const resetAll = () => {
    setFileData(null);
    setFileName(null);
    setMimeType('');
    resetData();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isPDF = mimeType === 'application/pdf';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Mining Defect Analyst</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">AI Multi-Modal Engine</p>
            </div>
          </div>
          {fileData && (<Button variant="ghost" onClick={resetAll}>Clear All</Button>)}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>Inspection Document</h2>
            {!fileData ? (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div>
                <p className="text-slate-600 font-medium">Upload Report (Image/PDF)</p><p className="text-slate-400 text-sm mt-1">PNG, JPG, or PDF</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-50 min-h-[300px] flex items-center justify-center">
                {isPDF ? (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 D 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                    <p className="font-bold text-slate-800 break-all">{fileName}</p><p className="text-slate-500 text-sm uppercase mt-1">PDF Document Loaded</p>
                  </div>
                ) : (<img src={fileData} alt="Report Preview" className="w-full h-auto object-contain max-h-[600px]" />)}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Change File</Button></div>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf"/>
            {fileData && (status === 'idle' || status === 'loading') && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button onClick={processDefects} className="h-12 text-sm" isLoading={status === 'loading' && loadingType === 'defects'} disabled={status==='loading'}>Analyze Defects</Button>
                <Button onClick={processUnitAndDate} className="h-12 text-sm" variant="secondary" isLoading={status === 'loading' && loadingType === 'unit_date'} disabled={status==='loading'}>Extract Unit/Date</Button>
                <Button onClick={processSmuDocShift} className="h-12 text-sm" variant="secondary" isLoading={status === 'loading' && loadingType === 'smu'} disabled={status==='loading'}>Extract SMU/Doc</Button>
              </div>
            )}
          </div>
          <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-lg font-bold mb-2">Instructions</h3>
            <ul className="text-sm space-y-2 text-blue-50 opacity-90">
              <li className="flex gap-2"><span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span><span>PDF reports can contain multiple pages of inspections.</span></li>
              <li className="flex gap-2"><span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span><span>The AI will extract defects from all visible pages.</span></li>
              <li className="flex gap-2"><span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span><span>Ensure text is clear for better OCR results.</span></li>
              <li className="flex gap-2"><span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">4</span><span>Always double-check AI results against the raw data before finalizing.</span></li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {status === 'loading' && (<div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4"><div className="relative w-20 h-20 mx-auto"><div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div><div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div></div><div><h3 className="text-lg font-semibold text-slate-800">Processing Document</h3><p className="text-slate-500 text-sm">OtoAI is scanning and analyzing the file...</p></div></div>)}
          {status === 'error' && (<div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-700"><div className="flex items-center gap-3 mb-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg><h3 className="font-bold">Extraction Failed</h3></div><p className="text-sm">{error}</p><Button variant="danger" className="mt-4" onClick={loadingType === 'defects' ? processDefects : (loadingType === 'unit_date' ? processUnitAndDate : processSmuDocShift)}>Retry Analysis</Button></div>)}
          {status === 'success' && (defectData.length > 0 || unitDateData.length > 0 || smuData.length > 0) && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">Extracted Data<span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-semibold">{defectData.length > 0 ? `${defectData.length} Defects Found` : unitDateData.length > 0 ? `${unitDateData.length} Entries Found` : `${smuData.length} Entries Found`}</span></h2>
                <div className="flex gap-2">
                   {defectData.length > 0 && (<><Button variant="secondary" className="bg-green-600 text-white hover:bg-green-700 border-none" onClick={exportDefectsToExcel}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Export Excel</Button><Button variant="secondary" onClick={exportToJSON}>Export JSON</Button></>)}
                   {unitDateData.length > 0 && (<Button variant="secondary" className="bg-green-600 text-white hover:bg-green-700 border-none" onClick={exportUnitDateToExcel}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Export Excel</Button>)}
                   {smuData.length > 0 && (<Button variant="secondary" className="bg-green-600 text-white hover:bg-green-700 border-none" onClick={exportSmuToExcel}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Export Excel</Button>)}
                </div>
              </div>
              {defectData.length > 0 && <DefectTable data={defectData} />}
              {unitDateData.length > 0 && <UnitDateTable data={unitDateData} />}
              {smuData.length > 0 && <SmuDocShiftTable data={smuData} />}
            </div>
          )}
          {status === 'success' && defectData.length === 0 && unitDateData.length === 0 && smuData.length === 0 && (<div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center"><div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><h3 className="text-lg font-semibold text-slate-800">No Data Found</h3><p className="text-slate-500 text-sm">The AI scanned the document but found no relevant data to extract.</p></div>)}
          {status === 'idle' && !fileData && (<div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg><p className="text-lg font-medium">Waiting for document...</p><p className="text-sm">Upload an image or PDF report to begin</p></div>)}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 lg:hidden flex gap-2">
         {fileData && (status === 'idle' || status === 'loading') ? (
           <div className="w-full grid grid-cols-3 gap-2">
             <Button onClick={processDefects} className="h-12 text-xs" isLoading={status === 'loading' && loadingType === 'defects'} disabled={status==='loading'}>Defects</Button>
             <Button onClick={processUnitAndDate} variant="secondary" className="h-12 text-xs" isLoading={status === 'loading' && loadingType === 'unit_date'} disabled={status==='loading'}>Unit/Date</Button>
             <Button onClick={processSmuDocShift} variant="secondary" className="h-12 text-xs" isLoading={status === 'loading' && loadingType === 'smu'} disabled={status==='loading'}>SMU/Doc</Button>
           </div>
         ) : (<Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full h-12">Select File</Button>)}
      </div>
    </div>
  );
};

export default App;
