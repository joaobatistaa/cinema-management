"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@mui/material";
import { MOVIE_GENRES } from "@/src/constants/movies";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

export default function AddMoviePage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    cast: "",
    duration: "",
    rating: "",
    genre: "",
    year: "",
    director: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.title ||
      !form.summary ||
      !form.cast ||
      !form.duration ||
      !form.rating ||
      !form.genre ||
      !form.year ||
      !form.director ||
      !imageFile
    ) {
      toast.error("Preencha todos os campos e selecione uma imagem.");
      return;
    }
    setSaving(true);
    try {
      const imagePath = "/images/movies/" + imageFile.name;
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: imagePath })
      });
      if (!res.ok) throw new Error("Erro ao adicionar filme.");
      toast.success("Filme adicionado com sucesso!");
      router.push("/movies");
    } catch (err) {
      toast.error(err.message || "Erro ao adicionar filme.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="relative w-full flex-1 flex flex-col overflow-hidden">
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
              NOVO FILME
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-row w-full h-full bg-primary p-10 gap-5 overflow-hidden"
          style={{ minHeight: 0 }}
        >
          {/* Esquerda */}
          <div className="flex flex-col flex-grow max-w-4xl">
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-white font-semibold tracking-wider mb-1"
              >
                NOME DO FILME
              </label>
              <input
                id="title"
                className="w-full px-3 py-1.5 rounded-lg bg-primary text-gray-200 border-2 border-white"
                value={form.title}
                name="title"
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-row gap-4 mb-10">
              <div className="flex flex-col w-2/3">
                <label
                  htmlFor="summary"
                  className="block text-white font-semibold tracking-wider mb-1"
                >
                  RESUMO
                </label>
                <div className="border-2 border-white rounded-xl p-2 h-[223px]">
                  <textarea
                    id="summary"
                    name="summary"
                    placeholder="Resumo do filme..."
                    value={form.summary}
                    onChange={handleChange}
                    required
                    rows={7}
                    className="w-full h-full p-2 pr-4 text-sm text-gray-200 bg-transparent border-none outline-none overflow-y-auto custom-scroll resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col w-1/3">
                <label
                  htmlFor="cast"
                  className="block text-white font-semibold tracking-wider mb-1"
                >
                  ELENCO
                </label>
                <div className="border-2 border-white rounded-xl p-2 h-[223px] flex-1">
                  <textarea
                    id="cast"
                    name="cast"
                    placeholder="Elenco do filme..."
                    value={form.cast}
                    onChange={handleChange}
                    required
                    rows={7}
                    className="w-full h-full p-2 pr-4 text-sm text-gray-200 bg-transparent border-none outline-none overflow-y-auto custom-scroll resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-4 mb-6">
              <div className="flex flex-col w-1/4">
                <label
                  htmlFor="duration"
                  className="block text-sm text-white font-semibold mb-1"
                >
                  DURAÇÃO
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full px-3 py-1.5 rounded-lg bg-primary text-gray-200 border-2 border-white"
                  value={form.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col w-1/4">
                <label
                  htmlFor="rating"
                  className="block text-sm text-white font-semibold mb-1"
                >
                  CLASSIFICAÇÃO
                </label>
                <input
                  id="rating"
                  name="rating"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1}
                  max={18}
                  className="w-full px-3 py-1.5 rounded-lg bg-primary text-gray-200 border-2 border-white"
                  value={form.rating}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col w-1/4">
                <label
                  htmlFor="genre"
                  className="block text-sm text-white font-semibold mb-1"
                >
                  GÉNERO
                </label>
                <select
                  id="genre"
                  name="genre"
                  className="w-full px-3 py-1.5 rounded-lg bg-primary text-gray-200 border-2 border-white"
                  value={form.genre}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {MOVIE_GENRES.map((g) => (
                    <option key={g} value={g} className="text-white">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col w-1/4">
                <label
                  htmlFor="year"
                  className="block text-sm text-white font-semibold mb-1"
                >
                  ANO LANÇAMENTO
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1800}
                  max={currentYear}
                  className="w-full px-3 py-1.5 rounded-lg bg-primary text-gray-200 border-2 border-white"
                  value={form.year}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="director"
                className="block text-white font-semibold tracking-wider mb-1"
              >
                REALIZAÇÃO
              </label>
              <input
                id="director"
                name="director"
                className="w-full px-3 py-1.5 rounded-lg bg-primary text-gray-200 border-2 border-white"
                value={form.director}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Direita */}
          <div className="flex flex-col items-center flex-shrink-0 min-w-[250px] max-w-[350px]">
            <div
              className="relative w-[264px] h-[400px] mb-6 rounded-lg flex items-center justify-center bg-white cursor-pointer hover:opacity-90"
              onClick={() => fileInputRef.current.click()}
              role="button"
              aria-label="Selecionar imagem de capa do filme"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Capa do Filme"
                  fill
                  style={{ objectFit: "cover", borderRadius: "0.5rem" }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-900">
                  <FileUploadOutlinedIcon style={{ fontSize: 100 }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              className="w-[94%] py-3"
              style={{
                marginTop: "auto",
                backgroundColor: "#f74346",
                color: "#fff",
                fontWeight: "semibold"
              }}
            >
              {saving ? "A adicionar..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
