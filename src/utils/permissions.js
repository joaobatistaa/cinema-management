export const ROLES = {
  GUEST: "guest",
  CUSTOMER: "customer",
  EMPLOYEE: "employee",
  ADMIN: "admin"
};

export const PERMISSIONS = {
  buyTickets: [ROLES.CUSTOMER, ROLES.EMPLOYEE, ROLES.ADMIN],
  // FILMES
  viewMovies: [ROLES.GUEST, ROLES.CUSTOMER, ROLES.EMPLOYEE, ROLES.ADMIN],
  createMovies: [ROLES.ADMIN],
  updateMovies: [ROLES.ADMIN],

  // SALAS
  viewRooms: [ROLES.ADMIN],

  // BILHETES
  viewTickets: [ROLES.CUSTOMER, ROLES.EMPLOYEE, ROLES.ADMIN],

  // BAR
  viewBar: [ROLES.ADMIN, ROLES.CUSTOMER, ROLES.EMPLOYEE, ROLES.GUEST],

  // CONSULTAS
  viewConsultas: [ROLES.EMPLOYEE, ROLES.ADMIN],

  // TRANSACTIONS
  viewTraansactions: [ROLES.CUSTOMER],  
};

export function hasPermission(role, permission) {
  return PERMISSIONS[permission]?.includes(role);
}
