export const ROLES = {
  GUEST: "guest",
  CUSTOMER: "customer",
  EMPLOYEE: "employee",
  ADMIN: "admin"
};

export const PERMISSIONS = {
  viewMovies: [ROLES.GUEST, ROLES.CUSTOMER, ROLES.EMPLOYEE, ROLES.ADMIN],
  buyTickets: [ROLES.CUSTOMER, ROLES.EMPLOYEE, ROLES.ADMIN],
  createMovies: [ROLES.ADMIN],
  updateMovies: [ROLES.ADMIN],
  viewRooms: [ROLES.EMPLOYEE, ROLES.ADMIN],
  viewSessions: [ROLES.EMPLOYEE, ROLES.ADMIN],
  viewTickets: [ROLES.CUSTOMER, ROLES.EMPLOYEE, ROLES.ADMIN],
  viewBar: [ROLES.EMPLOYEE, ROLES.ADMIN],
  viewConsultas: [ROLES.ADMIN]
};

export function hasPermission(role, permission) {
  return PERMISSIONS[permission]?.includes(role);
}
