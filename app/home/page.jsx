"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Constants } from "@/src/constants/main_page";
import { hasPermission } from "@/src/utils/permissions";
import { useAuth } from "@/src/contexts/AuthContext";

const formatSessionDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-PT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export default function HomeDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const userRole = user?.role || "guest";
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mostViewedMovies, setMostViewedMovies] = useState([]);
  const [stats, setStats] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [ticketsStats, setTicketsStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);

  const calculateStats = (tickets) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const dayTickets = tickets.filter(t => new Date(t.datetime) > new Date(now - oneDay));
    const weekTickets = tickets.filter(t => new Date(t.datetime) > new Date(now - 7 * oneDay));
    const monthTickets = tickets.filter(t => new Date(t.datetime) > new Date(now - 30 * oneDay));
    
    const dayRevenue = dayTickets.reduce((sum, t) => sum + t.buy_total, 0);
    const weekRevenue = weekTickets.reduce((sum, t) => sum + t.buy_total, 0);
    const monthRevenue = monthTickets.reduce((sum, t) => sum + t.buy_total, 0);
    const yearRevenue = tickets.reduce((sum, t) => sum + t.buy_total, 0);
    
    setStats([
      { label: "Dia", value: dayTickets.length },
      { label: "Semana", value: weekTickets.length },
      { label: "Mês", value: monthTickets.length },
      { label: "Ano", value: tickets.length }
    ]);
    
    setRevenue([
      { label: "Dia", value: `€${dayRevenue.toFixed(2)}` },
      { label: "Semana", value: `€${weekRevenue.toFixed(2)}` },
      { label: "Mês", value: `€${monthRevenue.toFixed(2)}` },
      { label: "Ano", value: `€${yearRevenue.toFixed(2)}` }
    ]);
  };

  const calculateAdminStats = async (tickets) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Fetch bar transactions
    const transactionsRes = await fetch('/api/transactions');
    const transactions = await transactionsRes.json();
    console.log('Transactions API Response:', transactionsRes);
    console.log('Parsed Transactions Data:', transactions);
    console.log('Is Array:', Array.isArray(transactions));
    console.log('Transactions Count:', transactions?.length || 0);
    
    // Calculate ticket counts
    const dayCount = tickets.filter(t => new Date(t.datetime) > new Date(now - oneDay)).length;
    const weekCount = tickets.filter(t => new Date(t.datetime) > new Date(now - 7 * oneDay)).length;
    const monthCount = tickets.filter(t => new Date(t.datetime) > new Date(now - 30 * oneDay)).length;
    
    // Calculate ticket revenue
    const dayTicketRevenue = tickets
      .filter(t => new Date(t.datetime) > new Date(now - oneDay))
      .reduce((sum, t) => sum + t.buy_total, 0);
      
    const weekTicketRevenue = tickets
      .filter(t => new Date(t.datetime) > new Date(now - 7 * oneDay))
      .reduce((sum, t) => sum + t.buy_total, 0);
      
    const monthTicketRevenue = tickets
      .filter(t => new Date(t.datetime) > new Date(now - 30 * oneDay))
      .reduce((sum, t) => sum + t.buy_total, 0);
      
    const yearTicketRevenue = tickets.reduce((sum, t) => sum + t.buy_total, 0);
    
    // Calculate bar revenue
    const dayBarRevenue = transactions?.length > 0 ? transactions
      .filter(t => new Date(t.date) > new Date(now - oneDay))
      .reduce((sum, t) => sum + (t.total || 0), 0) : 0;
      
    const weekBarRevenue = transactions?.length > 0 ? transactions
      .filter(t => new Date(t.date) > new Date(now - 7 * oneDay))
      .reduce((sum, t) => sum + (t.total || 0), 0) : 0;
      
    const monthBarRevenue = transactions?.length > 0 ? transactions
      .filter(t => new Date(t.date) > new Date(now - 30 * oneDay))
      .reduce((sum, t) => sum + (t.total || 0), 0) : 0;
      
    const yearBarRevenue = transactions?.length > 0 ? transactions
      .reduce((sum, t) => sum + (t.total || 0), 0) : 0;
    
    // Combine ticket and bar revenue
    setTicketsStats([
      { label: "Dia", value: dayCount },
      { label: "Semana", value: weekCount },
      { label: "Mês", value: monthCount },
      { label: "Ano", value: tickets.length }
    ]);
    
    // Set bar revenue stats (only from transactions)
    setRevenueStats([
      { label: "Dia", value: `€${dayBarRevenue.toFixed(2)}` },
      { label: "Semana", value: `€${weekBarRevenue.toFixed(2)}` },
      { label: "Mês", value: `€${monthBarRevenue.toFixed(2)}` },
      { label: "Ano", value: `€${yearBarRevenue.toFixed(2)}` }
    ]);
  };

  useEffect(() => {
    const fetchMostViewedMovies = async () => {
      try {
        const ticketsRes = await fetch('/api/tickets');
        const tickets = await ticketsRes.json();
        
        const movieViews = tickets.reduce((acc, ticket) => {
          const movieId = ticket.movie_id?.toString(); 
          if (movieId) {
            acc[movieId] = (acc[movieId] || 0) + 1;
          }
          return acc;
        }, {});
        
        const moviesRes = await fetch('/api/movies');
        const movies = await moviesRes.json();
        
        const viewedMovies = movies
          .map(movie => ({
            ...movie,
            id: movie.id?.toString(), // Ensure string ID
            views: movieViews[movie.id?.toString()] || 0
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 2);
        
        setMostViewedMovies(viewedMovies);
      } catch (error) {
        console.error('Error fetching most viewed movies:', error);
      }
    };
    
    fetchMostViewedMovies();
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const ticketsRes = await fetch('/api/tickets');
        const tickets = await ticketsRes.json();
        calculateStats(tickets);
        if (userRole === "admin") {
          calculateAdminStats(tickets);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
    
    fetchTickets();
  }, [userRole]);

  useEffect(() => {
    const fetchSessionsAndMovies = async () => {
      try {
        const [sessionsRes, moviesRes] = await Promise.all([
          fetch('/api/sessions'),
          fetch('/api/movies')
        ]);
        
        const sessions = await sessionsRes.json();
        const movies = await moviesRes.json();

        const movieMap = movies.reduce((acc, movie) => {
          acc[movie.id] = movie;
          return acc;
        }, {});

        const now = new Date();

        const processedSessions = sessions
          .map(session => ({
            ...session,
            date: new Date(session.date),
            movie: movieMap[session.movieId]
          }))
          .filter(session => session.date > now && session.movie)
          .sort((a, b) => a.date - b.date)
          .slice(0, 4);

        setUpcomingSessions(processedSessions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionsAndMovies();
  }, []);

  if (user === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const renderSessionsGrid = (isAdminView = false) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {isLoading ? (
        Array(4).fill(0).map((_, idx) => (
          <div key={`${isAdminView ? 'admin' : 'customer'}-loading-${idx}`} 
               className="bg-primary rounded p-3 flex flex-col items-center shadow h-48 animate-pulse">
            <div className="w-32 h-24 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-20"></div>
          </div>
        ))
      ) : upcomingSessions.length > 0 ? (
        upcomingSessions.map((session) => (
          <Link 
            href={`/sessions?movie=${session.movieId}`}
            key={`${isAdminView ? 'admin' : 'customer'}-${session.id}`}
            className="bg-primary rounded p-3 flex flex-col items-center shadow hover:scale-105 transition-transform duration-200"
          >
            <Image
              src={session.movie?.image || '/images/movies/default.jpg'}
              alt={session.movie?.title || 'Filme'}
              width={130}
              height={120}
              className="rounded mb-2 object-cover h-30 w-full"
            />
            <span className="text-white text-center font-semibold text-sm">
              {session.movie?.title || 'Filme Desconhecido'}
            </span>
            <span className="text-gray text-xs mt-1">
              {formatSessionDate(session.date)}
            </span>
            <span className="text-gray-400 text-xs mt-1">
              Sala: {session.room}
            </span>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center text-gray-400 py-4">
          Nenhuma sessão disponível em breve.
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col gap-4 p-8">
        {userRole === "customer" ? (
          <>
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Olá, {user?.name || "Utilizador"}
              </h2>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                PRÓXIMAS SESSÕES
              </h2>
              {renderSessionsGrid()}
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                FILMES MAIS VISUALIZADOS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mostViewedMovies.map((movie) => (
                  <Link
                    href={`/movies/${movie.id}`}
                    key={`movie-${movie.id}`}
                    className="bg-primary rounded p-3 flex flex-col items-center shadow hover:scale-105 transition-transform duration-200"
                  >
                    <Image
                      src={movie.image || '/images/movies/default.jpg'}
                      alt={movie.title || 'Filme'}
                      width={130}
                      height={120}
                      className="rounded mb-2 object-cover h-30 w-full"
                    />
                    <span className="text-white text-center font-semibold text-sm">
                      {movie.title || 'Filme Desconhecido'}
                    </span>
                    <span className="text-gray text-xs mt-1">
                      {movie.views} visualizações
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {userRole === "admin" && (
              <>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    BILHETES VENDIDOS
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-3">
                    {ticketsStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-secondary rounded-xl p-6 flex flex-col items-center shadow text-white"
                      >
                        <span className="text-md text-secondary">{stat.label}</span>
                        <span className="text-xl font-medium mt-2">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    RECEITA DE VENDAS (BAR)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-3">
                    {revenueStats.map((rev) => (
                      <div
                        key={rev.label}
                        className="bg-secondary rounded-xl p-6 flex flex-col items-center shadow text-white"
                      >
                        <span className="text-md text-secondary">{rev.label}</span>
                        <span className="text-xl font-medium mt-2">
                          {rev.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">
                PRÓXIMAS SESSÕES
              </h2>
              {renderSessionsGrid(userRole !== "customer")}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col justify-between h-full py-8 px-4 min-w-[200px]">
        <div className="flex flex-col gap-4">
          {Constants.HOME_BUTTONS.filter((btn) =>
            hasPermission(userRole, btn.permission)
          ).map((btn) => (
            <button
              key={btn.label}
              className="bg-quaternary text-white py-5 px-4 rounded-lg text-xl cursor-pointer"
              onClick={() => router.push(btn.path)}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <button
          className="bg-quinary text-white py-5 px-4 rounded-lg text-xl mt-8 cursor-pointer"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          SAIR
        </button>
      </div>
    </div>
  );
}
