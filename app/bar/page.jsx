"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  // Função para criar uma nova transação
  async function handleBuy() {
    if (total === 0) return;
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          total,
          user: user?.id || null,
          date: new Date().toISOString(),
          desc: "Compra no Bar",
        }),
      });
      if (!response.ok) throw new Error("Erro ao registar transação.");
      toast.success("Compra efetuada!");
      setQuantities({});
      setCart([]);
      router.push("/"); // redireciona para a página principal após compra
    } catch (err) {
      toast.error(err.message || "Erro ao registar transação.");
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
          <>
            <div className="grid grid-cols-4 grid-rows-3 gap-4 mb-4 p-8">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1f1f2e] rounded-lg p-4 text-white text-center shadow"
                  style={{ height: "140px", overflowY: "auto" }}
                >
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-orange-400">Stock: {product.stock}</p>
                  <p className="text-green-400">{product.price} €</p>
                  <div className="flex justify-center items-center gap-2 mt-2">
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
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação centralizada com total e botão à direita */}
            <div className="flex items-center gap-2 mb-6 px-8">
              <div className="flex-1" />
              <div className="flex justify-center items-center gap-2 flex-shrink-0">
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
                      className={`cursor-pointer px-3 py-1 rounded ${
                        page === n + 1
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
              <div className="flex-1 flex justify-end">
                <div className="flex flex-col items-center ml-8">
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
                    onClick={handleBuy}
                    disabled={total === 0}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
