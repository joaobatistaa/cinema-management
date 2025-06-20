"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { hasPermission } from "@/src/utils/permissions";
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useRef } from 'react';
import toast from "react-hot-toast";

export default function BackupsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [backups, setBackups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const fetchBackups = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/backups');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erro ao obter backups');
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Formato de resposta inválido');
            }

            setBackups(data);
        } catch (err) {
            setError(err.message || 'Erro ao carregar backups.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user === null) {
            router.push("/login");
        } else if (user && !hasPermission(user.role, "viewBackups")) {
            router.push("/home");
        } else {
            fetchBackups();
        }
    }, [user, router]);

    const handleDownload = async (fileName) => {
        try {
            const response = await fetch(`/api/backups/download?file=${encodeURIComponent(fileName)}`);
            if (!response.ok) throw new Error('Download falhou');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            setError('Erro ao descarregar ficheiro');
            toast.error('Erro ao descarregar ficheiro');
        }
    };

    const handleDownloadAll = async () => {
        if (isDownloading) return;

        try {
            setIsDownloading(true);
            const response = await fetch('/api/backups/download-all');
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || 'Erro ao gerar arquivo ZIP');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'backups.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            alert(err.message || 'Erro ao baixar todos os backups');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportFiles = async (files) => {
        const formData = new FormData();
        
        // Adiciona todos os ficheiros ao FormData
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            setIsImporting(true);
            const response = await fetch('/api/backups/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao importar ficheiro');
            }

            const result = await response.json();
            toast.success(`${files.length} ficheiro${files.length > 1 ? 's' : ''} importado${files.length > 1 ? 's' : ''} com sucesso!`);
            fetchBackups(); // Atualiza a lista de backups
        } catch (err) {
            console.error('Erro ao importar ficheiro:', err);
            toast.error(err.message || 'Erro ao importar ficheiro');
        } finally {
            setIsImporting(false);
        }
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // Verifica se todos os ficheiros são JSON
        const invalidFiles = Array.from(files).filter(
            file => !file.name.endsWith('.json')
        );

        if (invalidFiles.length > 0) {
            toast.error('Apenas ficheiros JSON são permitidos');
            return;
        }

        await handleImportFiles(files);
        
        // Limpa o input para permitir selecionar os mesmos ficheiros novamente
        event.target.value = null;
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: pt });
        } catch {
            return 'Data inválida';
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                A verificar permissões...
            </div>
        );
    }

    if (!hasPermission(user.role, "viewBackups")) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                Sem permissão para ver os backups.
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col p-6">
            {/* Barra superior */}
            <div className="grid grid-cols-3 items-center px-8 pt-6 pb-2">
                <div>
                    <button
                        className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                        onClick={() => router.back()}
                    >
                        VOLTAR
                    </button>
                </div>
                <div className="flex justify-center">
                    <h1 className="text-5xl font-semibold text-white text-center tracking-wider">
                        Backups
                    </h1>
                </div>
                <div className="flex justify-end">
                    {backups.length > 0 && (
                        <button
                            onClick={handleDownloadAll}
                            className={`${isDownloading
                                ? 'bg-quaternary/70 cursor-wait'
                                : 'bg-quaternary hover:bg-quaternary/90'
                                } text-white font-bold px-6 py-2 rounded-lg cursor-pointer flex items-center gap-2`}
                            disabled={isDownloading}
                        >
                            {isDownloading ? 'A processar...' : 'Baixar Tudo (ZIP)'}
                        </button>
                    )}
                </div>
            </div>

            {/* Conteúdo principal */}
            {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                    <span className="text-white">Carregando...</span>
                </div>
            ) : error ? (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                    <p>{error}</p>
                    <button
                        onClick={fetchBackups}
                        className="mt-2 bg-white text-red-500 px-3 py-1 rounded text-sm hover:bg-gray-100"
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : backups.length === 0 ? (
                <div className="bg-[#232336] p-6 rounded-lg mt-4">
                    <p className="text-gray-400">Nenhum ficheiro de backup encontrado.</p>
                </div>
            ) : (
                <div className="bg-[#232336] rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col mt-4" style={{ maxHeight: '400px' }}>
                    <div className="overflow-auto flex-1">
                        <table className="min-w-full divide-y divide-[#282846]">
                            <thead className="sticky top-0 bg-[#1f1f2e] z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Nome do Ficheiro
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Tamanho
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Última Modificação
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#232336] divide-y divide-[#282846]">
                                {backups.map((file) => (
                                    <tr key={file.name} className="hover:bg-[#282846] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                            {file.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {file.size}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {formatDate(file.lastModified)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDownload(file.name)}
                                                title="Descarregar"
                                                className="text-blue-400 hover:text-blue-300 mr-4 cursor-pointer"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-[#1f1f2e] px-6 py-3 text-xs text-gray-400 flex justify-between items-center">
                        <span>{backups.length} ficheiro{backups.length !== 1 ? 's' : ''} encontrado{backups.length !== 1 ? 's' : ''}</span>
                        
                        {/* Botão de importar no rodapé do card */}
                        <div className="relative">
                            <button
                                onClick={handleImportClick}
                                disabled={isImporting}
                                className={`bg-quaternary hover:bg-quaternary/90 text-white font-medium text-sm rounded-md px-4 py-2 flex items-center gap-2 cursor-pointer shadow hover:shadow-md transition-all ${isImporting ? 'opacity-70 cursor-wait' : ''}`}
                                title="Importar ficheiro JSON"
                            >
                                {isImporting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                )}
                                Importar
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                                disabled={isImporting}
                                multiple
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
