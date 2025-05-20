export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-start pt-10">
      <h2 className="text-[50px] font-bold text-center text-white tracking-wider mb-4">
        CRIAR CONTA
      </h2>
      <div className="w-full max-w-md mt-4 pt-4">
        <form className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white"
            >
              Nome
            </label>
            <input
              type="text"
              id="name"
              placeholder="O seu nome"
              className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="email@email.com"
              className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white"
            >
              Confirmar Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="********"
              className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-quaternary hover:bg-red-900  text-sm font-bold tracking-wider text-white rounded-lg mt-5 cursor-pointer"
          >
            CRIAR CONTA
          </button>
        </form>
        <p className="text-center text-sm text-white mt-4">
          Já tens uma conta?{" "}
          <a href="/login" className="text-secondary hover:gray-200">
            Iniciar Sessão
          </a>
        </p>
      </div>
    </div>
  );
}
