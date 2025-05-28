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
  const pageSize = 15;

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch("/api/bar");
        if (!response.ok) throw new Error("Erro ao carregar os produtos.");
        const data = await response.json();
        setProducts(data);
        const initialQuantities = {};
        data.forEach((product) => {
          initialQuantities[product.id] = 0;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        toast.error(error.message || "Erro ao carregar os produtos.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => {
      const newQty = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: newQty };
    });
  };

  const paginatedProducts = products.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const total = products.reduce(
    (sum, product) => sum + (quantities[product.id] || 0) * product.price,
    0
  );

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
          <div className="flex justify-end">
            {hasPermission(userRole, "createMovies") && (
              <button
                className="bg-quaternary text-lg text-white px-6 py-3 rounded font-medium ml-auto cursor-pointer"
                onClick={() => router.push("/movies/new")}
              >
                NOVO FILME
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <span className="text-white">Carregando...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-4 mb-8">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1f1f2e] rounded-lg p-4 text-white text-center shadow"
                >
                  <div className="w-full h-24 flex justify-center items-center mb-2">
                    <Image
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="object-contain max-h-full"
                    />
                  </div>
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-orange-400">Stock: {product.stock}</p>
                  <p className="text-green-400">{product.price.toFixed(2)} €</p>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="bg-red-500 rounded-full px-2 text-white text-lg"
                    >
                      -
                    </button>
                    <span>{quantities[product.id]}</span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="bg-green-500 rounded-full px-2 text-white text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            <div className="flex justify-center items-center gap-2 mb-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                &lt;
              </button>
              {[...Array(Math.ceil(products.length / pageSize)).keys()].map(
                (n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n + 1)}
                    className={`px-3 py-1 rounded ${page === n + 1
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
                className="bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                &gt;
              </button>
            </div>

            {/* Total e botão comprar */}
            <div className="flex justify-between items-center px-2">
              <h2 className="text-white text-2xl font-semibold">
                Total: {total.toFixed(2)} €
              </h2>
              <button className="bg-green-600 text-white px-8 py-3 rounded text-lg font-semibold">
                COMPRAR
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
