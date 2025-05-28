export const Constants = {
  TITLE: "Bem-vindo!",
  SUBTITLE:
    "Descubra a forma mais fácil e rápida de gerir sessões, comprar bilhetes e explorar tudo o que o nosso cinema tem para oferecer.",
  MAIN_TEXT: "Com a aplicação, pode:",
  FUNCTIONALITIES: [
    "Consultar horários e filmes em exibição",
    "Adquirir bilhetes online, com ou sem produtos de bar incluídos",
    "Explorar filmes e horários",
    "Receber notificações sobre novos lançamentos"
  ],
  LOGIN_IN_TEXT:
    "Inicie sessão para aceder às funcionalidades completas e tirar o máximo partido da sua experiência no cinema.",
  LAST_TEXT: "Se ainda não tem conta, crie uma em poucos segundos!",

  HOME_BUTTONS: [
    { label: "Salas", path: "/rooms", permission: "viewRooms" },
    { label: "Filmes", path: "/movies", permission: "viewMovies" },
    { label: "Bilhetes", path: "/tickets", permission: "viewTickets" },
    { label: "Bar", path: "/bar", permission: "viewBar" },
    { label: "Consultas", path: "/consultas", permission: "viewConsultas" }
  ]
};
