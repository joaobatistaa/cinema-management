"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { hasPermission } from "@/src/utils/permissions";
import { useAuth } from "@/src/contexts/AuthContext";

export default function Bar() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || "guest";

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]); // Produtos adicionados ao carrinho
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const editPriceRef = useRef();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createStock, setCreateStock] = useState("");
  const [createPrice, setCreatePrice] = useState("");
  const createPriceRef = useRef();
  const pageSize = 12;

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch("/api/bar");
        if (!response.ok) throw new Error("Erro ao carregar os produtos.");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        toast.error(error.message || "Erro ao carregar os produtos.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const paginatedProducts = products.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Atualiza a quantidade de um produto
  function handleQuantityChange(productId, delta) {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 0;
      const product = products.find((p) => p.id === productId);
      const stock = Number(product?.stock ?? 0);
      const newQty = Math.max(currentQty + delta, 0);

      if (delta > 0 && newQty > stock) {
        toast.error("Já não existe stock suficiente para este produto.");
        return prev;
      }

      // Atualiza o carrinho ao mesmo tempo
      setCart((oldCart) => {
        const exists = oldCart.find((item) => item.id === productId);
        if (newQty === 0) {
          // Remove do carrinho se quantidade for 0
          return oldCart.filter((item) => item.id !== productId);
        }
        if (exists) {
          // Atualiza quantidade
          return oldCart.map((item) =>
            item.id === productId ? { ...item, quantity: newQty } : item
          );
        }
        // Adiciona novo produto ao carrinho
        if (product) {
          return [...oldCart, { ...product, quantity: newQty }];
        }
        return oldCart;
      });
      return { ...prev, [productId]: newQty };
    });
  }

  // Total da compra (usando o carrinho)
  const total = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0),
    0
  );

  const handleOpenForm = () => {
    // Mostra o popup para funcionário OU admin
    if (userRole === "employee" || userRole === "admin") {
      setShowEmailForm(true);
    } else {
      if (total === 0) return;
      handleBuy(user?.email || "");
    }
  }

  // Função para criar uma nova transação
  async function handleBuy(finalEmail) {
    if (total === 0) return;

    let emailToUse = finalEmail;

    if (emailToUse) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)) {
        toast.error("Insira um email válido.");
        return;
      }

      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToUse.trim().toLowerCase(), cart, desc: "Compra no Bar" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Erro ao registar transação.");
        };
        toast.success("Compra efetuada com sucesso.");
        router.push("/home");
      } catch (err) {
        toast.error(err.message || "Erro ao registar transação.");
      } finally {
        setLoading(false);
      }    
    } else {
      toast.error("Não tem permissão para efetuar compras no bar.");
      return;
    }
  }

  // Abrir modal de edição
  function handleEditProduct(product) {
    setEditProduct(product);
    setEditName(product.name);
    setEditStock(product.stock);
    setEditPrice(Number(product.price).toFixed(2).replace(".", ",") + " €");
    setShowEditModal(true);
    setTimeout(() => {
      if (editPriceRef.current) editPriceRef.current.focus();
    }, 100);
  }

  // Submeter alterações
  async function handleConfirmEdit(e) {
    e.preventDefault();
    // Validação simples
    if (!editName.trim() || !editStock || !editPrice) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const priceValue = editPrice.replace("€", "").replace(",", ".").trim();
    if (isNaN(Number(priceValue)) || Number(priceValue) < 0) {
      toast.error("Preço inválido.");
      return;
    }
    if (isNaN(Number(editStock)) || Number(editStock) < 0) {
      toast.error("Stock inválido.");
      return;
    }
    try {
      const res = await fetch("/api/bar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editProduct.id,
          name: editName.trim(),
          stock: Number(editStock),
          price: priceValue,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao atualizar produto.");
      }
      toast.success("Produto atualizado com sucesso.");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProduct.id
            ? { ...p, name: editName.trim(), stock: Number(editStock), price: priceValue }
            : p
        )
      );
      setShowEditModal(false);
      setEditProduct(null);
    } catch {
      toast.error("Erro ao atualizar produto.");
    }
  }

  // Abrir modal de criação
  function handleOpenCreateModal() {
    setCreateName("");
    setCreateStock("");
    setCreatePrice("");
    setShowCreateModal(true);
    setTimeout(() => {
      if (createPriceRef.current) createPriceRef.current.focus();
    }, 100);
  }

  // Submeter novo produto
  async function handleConfirmCreate(e) {
    e.preventDefault();
    if (!createName.trim() || !createStock || !createPrice) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const priceValue = createPrice.replace("€", "").replace(",", ".").trim();
    if (isNaN(Number(priceValue)) || Number(priceValue) < 0) {
      toast.error("Preço inválido.");
      return;
    }
    if (isNaN(Number(createStock)) || Number(createStock) < 0) {
      toast.error("Stock inválido.");
      return;
    }
    try {
      const res = await fetch("/api/bar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          stock: Number(createStock),
          price: priceValue,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao criar produto.");
      }
      const newProduct = await res.json();
      toast.success("Produto criado com sucesso.");
      setProducts((prev) => [...prev, newProduct]);
      setShowCreateModal(false);
    } catch {
      toast.error("Erro ao criar produto.");
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative w-full flex-1 flex flex-col">
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
              Bar
            </h1>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <span className="text-white">Carregando...</span>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-4 grid-rows-3 gap-4 mb-4 p-8">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1f1f2e] rounded-lg p-4 text-white text-center shadow"
                  style={{ height: "140px", overflowY: "auto", position: "relative" }}
                >
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-orange-400">Stock: {product.stock}</p>
                  <p className="text-green-400">{product.price} €</p>
                  <div className="flex justify-center items-center gap-2 mt-2 relative">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="bg-red-500 rounded-full px-2 text-white text-lg cursor-pointer"
                    >
                      -
                    </button>
                    <span>{quantities[product.id] || 0}</span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="bg-green-500 rounded-full px-2 text-white text-lg cursor-pointer"
                    >
                      +
                    </button>
                    {/* Ícones de admin lado a lado dos botões de quantidade */}
                    {userRole === "admin" && (
                      <div className="flex gap-2 ml-2">
                        <button
                          title="Editar produto"
                          className="bg-blue-600 hover:bg-blue-700 rounded-full p-1 cursor-pointer"
                          onClick={() => handleEditProduct(product)}
                          tabIndex={-1}
                          type="button"
                        >
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M4 21h17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M17.7 6.29a1 1 0 0 1 0 1.41l-9.3 9.3-3.4.7.7-3.4 9.3-9.3a1 1 0 0 1 1.41 0l1.29 1.29a1 1 0 0 1 0 1.41z" stroke="#fff" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          title="Eliminar produto"
                          className="bg-red-600 hover:bg-red-700 rounded-full p-1 cursor-pointer"
                          onClick={() => {
                            if (window.confirm("Tem a certeza que pretende eliminar este produto?")) {
                              fetch(`/api/bar?id=${product.id}`, {
                                method: "DELETE"
                              })
                                .then(res => {
                                  if (!res.ok) throw new Error("Erro ao eliminar produto.");
                                  toast.success("Produto eliminado com sucesso.");
                                  setProducts((prev) => prev.filter((p) => p.id !== product.id));
                                })
                                .catch(() => toast.error("Erro ao eliminar produto."));
                            }
                          }}
                          tabIndex={-1}
                          type="button"
                        >
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M3 6h18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#fff" strokeWidth="2"/>
                            <rect x="5" y="6" width="14" height="14" rx="2" stroke="#fff" strokeWidth="2"/>
                            <path d="M10 11v6M14 11v6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Card para adicionar novo produto (apenas admin, só na última página e depois do último produto) */}
              {userRole === "admin" &&
                page === Math.ceil(products.length / pageSize) && (
                  <div
                    className="bg-[#232336] rounded-lg p-4 flex flex-col items-center justify-center text-white text-center shadow cursor-pointer hover:bg-[#282846] transition"
                    style={{ height: "140px", minHeight: "140px", overflowY: "auto" }}
                    onClick={handleOpenCreateModal}
                  >
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="22" stroke="#fff" strokeWidth="2" fill="#232336"/>
                        <path d="M24 16v16M16 24h16" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                )}
            </div>
            {/* Paginação centralizada */}
            <div className="flex items-end gap-2 mb-6 px-8">
              <div className="flex-1" />
              <div className="flex justify-center items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-auto"
                >
                  &lt;
                </button>
                {[...Array(Math.ceil(products.length / pageSize)).keys()].map(
                  (n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n + 1)}
                      className={`cursor-pointer px-3 py-1 rounded ${page === n + 1
                        ? "bg-white text-black"
                        : "bg-gray-800 text-white"
                      }`}
                    >
                      {n + 1}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(p + 1, Math.ceil(products.length / pageSize))
                    )
                  }
                  disabled={page === Math.ceil(products.length / pageSize)}
                  className="bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-auto"
                >
                  &gt;
                </button>
              </div>
              {/* Total e botão de compra alinhados à direita */}
              <div className="flex-1 flex justify-end items-end">
                <div className="flex flex-col items-center ml-8 justify-end self-end">
                  <div className="flex flex-row">
                    <span className="text-white font-semibold mb-2 mr-2">
                      Total:
                    </span>
                    <span className="text-white font-normal mb-2">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-16 py-2 rounded-lg cursor-pointer"
                    onClick={() => handleOpenForm()}
                    disabled={total === 0}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
           
          </div>
        )}
      </div>
  
      {/* Modal de email para funcionário e admin */}
      {(showEmailForm && (userRole === "employee" || userRole === "admin")) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#232336] rounded-xl shadow-lg p-8 flex flex-col items-center min-w-[320px] max-w-[90vw]">
            <h2 className="text-white text-xl font-bold mb-4">
              Email do cliente
            </h2>
            <form
              className="flex flex-col items-center w-full"
              onSubmit={(e) => {
                e.preventDefault();
                handleBuy(clientEmail);
              }}
            >
              <input
                type="email"
                className="px-3 py-2 rounded border border-gray-400 mb-2 w-full bg-[#232336] text-white"
                placeholder="Email do cliente"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-2 rounded-lg cursor-pointer"
                >
                  Finalizar Compra
                </button>
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-2 rounded-lg cursor-pointer"
                  onClick={() => {
                    setShowEmailForm(false);
                    setClientEmail("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar produto */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#161621] rounded-xl shadow-lg p-8 flex flex-col items-center min-w-[320px] max-w-[90vw]">
            <h2 className="text-white text-2xl font-bold mb-6 text-center">
              ALTERAR PRODUTO
            </h2>
            <form className="flex flex-col gap-4 w-[320px]" onSubmit={handleConfirmEdit}>
              <div>
                <label className="block text-white mb-1">NOME</label>
                <input
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-white mb-1">STOCK</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={editStock}
                    onChange={e => setEditStock(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white mb-1">PREÇO</label>
                  <input
                    ref={editPriceRef}
                    className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg cursor-pointer"
              >
                CONFIRMAR ALTERAÇÕES
              </button>
              <button
                type="button"
                className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg cursor-pointer"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal criar produto */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#1f1f2e] rounded-xl shadow-lg p-8 flex flex-col items-center min-w-[320px] max-w-[90vw]">
            <h2 className="text-white text-2xl font-bold mb-6 text-center">
              CRIAR PRODUTO
            </h2>
            <form className="flex flex-col gap-4 w-[320px]" onSubmit={handleConfirmCreate}>
              <div>
                <label className="block text-white mb-1">NOME</label>
                <input
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-white mb-1">STOCK</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={createStock}
                    onChange={e => setCreateStock(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white mb-1">PREÇO</label>
                  <input
                    ref={createPriceRef}
                    className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={createPrice}
                    onChange={e => setCreatePrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg cursor-pointer"
              >
                CRIAR PRODUTO
              </button>
              <button
                type="button"
                className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg cursor-pointer"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
