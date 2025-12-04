import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import cargasService from './cargasService';

export default function UploadCieCups() {
  const [cie, setCie] = useState<File | null>(null);
  const [cups, setCups] = useState<File | null>(null);
  const [loadingCie, setLoadingCie] = useState(false);
  const [loadingCups, setLoadingCups] = useState(false);
  const [successCie, setSuccessCie] = useState(false);
  const [successCups, setSuccessCups] = useState(false);
  const [errorCie, setErrorCie] = useState('');
  const [errorCups, setErrorCups] = useState('');

  const subirCie = async () => {
    if (!cie) return;
    setLoadingCie(true);
    setErrorCie('');
    setSuccessCie(false);
    try {
      await cargasService.cargarCIE(cie);
      setSuccessCie(true);
      setTimeout(() => {
        setSuccessCie(false);
        setCie(null);
      }, 3000);
    } catch (error: any) {
      setErrorCie(error?.response?.data?.message || 'Error al subir el archivo CIE');
      console.error('Error:', error);
    } finally {
      setLoadingCie(false);
    }
  };

  const subirCups = async () => {
    if (!cups) return;
    setLoadingCups(true);
    setErrorCups('');
    setSuccessCups(false);
    try {
      await cargasService.cargarCUPS(cups);
      setSuccessCups(true);
      setTimeout(() => {
        setSuccessCups(false);
        setCups(null);
      }, 3000);
    } catch (error: any) {
      setErrorCups(error?.response?.data?.message || 'Error al subir el archivo CUPS');
      console.error('Error:', error);
    } finally {
      setLoadingCups(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card CIE */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Clasificación CIE</h3>
            <p className="text-sm text-gray-500">Código Internacional de Enfermedades</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="block">
            <div className="relative">
              <input
                type="file"
                onChange={(e) => {
                  setCie(e.target.files?.[0] || null);
                  setErrorCie('');
                  setSuccessCie(false);
                }}
                className="hidden"
                id="cie-upload"
                accept=".csv,.xlsx,.xls"
              />
              <label
                htmlFor="cie-upload"
                className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 truncate">
                  {cie ? cie.name : 'Seleccionar archivo CIE'}
                </span>
              </label>
            </div>
          </label>
          
          <button
            onClick={subirCie}
            disabled={!cie || loadingCie}
            className="w-full px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loadingCie ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Subiendo...
              </>
            ) : (
              'Subir CIE'
            )}
          </button>

          {successCie && (
            <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              Archivo subido correctamente
            </div>
          )}

          {errorCie && (
            <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {errorCie}
            </div>
          )}
        </div>
      </div>

      {/* Card CUPS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Clasificación CUPS</h3>
            <p className="text-sm text-gray-500">Clasificación Única Procedimientos</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="block">
            <div className="relative">
              <input
                type="file"
                onChange={(e) => {
                  setCups(e.target.files?.[0] || null);
                  setErrorCups('');
                  setSuccessCups(false);
                }}
                className="hidden"
                id="cups-upload"
                accept=".csv,.xlsx,.xls"
              />
              <label
                htmlFor="cups-upload"
                className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-info hover:bg-info/5 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 truncate">
                  {cups ? cups.name : 'Seleccionar archivo CUPS'}
                </span>
              </label>
            </div>
          </label>
          
          <button
            onClick={subirCups}
            disabled={!cups || loadingCups}
            className="w-full px-4 py-2.5 bg-info text-white font-medium rounded-lg hover:bg-info-active disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loadingCups ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Subiendo...
              </>
            ) : (
              'Subir CUPS'
            )}
          </button>

          {successCups && (
            <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              Archivo subido correctamente
            </div>
          )}

          {errorCups && (
            <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {errorCups}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}