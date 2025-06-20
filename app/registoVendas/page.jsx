"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import toast from "react-hot-toast";

export default function SalesRecordsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [popularProducts, setPopularProducts] = useState([]);
  const transactionsPerPage = 10;

  // Fetch transactions
  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions');
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        // Sort by date, newest first
        const sortedTransactions = data.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setTransactions(sortedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Erro ao carregar transações');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, router]);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.items.some(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.workerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesDate = !filterDate || 
      new Date(transaction.date).toISOString().split('T')[0] === filterDate;
    
    return matchesSearch && matchesDate;
  });

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction, 
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Calculate popular products based on date range filter
  const calculatePopularProducts = (transactions) => {
    const productMap = new Map();
    
    // Convert dates to timestamps for comparison
    const startTimestamp = startDate ? new Date(startDate).getTime() : null;
    const endTimestamp = endDate ? new Date(endDate + 'T23:59:59.999Z').getTime() : null;
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date).getTime();
      
      // Apply date range filter if dates are set
      if (startTimestamp && transactionDate < startTimestamp) return;
      if (endTimestamp && transactionDate > endTimestamp) return;
      
      transaction.items.forEach(item => {
        const existing = productMap.get(item.name) || { name: item.name, quantity: 0, total: 0 };
        productMap.set(item.name, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          total: existing.total + (parseFloat(item.price) * item.quantity)
        });
      });
    });
    
    // Convert to array and sort by quantity (descending)
    const sortedProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity);
    
    // If there's a tie for first place, show top 2, otherwise show only top 1
    if (sortedProducts.length > 1 && sortedProducts[0].quantity === sortedProducts[1].quantity) {
      return sortedProducts.slice(0, 2);
    }
    return sortedProducts.slice(0, 1);
  };

  // Update popular products when transactions or date filters change
  useEffect(() => {
    if (transactions.length > 0) {
      setPopularProducts(calculatePopularProducts(transactions));
    }
  }, [transactions, startDate, endDate]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="relative w-full">
        <div className="h-full w-full flex flex-col">
          <div className="relative w-full flex-1 flex flex-col">
            <div className="px-8 pt-6 pb-2 relative">
              <div className="w-full flex items-center justify-between gap-4 relative">
                <button
                  className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                  onClick={() => router.back()}
                >
                  VOLTAR
                </button>
                <h1 className="absolute left-1/2 -translate-x-1/2 text-4xl font-semibold text-white text-center tracking-wider pointer-events-none select-none">
                  Registo de Vendas
                </h1>
              </div>
            </div>
            <div className="flex justify-center items-center h-[400px] px-8">
              <span>Carregando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="h-full w-full flex flex-col">
        <div className="relative w-full flex-1 flex flex-col">
          <div className="px-8 pt-6 pb-2 relative">
            <div className="w-full flex items-center justify-between gap-4 relative">
              <button
                className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                onClick={() => router.back()}
              >
                VOLTAR
              </button>
              <h1 className="absolute left-1/2 -translate-x-1/2 text-4xl font-semibold text-white text-center tracking-wider pointer-events-none select-none">
                Registo de Vendas
              </h1>
            </div>
          </div>
          <div className="mt-8 w-full">
            {/* Search and Filter */}
            <div className="mb-6 px-8 flex flex-col sm:flex-row gap-4 items-start w-full">
              <div className="relative w-full sm:flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Pesquisar produto, descrição ou funcionário..."
                  className="w-full pl-10 pr-4 py-2 rounded bg-[#1f1f2e] border border-gray-600 text-white"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="w-full sm:w-48">
                <input
                  type="date"
                  className="w-full p-2 rounded bg-[#1f1f2e] border border-gray-600 text-white"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDate('');
                }}
                className="bg-quaternary text-white font-bold px-6 py-2 rounded-lg cursor-pointer whitespace-nowrap hover:bg-opacity-90 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[550px] px-8 pb-8 mt-6 w-full">
              <table className="min-w-full bg-[#232336] rounded-lg">
                <thead>
                  <tr className="bg-[#1f1f2e] text-white">
                    <th className="py-2 px-2 text-left text-sm">Data</th>
                    <th className="py-2 px-2 text-left text-sm">Itens</th>
                    <th className="py-2 px-2 text-left text-sm">Total</th>
                    <th className="py-2 px-2 text-left text-sm">NIF</th>
                    <th className="py-2 px-2 text-left text-sm">Funcionário</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.length > 0 ? (
                    currentTransactions.map((transaction, index) => (
                      <tr
                        key={`${transaction.id}-${index}`}
                        className="border-b border-[#282846] text-white hover:bg-[#282846] transition text-sm"
                      >
                        <td className="py-1 px-2 text-sm">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-1 px-2 text-sm">
                          <div className="space-y-1">
                            {transaction.items.map((item, i) => (
                              <div key={i} className="flex justify-between">
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="ml-4">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-1 px-2 text-sm font-medium">
                          {formatCurrency(transaction.total)}
                        </td>
                        <td className="py-1 px-2 text-sm">
                          {transaction.nif || '-'}
                        </td>
                        <td className="py-1 px-2 text-sm">
                          {transaction.workerName || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-sm text-gray-400">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pb-8 px-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-quaternary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-white">
                    Página {currentPage} de {Math.max(1, totalPages)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 bg-quaternary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              )}

              {/* Most Popular Products */}
              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-semibold text-white">
                    Produtos Mais Vendidos
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <label className="text-sm text-gray-300 whitespace-nowrap">De:</label>
                      <input
                        type="date"
                        className="p-2 rounded bg-[#1f1f2e] border border-gray-600 text-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={endDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <label className="text-sm text-gray-300 whitespace-nowrap">Até:</label>
                      <input
                        type="date"
                        className="p-2 rounded bg-[#1f1f2e] border border-gray-600 text-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="bg-quaternary text-white font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap hover:bg-opacity-90 transition-colors text-sm"
                    >
                      Limpar Datas
                    </button>
                  </div>
                </div>
                <div className="bg-[#232336] rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-[#1f1f2e] text-white">
                        <th className="py-2 px-4 text-left text-sm">Produto</th>
                        <th className="py-2 px-4 text-right text-sm">Quantidade</th>
                        <th className="py-2 px-4 text-right text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {popularProducts.length > 0 ? (
                        popularProducts.map((product, index) => (
                          <tr 
                            key={index}
                            className="border-b border-[#282846] text-white hover:bg-[#282846] transition text-sm"
                          >
                            <td className="py-2 px-4">{product.name}</td>
                            <td className="py-2 px-4 text-right">{product.quantity}</td>
                            <td className="py-2 px-4 text-right">{formatCurrency(product.total)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-4 text-center text-sm text-gray-400">
                            Nenhum dado de venda disponível
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
