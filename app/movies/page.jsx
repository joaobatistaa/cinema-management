"use client";

import Image from "next/image";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { hasPermission } from "@/src/utils/permissions";
import { useAuth } from "@/src/contexts/AuthContext";
import { MOVIE_GENRES } from "@/src/constants/movies";

export default function Movies() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || "guest";
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSynopsis, setEditSynopsis] = useState("");
  const [editCast, setEditCast] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editRating, setEditRating] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editDirector, setEditDirector] = useState("");
  const [editImage, setEditImage] = useState("");
  const editTitleRef = useRef();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createSynopsis, setCreateSynopsis] = useState("");
  const [createCast, setCreateCast] = useState("");
  const [createDuration, setCreateDuration] = useState("");
  const [createRating, setCreateRating] = useState("");
  const [createGenre, setCreateGenre] = useState("");
  const [createYear, setCreateYear] = useState("");
  const [createDirector, setCreateDirector] = useState("");
  const [createImage, setCreateImage] = useState("");
  const createTitleRef = useRef();

  const pageSize = 10;
  const [tickets, setTickets] = useState([]);

  // Ano mínimo e máximo permitidos
  const MIN_YEAR = 1900;
  const MAX_YEAR = new Date().getFullYear();

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const response = await fetch("/api/movies");
        if (!response.ok) {
          const errorData = response.headers
            .get("Content-Type")
            ?.includes("application/json")
            ? await response.json()
            : { message: "Erro ao carregar os filmes." };
          throw new Error(errorData.message);
        }
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        toast.error(error.message || "Erro ao carregar os filmes.");
      } finally {
        setLoading(false);
      }
    }
    async function fetchTickets() {
      try {
        const response = await fetch("/api/tickets");
        if (!response.ok) return;
        const data = await response.json();
        setTickets(data);
      } catch {}
    }
    fetchMovies();
    fetchTickets();
  }, []);

  const paginatedMovies = movies.slice((page - 1) * pageSize, page * pageSize);

  function openEditModal(movie) {
    setEditMovie(movie);
    setEditTitle(movie.title || "");
    setEditSynopsis(movie.synopsis || "");
    setEditCast((movie.cast || []).join("\n"));
    setEditDuration(movie.duration || "");
    setEditRating(movie.rating || "");
    setEditGenre(movie.genre || "");
    setEditYear(movie.year || "");
    setEditDirector(movie.director || "");
    setEditImage(movie.image || movie.poster || "");
    setShowEditModal(true);
    setTimeout(() => {
      if (editTitleRef.current) editTitleRef.current.focus();
    }, 100);
  }

  // Handler para upload de imagem
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  // Handler para upload de imagem no modal de criação
  function handleCreateImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCreateImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleEditMovie(e) {
    e.preventDefault();
    // Validação do ano
    const yearNum = Number(editYear);
    if (yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
      toast.error(`O ano deve estar entre ${MIN_YEAR} e ${MAX_YEAR}.`);
      return;
    }
    if (
      !editTitle.trim() ||
      !editSynopsis.trim() ||
      !editCast.trim() ||
      !editDuration ||
      !editRating ||
      !editGenre ||
      !editYear ||
      !editDirector
    ) {
      toast.error("Preencha todos os campos.");
      return;
    }
    try {
      const res = await fetch(`/api/movies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editMovie.id,
          title: editTitle.trim(),
          synopsis: editSynopsis.trim(),
          cast: editCast.split("\n").map((s) => s.trim()).filter(Boolean),
          duration: Number(editDuration),
          rating: editRating,
          genre: editGenre,
          year: Number(editYear),
          director: editDirector.trim(),
          image: editImage,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao atualizar filme.");
      }
      const updatedMovie = await res.json();
      toast.success("Filme atualizado com sucesso.");
      setMovies((prev) =>
        prev.map((m) =>
          m.id === editMovie.id
            ? updatedMovie
            : m
        )
      );
      setShowEditModal(false);
      setEditMovie(null);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar filme.");
    }
  }

  async function handleCreateMovie(e) {
    e.preventDefault();
    // Validação do ano
    const yearNum = Number(createYear);
    if (yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
      toast.error(`O ano deve estar entre ${MIN_YEAR} e ${MAX_YEAR}.`);
      return;
    }
    if (
      !createTitle.trim() ||
      !createSynopsis.trim() ||
      !createCast.trim() ||
      !createDuration ||
      !createRating ||
      !createGenre ||
      !createYear ||
      !createDirector ||
      !createImage
    ) {
      toast.error("Preencha todos os campos.");
      return;
    }
    try {
      const res = await fetch(`/api/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createTitle.trim(),
          synopsis: createSynopsis.trim(),
          cast: createCast.split("\n").map((s) => s.trim()).filter(Boolean),
          duration: Number(createDuration),
          rating: createRating,
          genre: createGenre,
          year: Number(createYear),
          director: createDirector.trim(),
          image: createImage,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao criar filme.");
      }
      const newMovie = await res.json();
      toast.success("Filme criado com sucesso.");
      setMovies((prev) => [...prev, newMovie]);
      setShowCreateModal(false);
    } catch (err) {
      toast.error(err.message || "Erro ao criar filme.");
    }
  }

  // Função para eliminar filme
  async function handleDeleteMovie(movieId) {
    // Verifica se há bilhetes associados
    const hasTickets = tickets.some(
      (t) => String(t.movie_id) === String(movieId)
    );
    if (hasTickets) {
      toast.error("Não é possível eliminar filmes com bilhetes associados.");
      return;
    }
    if (!window.confirm("Tem a certeza que pretende eliminar este filme?")) return;
    try {
      const res = await fetch(`/api/movies?id=${movieId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao eliminar filme.");
      }
      toast.success("Filme eliminado com sucesso.");
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      toast.error(err.message || "Erro ao eliminar filme.");
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
              FILMES
            </h1>
          </div>
          <div className="flex justify-end">
            {hasPermission(userRole, "createMovies") && (
              <button
                className="bg-quaternary text-lg text-white px-6 py-3 rounded font-medium ml-auto cursor-pointer"
                onClick={() => {
                  setShowCreateModal(true);
                  setTimeout(() => {
                    if (createTitleRef.current) createTitleRef.current.focus();
                  }, 100);
                }}
              >
                NOVO FILME
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row justify-center items-start px-8 h-full relative mt-4">
          {loading ? (
            <div className="flex w-full h-[590px] items-center justify-center">
              <CircularProgress color="error" />
            </div>
          ) : movies.length === 0 ? (
            <div className="flex w-full h-[590px] items-center justify-center">
              <span className="text-white text-2xl font-semibold">
                Não há filmes de momento.
              </span>
            </div>
          ) : (
            <div
              className="grid grid-cols-5 grid-rows-2 gap-4 overflow-y-auto"
              style={{ maxHeight: 590, minWidth: 0 }}
            >
              {paginatedMovies &&
                paginatedMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="relative flex flex-col items-start shadow w-full cursor-pointer"
                    style={{ minWidth: 0 }}
                    onClick={() => router.push(`/movies/${movie.id}`)}
                  >
                    {userRole === "admin" && (
                      <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button
                          title="Editar filme"
                          className="bg-blue-600 hover:bg-blue-700 rounded-full p-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(movie);
                          }}
                          tabIndex={-1}
                          type="button"
                          aria-label="Editar"
                          style={{ width: 32, height: 32 }}
                        >
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M4 21h17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M17.7 6.29a1 1 0 0 1 0 1.41l-9.3 9.3-3.4.7.7-3.4 9.3-9.3a1 1 0 0 1 1.41 0l1.29 1.29a1 1 0 0 1 0 1.41z" stroke="#fff" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          title="Eliminar filme"
                          className="bg-red-600 hover:bg-red-700 rounded-full p-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMovie(movie.id);
                          }}
                          tabIndex={-1}
                          type="button"
                          aria-label="Eliminar"
                          style={{ width: 32, height: 32 }}
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
                    {(movie.poster || movie.image) ? (
                      <Image
                        src={
                          (movie.poster && movie.poster !== "")
                            ? movie.poster
                            : (movie.image && movie.image !== "")
                              ? movie.image
                              : "/placeholder_movie.png"
                        }
                        alt={movie.title || "Poster do filme"}
                        width={190}
                        height={260}
                        className="rounded-lg object-cover mb-2 mt-0"
                        style={{ width: 190, height: 260, objectFit: "cover" }}
                      />
                    ) : (
                      <Image
                        src="/placeholder_movie.png"
                        alt="Poster do filme"
                        width={190}
                        height={260}
                        className="rounded-lg object-cover mb-2 mt-0"
                        style={{ width: 190, height: 260, objectFit: "cover" }}
                      />
                    )}
                    <div className="w-full">
                      <span
                        className="block text-center font-normal text-white break-words truncate"
                        style={{ display: "block", width: "100%" }}
                      >
                        {movie.title}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
          {movies.length > pageSize &&
            page < Math.ceil(movies.length / pageSize) &&
            !loading && (
              <div
                className="absolute right-5 flex items-center"
                style={{ top: "47%", transform: "translateY(-47%)" }}
              >
                <button
                  className="bg-quinary rounded-full p-2 cursor-pointer opacity-80"
                  onClick={() => setPage((prev) => prev + 1)}
                  aria-label="Próxima página"
                >
                  <KeyboardArrowRightIcon
                    className="text-white"
                    fontSize="large"
                  />
                </button>
              </div>
            )}
          {movies.length > pageSize && page > 1 && !loading && (
            <div
              className="absolute left-5 flex items-center"
              style={{ top: "47%", transform: "translateY(-47%)" }}
            >
              <button
                className="bg-quinary rounded-full p-2 cursor-pointer opacity-80"
                onClick={() => setPage((prev) => prev - 1)}
                aria-label="Página Anterior"
              >
                <KeyboardArrowLeftIcon
                  className="text-white"
                  fontSize="large"
                />
              </button>
            </div>
          )}
        </div>
      </div>
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#232336] rounded-xl shadow-lg p-10 flex flex-col items-center min-w-[900px] max-w-[98vw]">
            <div className="flex w-full justify-between items-start">
              <button
                className="bg-quinary text-white px-6 py-3 rounded font-medium mb-6 cursor-pointer"
                onClick={() => setShowEditModal(false)}
              >
                VOLTAR
              </button>
              <h2 className="text-white text-5xl font-bold mb-6 text-center flex-1">
                ALTERAR FILME
              </h2>
              <div style={{ width: 120 }} />
            </div>
            <form
              className="flex flex-row gap-8 w-full"
              style={{ alignItems: "flex-start" }}
              onSubmit={handleEditMovie}
            >
              <div className="flex flex-col gap-4 flex-1">
                <div>
                  <label className="block text-white mb-1 text-lg">NOME DO FILME</label>
                  <input
                    ref={editTitleRef}
                    className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white text-lg"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-white mb-1 text-lg">RESUMO</label>
                    <textarea
                      className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white text-base h-32 resize-none"
                      value={editSynopsis}
                      onChange={e => setEditSynopsis(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-white mb-1 text-lg">ELENCO</label>
                    <textarea
                      className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white text-base h-32 resize-none"
                      value={editCast}
                      onChange={e => setEditCast(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block text-white mb-1">DURAÇÃO (MIN)</label>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                      value={editDuration}
                      onChange={e => setEditDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">CLASSIFICAÇÃO</label>
                    <select
                      className="w-24 px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                      value={editRating}
                      onChange={e => setEditRating(e.target.value)}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="6+">6</option>
                      <option value="12+">12</option>
                      <option value="14+">14</option>
                      <option value="16+">16</option>
                      <option value="18+">18</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white mb-1">GÊNERO</label>
                    <input
                      className="w-32 px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                      value={editGenre}
                      onChange={e => setEditGenre(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">ANO LANÇAMENTO</label>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                      value={editYear}
                      onChange={e => setEditYear(e.target.value)}
                      required
                      min={MIN_YEAR}
                      max={MAX_YEAR}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-1">REALIZAÇÃO</label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={editDirector}
                    onChange={e => setEditDirector(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col items-center min-w-[240px]">
                <label
                  htmlFor="edit-movie-image-upload"
                  className="cursor-pointer"
                  style={{ width: 220, height: 320 }}
                >
                  <img
                    src={editImage}
                    alt={editTitle}
                    className="rounded-lg object-cover mb-6 mt-8"
                    style={{
                      width: 220,
                      height: 320,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </label>
                <input
                  id="edit-movie-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <button
                  type="submit"
                  className="bg-quaternary text-white font-bold px-16 py-4 rounded-lg text-lg mt-14 cursor-pointer"
                  style={{ minWidth: 200 }}
                >
                  GUARDAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#232336] rounded-xl shadow-lg p-10 flex flex-col items-center min-w-[900px] max-w-[98vw]">
            <div className="flex w-full justify-between items-start">
              <button
                className="bg-quinary text-white px-6 py-3 rounded font-medium mb-6 cursor-pointer"
                onClick={() => setShowCreateModal(false)}
              >
                VOLTAR
              </button>
              <h2 className="text-white text-5xl font-bold mb-6 text-center flex-1">
                NOVO FILME
              </h2>
              <div style={{ width: 120 }} />
            </div>
            <form
              className="flex flex-row gap-8 w-full"
              style={{ alignItems: "flex-start" }}
              onSubmit={handleCreateMovie}
            >
              <div className="flex flex-col gap-4 flex-1">
                <div>
                  <label className="block text-white mb-1 text-lg">NOME DO FILME</label>
                  <input
                    ref={createTitleRef}
                    className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white text-lg"
                    value={createTitle}
                    onChange={e => setCreateTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-white mb-1 text-lg">RESUMO</label>
                    <textarea
                      className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white text-base h-32 resize-none"
                      value={createSynopsis}
                      onChange={e => setCreateSynopsis(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-white mb-1 text-lg">ELENCO</label>
                    <textarea
                      className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white text-base h-32 resize-none"
                      value={createCast}
                      onChange={e => setCreateCast(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block text-white mb-1">DURAÇÃO (MIN)</label>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                      value={createDuration}
                      onChange={e => setCreateDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">CLASSIFICAÇÃO</label>
                    <select
                      className="w-24 px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                      value={createRating}
                      onChange={e => setCreateRating(e.target.value)}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="6+">6</option>
                      <option value="12+">12</option>
                      <option value="14+">14</option>
                      <option value="16+">16</option>
                      <option value="18+">18</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white mb-1">GÊNERO</label>
                    <select
                      className="w-32 px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                      value={createGenre}
                      onChange={e => setCreateGenre(e.target.value)}
                      required
                    >
                      <option value="">Selecione</option>
                      {MOVIE_GENRES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white mb-1">ANO LANÇAMENTO</label>
                    <input
                      type="number"
                      className="w-24 px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                      value={createYear}
                      onChange={e => setCreateYear(e.target.value)}
                      required
                      min={MIN_YEAR}
                      max={MAX_YEAR}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-1">REALIZAÇÃO</label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={createDirector}
                    onChange={e => setCreateDirector(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col items-center min-w-[240px]">
                <label
                  htmlFor="create-movie-image-upload"
                  className="cursor-pointer"
                  style={{ width: 220, height: 320 }}
                >
                  <img
                    src={createImage || "/placeholder_movie.png"}
                    alt={createTitle}
                    className="rounded-lg object-cover mb-6 mt-8"
                    style={{
                      width: 220,
                      height: 320,
                      objectFit: "cover",
                      display: "block",
                      cursor: "pointer"
                    }}
                  />
                </label>
                <input
                  id="create-movie-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleCreateImageChange}
                />
                <button
                  type="submit"
                  className="bg-quaternary text-white font-bold px-16 py-4 rounded-lg text-lg mt-14 cursor-pointer"
                  style={{ minWidth: 200 }}
                >
                  CRIAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
