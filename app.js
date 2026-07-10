const todayIso = new Date().toISOString().slice(0, 10);

function makeId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  if (!cryptoApi?.getRandomValues) {
    return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0").slice(-12)}`;
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ cryptoApi.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(char) / 4).toString(16)
  );
}

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedState));
}

const defaultUsers = [
  {
    id: "admin",
    name: "Administrador",
    role: "Administrador",
    specialty: "Gestión general",
    room: "Oficina administrativa",
    shift: "Acceso completo",
    pin: "0000"
  },
  {
    id: "rivera",
    name: "Dra. Rivera",
    role: "Doctor",
    specialty: "Rehabilitación oral",
    room: "Consultorio 2",
    shift: "8:00 a. m. - 5:00 p. m.",
    pin: "1234"
  },
  {
    id: "santos",
    name: "Dr. Santos",
    role: "Doctor",
    specialty: "Endodoncia",
    room: "Consultorio 1",
    shift: "9:00 a. m. - 6:00 p. m.",
    pin: "2468"
  },
  {
    id: "mendez",
    name: "Dra. Méndez",
    role: "Doctor",
    specialty: "Ortodoncia",
    room: "Consultorio 3",
    shift: "10:00 a. m. - 7:00 p. m.",
    pin: "4321"
  },
  {
    id: "recepcion",
    name: "Recepción",
    role: "Recepción",
    specialty: "Admisión y cobros",
    room: "Recepción",
    shift: "7:30 a. m. - 6:00 p. m.",
    pin: "1111"
  },
  {
    id: "rrhh",
    name: "Recursos Humanos",
    role: "Recursos Humanos",
    specialty: "Personal y permisos",
    room: "Oficina RRHH",
    shift: "8:00 a. m. - 5:00 p. m.",
    pin: "2222"
  },
  {
    id: "contabilidad",
    name: "Contabilidad",
    role: "Contabilidad",
    specialty: "Cobros y cuentas",
    room: "Oficina contable",
    shift: "8:00 a. m. - 5:00 p. m.",
    pin: "3333"
  },
  {
    id: "laboratorio",
    name: "Laboratorio",
    role: "Laboratorio",
    specialty: "Piezas y trabajos dentales",
    room: "Laboratorio dental",
    shift: "8:00 a. m. - 5:00 p. m.",
    pin: "4444"
  }
];
let users = loadUsers();

const rolePermissions = {
  Administrador: {
    views: ["dashboard", "receptionPanel", "usersPanel", "hrPanel", "laboratoryPanel", "accountingPanel", "patients", "selfService", "agenda", "odontogram", "treatments", "billing", "inventory", "reports", "adminPanel"],
    actions: ["patients:create", "appointments:create", "appointments:confirm", "odontogram:edit", "clinical-documents:create", "treatments:create", "treatments:progress", "payments:create", "payroll:manage", "users:create", "inventory:manage", "settings:manage", "selfservice:clinical", "selfservice:employee", "selfservice:manage", "laboratory:manage"],
    scope: "all"
  },
  Doctor: {
    views: ["dashboard", "selfService", "patients", "agenda", "odontogram", "treatments", "inventory"],
    actions: ["patients:create", "appointments:confirm", "odontogram:edit", "clinical-documents:create", "treatments:create", "treatments:progress", "selfservice:clinical"],
    scope: "own"
  },
  Recepción: {
    views: ["receptionPanel", "patients", "selfService", "agenda", "billing", "inventory", "reports"],
    actions: ["patients:create", "appointments:create", "appointments:confirm", "payments:create", "inventory:manage", "selfservice:employee", "selfservice:manage"],
    scope: "all"
  },
  "Recursos Humanos": {
    views: ["hrPanel", "selfService"],
    actions: ["payroll:manage", "selfservice:employee", "selfservice:manage"],
    scope: "all"
  },
  Contabilidad: {
    views: ["accountingPanel", "selfService", "billing", "inventory", "reports"],
    actions: ["payments:create", "inventory:manage", "selfservice:employee"],
    scope: "all"
  },
  Laboratorio: {
    views: ["laboratoryPanel"],
    actions: ["laboratory:manage"],
    scope: "all"
  }
};

let doctors = users.filter((user) => user.role === "Doctor");
let userPermissionOverrides = loadUserPermissionOverrides();

const payrollSeed = {
  admin: { base: 85000, bonus: 0, deductions: 5200, status: "Pendiente" },
  rivera: { base: 0, bonus: 0, deductions: 0, status: "Pendiente" },
  santos: { base: 0, bonus: 0, deductions: 0, status: "Pendiente" },
  mendez: { base: 0, bonus: 0, deductions: 0, status: "Pendiente" },
  recepcion: { base: 48000, bonus: 3500, deductions: 2800, status: "Pendiente" },
  rrhh: { base: 62000, bonus: 4500, deductions: 3600, status: "Pendiente" },
  contabilidad: { base: 68000, bonus: 5000, deductions: 4100, status: "Pendiente" },
  laboratorio: { base: 52000, bonus: 3000, deductions: 2400, status: "Pendiente" }
};

const procedurePointCatalog = [
  { name: "Evaluación General", points: 1, value: 100 },
  { name: "Evaluación Especial", points: 2, value: 200 },
  { name: "Exodoncia Leche", points: 1, value: 100 },
  { name: "Exodoncia Uni", points: 2, value: 200 },
  { name: "Exodoncia Multi", points: 3, value: 300 },
  { name: "Colgajos", points: 3, value: 300 },
  { name: "Control Placa", points: 1, value: 100 },
  { name: "Dentición Subior", points: 1, value: 100 },
  { name: "Denticion Superior", points: 1, value: 100 }
];

const seedState = {
  patients: [
    {
      id: makeId(),
      name: "María Gómez",
      phone: "809-555-0184",
      email: "maria.gomez@email.com",
      document: "001-1284567-9",
      birthdate: "1988-09-14",
      gender: "Femenino",
      address: "Ensanche Naco, Santo Domingo",
      emergency: "Ana Gómez · 809-555-0199",
      bloodType: "O+",
      insurance: "ARS Universal",
      allergies: "Penicilina",
      conditions: "Hipertensión controlada.",
      medications: "Losartán 50 mg.",
      clinicalHistory: "Restauración previa en 36. Sensibilidad al frío en molares inferiores.",
      photo: "",
      lastVisit: "2026-05-16",
      notes: "Sensibilidad en molares inferiores.",
      balance: 4200,
      status: "Activo"
    },
    {
      id: makeId(),
      name: "Carlos Pérez",
      phone: "829-555-0142",
      email: "carlos.perez@email.com",
      document: "402-3332191-1",
      birthdate: "1996-02-03",
      gender: "Masculino",
      address: "Villa Mella, Santo Domingo Norte",
      emergency: "Luis Pérez · 829-555-0188",
      bloodType: "A+",
      insurance: "Privado",
      allergies: "Ninguna",
      conditions: "Sin condiciones sistémicas reportadas.",
      medications: "Ninguno.",
      clinicalHistory: "Ortodoncia activa. Controles mensuales sin complicaciones.",
      photo: "",
      lastVisit: "2026-05-10",
      notes: "Control de ortodoncia mensual.",
      balance: 0,
      status: "Activo"
    },
    {
      id: makeId(),
      name: "Lucía Mateo",
      phone: "849-555-0118",
      email: "lucia.mateo@email.com",
      document: "031-7119204-6",
      birthdate: "1979-11-22",
      gender: "Femenino",
      address: "Los Prados, Santo Domingo",
      emergency: "Raúl Mateo · 849-555-0180",
      bloodType: "B+",
      insurance: "Senasa",
      allergies: "Látex",
      conditions: "Diabetes tipo 2.",
      medications: "Metformina 850 mg.",
      clinicalHistory: "Endodoncia indicada en 26. Pendiente corona provisional.",
      photo: "",
      lastVisit: "2026-04-28",
      notes: "Pendiente corona provisional.",
      balance: 11800,
      status: "Seguimiento"
    }
  ],
  appointments: [],
  treatments: [],
  payments: [],
  diagnoses: [],
  evolutions: [],
  clinicalDocuments: [],
  patientPlates: [],
  selfServiceRequests: [],
  inventory: [],
  settings: {},
  payroll: [],
  payrollNovelties: [],
  hrAttendance: [],
  hrVacations: [],
  hrShifts: [],
  hrEvaluations: [],
  cashOpenings: [],
  cashClosings: [],
  odontogramHistory: [],
  odontograms: {}
};

seedState.appointments = [
  {
    id: makeId(),
    patientId: seedState.patients[0].id,
    doctorId: "rivera",
    date: todayIso,
    time: "09:00",
    duration: 30,
    type: "Evaluación",
    reminder: "24 horas antes",
    status: "Confirmada"
  },
  {
    id: makeId(),
    patientId: seedState.patients[1].id,
    doctorId: "mendez",
    date: todayIso,
    time: "11:30",
    duration: 45,
    type: "Ortodoncia",
    reminder: "1 hora antes",
    status: "Pendiente"
  },
  {
    id: makeId(),
    patientId: seedState.patients[2].id,
    doctorId: "santos",
    date: "2026-05-20",
    time: "15:00",
    duration: 60,
    type: "Endodoncia",
    reminder: "48 horas antes",
    status: "Confirmada"
  }
];

seedState.treatments = [
  {
    id: makeId(),
    patientId: seedState.patients[0].id,
    doctorId: "rivera",
    name: "Evaluación General",
    cost: 6200,
    progress: 100,
    status: "Completado",
    procedurePoints: 1,
    procedureValue: 100
  },
  {
    id: makeId(),
    patientId: seedState.patients[1].id,
    doctorId: "mendez",
    name: "Control Placa",
    cost: 3500,
    progress: 70,
    status: "En curso",
    procedurePoints: 1,
    procedureValue: 100
  },
  {
    id: makeId(),
    patientId: seedState.patients[2].id,
    doctorId: "santos",
    name: "Exodoncia Multi",
    cost: 18000,
    progress: 100,
    status: "Completado",
    procedurePoints: 3,
    procedureValue: 300
  }
];

seedState.diagnoses = [
  {
    id: makeId(),
    patientId: seedState.patients[0].id,
    doctorId: "rivera",
    date: todayIso,
    title: "Caries oclusal en 36",
    priority: "Media",
    notes: "Lesión activa con sensibilidad al frío. Indicar restauración con resina."
  },
  {
    id: makeId(),
    patientId: seedState.patients[2].id,
    doctorId: "santos",
    date: "2026-05-18",
    title: "Necrosis pulpar en 26",
    priority: "Alta",
    notes: "Dolor espontáneo nocturno. Se recomienda endodoncia y corona posterior."
  }
];

seedState.evolutions = [
  {
    id: makeId(),
    patientId: seedState.patients[0].id,
    doctorId: "rivera",
    date: "2026-05-16",
    note: "Se realiza evaluación inicial. Paciente refiere sensibilidad en molares inferiores."
  },
  {
    id: makeId(),
    patientId: seedState.patients[1].id,
    doctorId: "mendez",
    date: "2026-05-10",
    note: "Control de ortodoncia sin molestias. Se ajusta arco superior."
  }
];

seedState.clinicalDocuments = [
  {
    id: makeId(),
    patientId: seedState.patients[0].id,
    type: "Consentimiento informado",
    title: "Consentimiento para restauración",
    note: "Paciente acepta procedimiento restaurativo y cuidados posteriores.",
    date: todayIso,
    createdBy: "rivera"
  }
];

seedState.inventory = [
  { id: makeId(), name: "Resina compuesta A2", stock: 8, min: 5, price: 950, expiry: "2026-12-30", provider: "Dental Supply RD" },
  { id: makeId(), name: "Anestesia lidocaína", stock: 3, min: 6, price: 450, expiry: "2026-08-15", provider: "Medident" },
  { id: makeId(), name: "Guantes nitrilo", stock: 24, min: 10, price: 350, expiry: "2027-01-01", provider: "Nova Insumos" }
];

seedState.settings = {
  clinicName: "NovaClinic",
  clinicPhone: "809-555-0100",
  clinicAddress: "Santo Domingo, República Dominicana",
  clinicTaxId: "RNC-000000",
  clinicCurrency: "DOP"
};

seedState.payroll = users.map((user) => ({
  id: makeId(),
  userId: user.id,
  period: "Mayo 2026",
  base: payrollSeed[user.id]?.base || 45000,
  bonus: payrollSeed[user.id]?.bonus || 0,
  deductions: payrollSeed[user.id]?.deductions || 0,
  status: payrollSeed[user.id]?.status || "Pendiente"
}));

seedState.hrShifts = [
  { id: makeId(), userId: "recepcion", name: "Apertura", area: "Recepción", start: "08:00", end: "16:00", day: "Lunes a viernes" },
  { id: makeId(), userId: "contabilidad", name: "Caja", area: "Contabilidad", start: "08:00", end: "17:00", day: "Lunes a viernes" },
  { id: makeId(), userId: "rrhh", name: "Administrativo", area: "Recursos Humanos", start: "08:30", end: "17:30", day: "Lunes a viernes" },
  { id: makeId(), userId: "rivera", name: "Consulta mañana", area: "Odontología", start: "09:00", end: "13:00", day: "Lunes a viernes" },
  { id: makeId(), userId: "mendez", name: "Consulta tarde", area: "Ortodoncia", start: "14:00", end: "18:00", day: "Lunes a viernes" }
];

seedState.payments = [
  {
    id: makeId(),
    patientId: seedState.patients[1].id,
    doctorId: "mendez",
    amount: 3500,
    method: "Tarjeta",
    reference: "POS-1842",
    receiptNumber: "REC-20260518-001",
    date: "2026-05-18",
    concept: "Ajuste de ortodoncia"
  }
];

let state = loadState();
let selectedTooth = null;
let currentUser = null;
let selectedUserId = "admin";
let editingUserId = null;
let editingPatientId = null;
let editingAppointmentId = null;
let patientCameraStream = null;
let capturedPatientPhoto = "";
let selectedSelfServicePatientId = null;

const currency = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0
});

const views = {
  dashboard: "Panel doctores",
  receptionPanel: "Panel recepción",
  usersPanel: "Panel usuarios",
  hrPanel: "Panel recursos humanos",
  laboratoryPanel: "Panel laboratorio",
  accountingPanel: "Panel contabilidad",
  patients: "Pacientes",
  selfService: "Autoservicio",
  agenda: "Agenda",
  odontogram: "Odontograma",
  treatments: "Tratamientos",
  billing: "Facturación",
  inventory: "Almacén",
  reports: "Reportes",
  adminPanel: "Administración"
};

const panelViews = ["dashboard", "receptionPanel", "usersPanel", "hrPanel", "laboratoryPanel", "accountingPanel"];

const permissionCatalog = [
  { view: "dashboard", label: "Panel Doctores", panel: "Paneles", actions: [] },
  { view: "receptionPanel", label: "Panel Recepción", panel: "Paneles", actions: [] },
  { view: "usersPanel", label: "Panel Usuarios", panel: "Paneles", actions: [] },
  { view: "hrPanel", label: "Panel Recursos Humanos", panel: "Paneles", actions: ["payroll:manage"] },
  { view: "laboratoryPanel", label: "Panel Laboratorio", panel: "Paneles", actions: ["laboratory:manage"] },
  { view: "accountingPanel", label: "Panel Contabilidad", panel: "Paneles", actions: [] },
  { view: "patients", label: "Pacientes", panel: "Recepción", actions: ["patients:create"] },
  { view: "selfService", label: "Autoservicio", panel: "Recepción", actions: ["appointments:confirm", "selfservice:clinical", "selfservice:employee", "selfservice:manage"] },
  { view: "agenda", label: "Agenda", panel: "Recepción", actions: ["appointments:create", "appointments:confirm"] },
  { view: "billing", label: "Facturación", panel: "Contabilidad", actions: ["payments:create"] },
  { view: "odontogram", label: "Expediente odontológico", panel: "Doctores", actions: ["odontogram:edit"] },
  { view: "treatments", label: "Tratamientos", panel: "Doctores", actions: ["treatments:create", "treatments:progress"] },
  { view: "inventory", label: "Almacén de productos", panel: "Caja y almacén", actions: ["inventory:manage"] },
  { view: "reports", label: "Reportes", panel: "Contabilidad", actions: [] },
  { view: "adminPanel", label: "Administración", panel: "Paneles", actions: ["settings:manage"] }
];

const panelModules = {
  dashboard: ["selfService", "patients", "agenda", "odontogram", "treatments", "inventory"],
  receptionPanel: ["patients", "selfService", "agenda", "billing", "inventory", "reports"],
  hrPanel: ["selfService"],
  laboratoryPanel: [],
  accountingPanel: ["selfService", "billing", "inventory", "reports", "adminPanel"]
};

const selfServiceActionsByRole = {
  Administrador: ["selfservice:clinical", "selfservice:employee", "selfservice:manage"],
  Doctor: ["selfservice:clinical"],
  Recepción: ["selfservice:employee", "selfservice:manage"],
  "Recursos Humanos": ["selfservice:employee", "selfservice:manage"],
  Contabilidad: ["selfservice:employee"]
};

userPermissionOverrides = normalizeUserPermissionOverrides(userPermissionOverrides);

document.addEventListener("DOMContentLoaded", () => {
  bindAuth();
  bindNavigation();
  bindForms();
  restoreSession();
  render();
});

function loadState() {
  const saved = localStorage.getItem("novaclinic-state");
  if (!saved) return cloneSeed();

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return cloneSeed();
  }
}

function normalizeState(loadedState) {
  const next = { ...cloneSeed(), ...loadedState };
  next.inventory = (next.inventory || []).map((item) => ({ price: 0, ...item }));
  next.payments = (next.payments || []).map((payment) => ({
    type: "Servicio",
    billTo: "patient",
    cashierId: payment.createdBy || "",
    attendedDoctorId: payment.doctorId || "",
    ...payment
  }));
  next.cashOpenings ||= [];
  next.cashClosings ||= [];
  next.hrAttendance ||= [];
  next.hrVacations ||= [];
  next.hrShifts = Array.isArray(next.hrShifts) && next.hrShifts.length ? next.hrShifts : cloneSeed().hrShifts;
  next.hrEvaluations ||= [];
  next.patientPlates ||= [];
  next.selfServiceRequests ||= [];
  return next;
}

function saveState() {
  localStorage.setItem("novaclinic-state", JSON.stringify(state));
}

function loadUsers() {
  const saved = localStorage.getItem("novaclinic-users");
  if (!saved) return [...defaultUsers];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultUsers];
  } catch {
    return [...defaultUsers];
  }
}

function saveUsers() {
  localStorage.setItem("novaclinic-users", JSON.stringify(users));
  doctors = users.filter((user) => user.role === "Doctor");
}

function loadUserPermissionOverrides() {
  const saved = localStorage.getItem("novaclinic-user-permissions");
  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function normalizeUserPermissionOverrides(overrides) {
  let changed = false;
  const normalized = Object.fromEntries(
    Object.entries(overrides || {}).map(([userId, override]) => {
      const viewsList = Array.isArray(override.views) ? override.views : [];
      const actionList = new Set(Array.isArray(override.actions) ? override.actions : []);

      viewsList.forEach((viewName) => {
        const catalogItem = permissionCatalog.find((item) => item.view === viewName);
        const user = users.find((item) => item.id === userId);
        const actions = viewName === "selfService" ? allowedSelfServiceActionsForRole(user?.role) : catalogItem?.actions || [];
        actions.forEach((action) => actionList.add(action));
      });

      const next = {
        views: [...new Set(viewsList)],
        actions: [...actionList]
      };

      if (next.views.length !== viewsList.length || next.actions.length !== (override.actions || []).length) {
        changed = true;
      }

      return [userId, next];
    })
  );

  if (changed) {
    localStorage.setItem("novaclinic-user-permissions", JSON.stringify(normalized));
  }

  return normalized;
}

function saveUserPermissionOverrides() {
  localStorage.setItem("novaclinic-user-permissions", JSON.stringify(userPermissionOverrides));
}

function bindNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (canView(button.dataset.view)) {
        setView(button.dataset.view);
      }
    });
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view-jump]");
    if (!button) return;
    const viewName = button.dataset.viewJump;
    if (canView(viewName)) {
      setView(viewName);
    }
  });

  document.getElementById("globalSearch").addEventListener("input", renderPatients);
  document.getElementById("userSearch").addEventListener("input", renderUsersPanel);
  document.getElementById("userRoleFilter").addEventListener("change", renderUsersPanel);
  document.getElementById("agendaDateFilter").addEventListener("change", renderAgenda);
  document.getElementById("agendaStatusFilter").addEventListener("change", renderAgenda);
  document.getElementById("todayAgendaButton").addEventListener("click", () => {
    document.getElementById("agendaDateFilter").value = todayIso;
    renderAgenda();
  });
}

function bindAuth() {
  populateUserLogin();

  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const user = users.find((item) => item.id === value("userLogin"));
    const pin = value("userPin");

    if (!user || user.pin !== pin) {
      document.getElementById("loginError").textContent = "PIN incorrecto para el usuario seleccionado.";
      return;
    }

    localStorage.setItem("novaclinic-current-user", user.id);
    localStorage.removeItem("novaclinic-current-doctor");
    document.getElementById("userPin").value = "";
    document.getElementById("loginError").textContent = "";
    applyUserSession(user);
  });

  document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("novaclinic-current-user");
    localStorage.removeItem("novaclinic-current-doctor");
    currentUser = null;
    document.getElementById("appShell").classList.add("is-locked");
    document.getElementById("loginScreen").classList.remove("is-hidden");
    document.getElementById("currentShift").textContent = "Sin sesion";
    document.getElementById("currentShiftMeta").textContent = "Selecciona un usuario para entrar";
    document.getElementById("doctorBadge").textContent = "Sin sesion";
  });
}

function populateUserLogin() {
  const userSelect = document.getElementById("userLogin");
  const current = userSelect.value;
  userSelect.innerHTML = users
    .map((user) => `<option value="${user.id}">${user.name} · ${user.role}</option>`)
    .join("");
  if (current && users.some((user) => user.id === current)) {
    userSelect.value = current;
  }
}

function restoreSession() {
  const userId = localStorage.getItem("novaclinic-current-user") || localStorage.getItem("novaclinic-current-doctor");
  const user = users.find((item) => item.id === userId);
  if (user) {
    applyUserSession(user);
    return;
  }

  document.getElementById("appShell").classList.add("is-locked");
  document.getElementById("loginScreen").classList.remove("is-hidden");
}

function applyUserSession(user) {
  currentUser = user;
  document.getElementById("appShell").classList.remove("is-locked");
  document.getElementById("loginScreen").classList.add("is-hidden");
  document.getElementById("currentShift").textContent = user.name;
  document.getElementById("currentShiftMeta").textContent = `${user.role} · ${user.room} · ${user.shift}`;
  document.getElementById("doctorBadge").textContent = `${user.name} · ${user.role}`;
  applyPermissions();
  render();
}

function openUserForm(userId = null) {
  editingUserId = userId;
  const user = users.find((item) => item.id === userId);
  const payroll = user ? normalizedPayroll().find((item) => item.userId === user.id) : null;

  document.getElementById("userDialogTitle").textContent = user ? "Editar usuario" : "Nuevo usuario";
  document.getElementById("userDialogDescription").textContent = user
    ? "Actualiza acceso, rol y datos operativos."
    : "Registra acceso, rol y datos operativos.";
  document.getElementById("saveUserButton").textContent = user ? "Guardar cambios" : "Crear usuario";

  document.getElementById("newUserName").value = user?.name || "";
  document.getElementById("newUserPin").value = user?.pin || "";
  document.getElementById("newUserRole").value = user?.role || "Doctor";
  document.getElementById("newUserSpecialty").value = user?.specialty || "";
  document.getElementById("newUserRoom").value = user?.room || "";
  document.getElementById("newUserShift").value = user?.shift || "";
  document.getElementById("newUserBase").value = payroll?.base ?? (user?.role === "Doctor" ? 0 : 45000);
  document.getElementById("newUserBonus").value = payroll?.bonus ?? 0;
  document.getElementById("newUserDeductions").value = payroll?.deductions ?? 0;
  document.getElementById("userDialog").showModal();
}

function closeUserForm() {
  editingUserId = null;
  document.getElementById("userForm").reset();
  document.getElementById("userDialog").close();
}

function saveUserFromForm() {
  const existing = users.find((item) => item.id === editingUserId);
  const previousRole = existing?.role;
  const user = existing || { id: makeUserId(value("newUserName")) };
  user.name = value("newUserName");
  user.role = value("newUserRole");
  user.specialty = value("newUserSpecialty") || user.role;
  user.room = value("newUserRoom") || "Sin ubicación";
  user.shift = value("newUserShift") || "Sin turno asignado";
  user.pin = value("newUserPin");

  if (!existing) {
    users.push(user);
    const defaults = rolePermissions[user.role] || rolePermissions["Recepción"];
    userPermissionOverrides[user.id] = {
      views: [...defaults.views],
      actions: [...defaults.actions]
    };
    saveUserPermissionOverrides();
  } else if (previousRole !== user.role) {
    const defaults = rolePermissions[user.role] || rolePermissions["Recepción"];
    userPermissionOverrides[user.id] = {
      views: [...defaults.views],
      actions: [...defaults.actions]
    };
    saveUserPermissionOverrides();
  }

  saveUsers();
  upsertPayrollForUser(user);
  if (currentUser?.id === user.id) applyUserSession(user);
  return user;
}

function upsertPayrollForUser(user) {
  state.payroll ||= [];
  let payroll = state.payroll.find((item) => item.userId === user.id);
  if (!payroll) {
    payroll = {
      id: makeId(),
      userId: user.id,
      period: "Mayo 2026",
      status: "Pendiente"
    };
    state.payroll.push(payroll);
  }
  payroll.base = user.role === "Doctor" ? 0 : Number(value("newUserBase")) || 0;
  payroll.bonus = user.role === "Doctor" ? 0 : Number(value("newUserBonus")) || 0;
  payroll.deductions = user.role === "Doctor" ? 0 : Number(value("newUserDeductions")) || 0;
}

function openPatientForm(patientId = null) {
  editingPatientId = patientId;
  const patient = state.patients.find((item) => item.id === patientId);
  capturedPatientPhoto = patient?.photo || "";
  document.getElementById("patientDialogTitle").textContent = patient ? "Editar paciente" : "Nuevo paciente";
  document.getElementById("patientDialogDescription").textContent = patient ? "Actualiza los datos del expediente." : "Completa el expediente inicial.";
  document.getElementById("savePatientButton").textContent = patient ? "Guardar cambios" : "Guardar paciente";

  document.getElementById("patientName").value = patient?.name || "";
  document.getElementById("patientPhone").value = patient?.phone || "";
  document.getElementById("patientEmail").value = patient?.email || "";
  document.getElementById("patientDocumentType").value = normalizeDocumentType(patient?.documentType);
  document.getElementById("patientNationality").value = patient?.nationality || "Dominicano";
  document.getElementById("patientDocument").value = patient?.document || "";
  document.getElementById("patientBirthdate").value = patient?.birthdate || "";
  document.getElementById("patientIsMinor").checked = Boolean(patient?.isMinor) || isMinor(patient?.birthdate);
  document.getElementById("patientGender").value = patient?.gender || "Femenino";
  document.getElementById("patientAddress").value = patient?.address || "";
  const emergency = splitEmergencyContact(patient);
  document.getElementById("patientEmergencyName").value = emergency.name;
  document.getElementById("patientEmergencyPhone").value = emergency.phone;
  document.getElementById("patientEmergencyRelation").value = emergency.relation;
  document.getElementById("patientBloodType").value = patient?.bloodType || "";
  document.getElementById("patientInsurance").value = patient?.insurance || "Sin seguro";
  document.getElementById("patientAllergies").value = patient?.allergies || "";
  document.getElementById("patientConditions").value = patient?.conditions || "";
  document.getElementById("patientMedications").value = patient?.medications || "";
  document.getElementById("patientClinicalHistory").value = patient?.clinicalHistory || "";
  document.getElementById("patientLastVisit").value = patient?.lastVisit || todayIso;
  document.getElementById("patientNotes").value = patient?.notes || "";
  syncPatientDocumentRequirement();
  updatePatientPhotoPreview(capturedPatientPhoto);
  document.getElementById("patientDialog").showModal();
  startPatientCamera();
}

function closePatientForm() {
  editingPatientId = null;
  stopPatientCamera();
  capturedPatientPhoto = "";
  document.getElementById("patientForm").reset();
  document.getElementById("patientDialog").close();
}

async function startPatientCamera() {
  const video = document.getElementById("patientCamera");
  const status = document.getElementById("patientCameraStatus");
  if (!video || !navigator.mediaDevices?.getUserMedia) {
    if (status) status.textContent = "Cámara no disponible. Use Subir archivo.";
    return;
  }

  stopPatientCamera();
  try {
    patientCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = patientCameraStream;
    video.classList.remove("is-hidden");
    document.getElementById("patientPhotoPreview")?.classList.remove("is-visible");
    if (status) status.textContent = "Cámara activa. Presione Tomar foto.";
  } catch {
    if (status) status.textContent = "No se pudo abrir la cámara. Use Subir archivo.";
  }
}

function stopPatientCamera() {
  patientCameraStream?.getTracks().forEach((track) => track.stop());
  patientCameraStream = null;
  const video = document.getElementById("patientCamera");
  if (video) video.srcObject = null;
}

function capturePatientPhoto() {
  const video = document.getElementById("patientCamera");
  const canvas = document.getElementById("patientPhotoCanvas");
  const status = document.getElementById("patientCameraStatus");
  if (!video?.videoWidth || !canvas) {
    if (status) status.textContent = "La cámara aún no está lista.";
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedPatientPhoto = canvas.toDataURL("image/jpeg", 0.9);
  updatePatientPhotoPreview(capturedPatientPhoto);
  if (status) status.textContent = "Foto capturada.";
}

function updatePatientPhotoPreview(photo) {
  const preview = document.getElementById("patientPhotoPreview");
  const video = document.getElementById("patientCamera");
  if (!preview) return;
  preview.src = photo || "";
  preview.classList.toggle("is-visible", Boolean(photo));
  video?.classList.toggle("is-hidden", Boolean(photo));
}

async function savePatientFromForm() {
  const existing = state.patients.find((item) => item.id === editingPatientId);
  const photo = capturedPatientPhoto || await readPatientPhoto();
  const patient = existing || {
    id: makeId(),
    code: nextPatientCode(),
    balance: 0,
    status: "Activo"
  };

  patient.code ||= nextPatientCode();
  patient.name = value("patientName");
  patient.phone = value("patientPhone");
  patient.email = value("patientEmail");
  patient.documentType = value("patientDocumentType");
  patient.nationality = value("patientNationality");
  patient.birthdate = value("patientBirthdate");
  patient.isMinor = document.getElementById("patientIsMinor").checked;
  patient.document = patient.isMinor ? "" : value("patientDocument");
  patient.gender = value("patientGender");
  patient.address = value("patientAddress");
  patient.emergencyName = value("patientEmergencyName");
  patient.emergencyPhone = value("patientEmergencyPhone");
  patient.emergencyRelation = value("patientEmergencyRelation");
  patient.emergency = emergencyContactText(patient);
  patient.bloodType = value("patientBloodType");
  patient.insurance = value("patientInsurance") || "Sin seguro";
  patient.allergies = value("patientAllergies") || "Ninguna";
  patient.conditions = value("patientConditions") || "Sin condiciones registradas";
  patient.medications = value("patientMedications") || "Sin medicamentos registrados";
  patient.clinicalHistory = value("patientClinicalHistory") || "Sin historial registrado";
  patient.photo = photo || patient.photo || "";
  patient.lastVisit = value("patientLastVisit") || todayIso;
  patient.notes = value("patientNotes");

  if (!existing) state.patients.push(patient);
  return patient;
}

function nextPatientCode() {
  const max = state.patients.reduce((highest, patient) => {
    const match = String(patient.code || "").match(/^P(\d+)$/i);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `P${String(max + 1).padStart(3, "0")}`;
}

function syncPatientDocumentRequirement() {
  const documentInput = document.getElementById("patientDocument");
  const documentType = document.getElementById("patientDocumentType");
  const minorInput = document.getElementById("patientIsMinor");
  const birthdate = value("patientBirthdate");
  const minor = minorInput.checked || isMinor(birthdate);
  minorInput.checked = minor;
  documentInput.required = !minor;
  documentInput.disabled = minor;
  documentType.disabled = minor;
  if (minor) documentInput.value = "";
  documentInput.placeholder = minor ? "Opcional si es menor de edad" : "Requerido para mayor de edad";
}

function isMinor(birthdate) {
  const age = patientAgeNumber(birthdate);
  return age !== null && age < 18;
}

function patientIsMinor(patient) {
  return Boolean(patient?.isMinor) || isMinor(patient?.birthdate);
}

function patientDocumentLabel(patient) {
  if (patientIsMinor(patient)) return "Menor de edad";
  return patient?.document || "No registrado";
}

function normalizeDocumentType(documentType) {
  if (documentType === "Licencia médica") return "Licencia de conducir";
  return documentType || "Cédula";
}

function splitEmergencyContact(patient) {
  if (patient?.emergencyName || patient?.emergencyPhone || patient?.emergencyRelation) {
    return {
      name: patient.emergencyName || "",
      phone: patient.emergencyPhone || "",
      relation: patient.emergencyRelation || ""
    };
  }

  const parts = String(patient?.emergency || "").split("·").map((part) => part.trim());
  return {
    name: parts[0] || "",
    phone: parts[1] || "",
    relation: parts[2] || ""
  };
}

function emergencyContactText(patient) {
  return [
    patient.emergencyName || patient.name,
    patient.emergencyPhone || patient.phone,
    patient.emergencyRelation || patient.relation
  ]
    .filter(Boolean)
    .join(" · ");
}

function openAppointmentForm(appointmentId) {
  const appointment = state.appointments.find((item) => item.id === appointmentId);
  if (!appointment) return;
  editingAppointmentId = appointment.id;
  document.getElementById("appointmentPatient").value = appointment.patientId;
  document.getElementById("appointmentDoctor").value = appointment.doctorId;
  document.getElementById("appointmentDate").value = appointment.date;
  document.getElementById("appointmentTime").value = appointment.time;
  document.getElementById("appointmentDuration").value = appointment.duration || 30;
  document.getElementById("appointmentType").value = appointment.type;
  document.getElementById("appointmentReminder").value = appointment.reminder || "Sin recordatorio";
  document.getElementById("saveAppointmentButton").textContent = "Guardar cita";
}

function saveAppointmentFromForm() {
  const appointment = state.appointments.find((item) => item.id === editingAppointmentId) || {
    id: makeId(),
    createdBy: currentUser?.id || "sin-usuario",
    status: "Pendiente"
  };
  appointment.patientId = value("appointmentPatient");
  appointment.doctorId = value("appointmentDoctor");
  appointment.date = value("appointmentDate");
  appointment.time = value("appointmentTime");
  appointment.duration = Number(value("appointmentDuration")) || 30;
  appointment.type = value("appointmentType");
  appointment.reminder = value("appointmentReminder");
  if (!state.appointments.some((item) => item.id === appointment.id)) {
    state.appointments.push(appointment);
  }
  editingAppointmentId = null;
  document.getElementById("saveAppointmentButton").textContent = "Agendar";
  return appointment;
}

function appointmentConflictsFromForm() {
  const patientId = value("appointmentPatient");
  const doctorId = value("appointmentDoctor");
  const date = value("appointmentDate");
  const time = value("appointmentTime");
  const currentId = editingAppointmentId;
  const sameDayPatientAppointments = state.appointments.filter((appointment) =>
    appointment.id !== currentId &&
    appointment.patientId === patientId &&
    appointment.date === date &&
    appointment.status !== "Cancelada"
  );
  const sameTimeDoctorAppointments = state.appointments.filter((appointment) =>
    appointment.id !== currentId &&
    appointment.doctorId === doctorId &&
    appointment.date === date &&
    appointment.time === time &&
    appointment.status !== "Cancelada"
  );
  const conflicts = [];
  if (sameDayPatientAppointments.length) {
    conflicts.push(`El paciente ya tiene ${sameDayPatientAppointments.length} cita(s) ese día: ${sameDayPatientAppointments.map((appointment) => `${appointment.time} con ${doctorById(appointment.doctorId).name}`).join(", ")}.`);
  }
  if (sameTimeDoctorAppointments.length) {
    conflicts.push(`El doctor ya tiene una cita a las ${time}: ${sameTimeDoctorAppointments.map((appointment) => patientById(appointment.patientId).name).join(", ")}.`);
  }
  return conflicts;
}

function doctorAbsenceForDate(doctorId, date) {
  return (state.selfServiceRequests || []).find((request) =>
    request.type === "Ausencia doctor" &&
    request.createdBy === doctorId &&
    request.status !== "Cancelada" &&
    request.start &&
    date >= request.start &&
    date <= (request.end || request.start)
  );
}

function bindForms() {
  const dialog = document.getElementById("patientDialog");
  const userDialog = document.getElementById("userDialog");
  document.getElementById("addPatientToolbar").addEventListener("click", () => openPatientForm());
  document.getElementById("cancelPatient").addEventListener("click", () => closePatientForm());
  document.getElementById("startPatientCamera").addEventListener("click", startPatientCamera);
  document.getElementById("capturePatientPhoto").addEventListener("click", capturePatientPhoto);
  document.getElementById("patientPhoto").addEventListener("change", async () => {
    capturedPatientPhoto = await readPatientPhoto();
    updatePatientPhotoPreview(capturedPatientPhoto);
  });
  document.getElementById("paymentType").addEventListener("change", syncPaymentProductFields);
  document.getElementById("paymentProduct").addEventListener("change", syncSelectedProductSale);
  document.getElementById("paymentQuantity").addEventListener("input", syncSelectedProductSale);
  document.getElementById("patientBirthdate").addEventListener("change", syncPatientDocumentRequirement);
  document.getElementById("patientIsMinor").addEventListener("change", syncPatientDocumentRequirement);
  dialog.addEventListener("close", () => {
    editingPatientId = null;
    stopPatientCamera();
  });
  document.getElementById("openUserModal").addEventListener("click", () => {
    if (currentUser?.role === "Administrador") openUserForm();
  });
  document.getElementById("editSelectedUser").addEventListener("click", () => {
    if (currentUser?.role === "Administrador") openUserForm(selectedUserId);
  });
  document.getElementById("cancelUser").addEventListener("click", () => closeUserForm());
  userDialog.addEventListener("close", () => {
    editingUserId = null;
  });

  document.getElementById("userForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentUser?.role !== "Administrador") return;
    const savedUser = saveUserFromForm();
    selectedUserId = savedUser.id;
    closeUserForm();
    populateUserLogin();
    persistAndRender();
  });

  document.getElementById("patientForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!can("patients:create")) return;
    await savePatientFromForm();
    closePatientForm();
    persistAndRender();
  });

  document.getElementById("closePatientRecord").addEventListener("click", closePatientRecord);
  document.getElementById("donePatientRecord").addEventListener("click", closePatientRecord);
  document.getElementById("printPatientRecord").addEventListener("click", () => window.print());

  document.getElementById("selfServiceSearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    selectedSelfServicePatientId = null;
    renderSelfService();
  });
  document.getElementById("selfServiceRequestForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.selfServiceRequests ||= [];
    const type = value("selfRequestType");
    if (!canCreateSelfServiceRequest(type)) {
      alert("No tiene permiso para crear este tipo de solicitud.");
      return;
    }
    state.selfServiceRequests.unshift({
      id: makeId(),
      type,
      patientId: value("selfRequestPatient"),
      piece: value("selfRequestPiece"),
      amount: Number(value("selfRequestAmount")) || 0,
      start: value("selfRequestStart"),
      end: value("selfRequestEnd") || value("selfRequestStart"),
      detail: value("selfRequestDetail"),
      status: type === "Ausencia doctor" ? "Activa" : "Pendiente",
      createdBy: currentUser?.id || "sin-usuario",
      createdAt: new Date().toISOString()
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("appointmentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("appointments:create")) return;
    const absence = doctorAbsenceForDate(value("appointmentDoctor"), value("appointmentDate"));
    if (absence) {
      alert(`No se puede agendar. ${doctorById(value("appointmentDoctor")).name} tiene ausencia marcada para ese día: ${absence.detail}`);
      return;
    }
    const conflicts = appointmentConflictsFromForm();
    if (conflicts.length && !confirm(`Aviso de agenda:\n\n${conflicts.join("\n")}\n\n¿Desea guardar la cita de todos modos?`)) {
      return;
    }
    const savedAppointment = saveAppointmentFromForm();
    event.target.reset();
    document.getElementById("appointmentDate").value = todayIso;
    document.getElementById("agendaDateFilter").value = savedAppointment.date || todayIso;
    persistAndRender();
  });

  document.getElementById("treatmentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("treatments:create")) return;
    const patient = patientById(value("treatmentPatient"));
    const cost = Number(value("treatmentCost"));
    const procedure = procedureByName(value("treatmentName"));
    state.treatments.push({
      id: makeId(),
      patientId: patient.id,
      doctorId: value("treatmentDoctor"),
      createdBy: currentUser?.id || "sin-usuario",
      name: value("treatmentName"),
      cost,
      progress: 0,
      status: "Planificado",
      procedurePoints: procedure?.points || 0,
      procedureValue: procedure?.value || 0
    });
    patient.balance += cost;
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("paymentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payments:create")) return;
    const patient = patientById(value("paymentPatient"));
    const attendedDoctorId = value("paymentDoctor");
    const cashierId = value("paymentCashier") || currentUser?.id || "sin-usuario";
    const billTo = value("paymentBillTo");
    const paymentType = value("paymentType");
    const productId = value("paymentProduct");
    const quantity = Math.max(1, Number(value("paymentQuantity")) || 1);
    const product = paymentType === "Producto" ? state.inventory.find((item) => item.id === productId) : null;
    if (paymentType === "Producto" && !product) {
      alert("Seleccione un producto para facturar.");
      return;
    }
    if (product && product.stock < quantity) {
      alert(`Stock insuficiente. Disponible: ${product.stock}.`);
      return;
    }
    const amount = Number(value("paymentAmount"));
    const discount = Number(value("paymentDiscount")) || 0;
    const receiptNumber = nextReceiptNumber();
    const invoiceNumber = nextInvoiceNumber();
    state.payments.unshift({
      id: makeId(),
      patientId: patient.id,
      doctorId: attendedDoctorId,
      attendedDoctorId,
      cashierId,
      billTo,
      billedToDoctorId: billTo === "doctor" ? attendedDoctorId : "",
      billedToPatientId: billTo === "patient" ? patient.id : "",
      createdBy: cashierId,
      amount,
      discount,
      discountReason: value("paymentDiscountReason"),
      method: value("paymentMethod"),
      reference: value("paymentReference"),
      receiptNumber,
      invoiceNumber,
      invoiceStatus: value("paymentInvoiceStatus"),
      date: todayIso,
      concept: value("paymentConcept"),
      type: paymentType,
      productId: product?.id || "",
      productName: product?.name || "",
      quantity: product ? quantity : 0
    });
    if (product) {
      product.stock = Math.max(0, product.stock - quantity);
    }
    patient.balance = Math.max(0, patient.balance - amount - discount);
    event.target.reset();
    document.getElementById("paymentCashier").value = currentUser?.id || "";
    syncPaymentProductFields();
    persistAndRender();
  });

  document.getElementById("cashOpeningForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payments:create")) return;
    state.cashOpenings ||= [];
    if (currentCashOpening()) {
      alert("Ya existe una caja abierta para hoy.");
      return;
    }
    state.cashOpenings.unshift({
      id: makeId(),
      date: todayIso,
      openingAmount: Number(value("cashOpeningAmount")) || 0,
      note: value("cashOpeningNote"),
      openedBy: currentUser?.id || "sin-usuario",
      openedAt: new Date().toISOString(),
      status: "Abierta"
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("closeCashRegister").addEventListener("click", () => {
    if (!can("payments:create")) return;
    state.cashClosings ||= [];
    const opening = currentCashOpening();
    if (!opening) {
      alert("Debe abrir la caja antes de cerrarla.");
      return;
    }
    const totals = paymentMethodTotals(todayIso);
    const total = Object.values(totals).reduce((sum, amountValue) => sum + amountValue, 0);
    state.cashClosings.unshift({
      id: makeId(),
      date: todayIso,
      openingId: opening?.id || "",
      openingAmount: opening?.openingAmount || 0,
      totals,
      total,
      expectedTotal: total + (opening?.openingAmount || 0),
      closedBy: currentUser?.id || "sin-usuario",
      closedAt: new Date().toISOString()
    });
    if (opening) {
      opening.status = "Cerrada";
      opening.closedAt = new Date().toISOString();
    }
    persistAndRender();
  });

  document.getElementById("closeReceipt").addEventListener("click", closeReceipt);
  document.getElementById("doneReceipt").addEventListener("click", closeReceipt);
  document.getElementById("printReceipt").addEventListener("click", () => window.print());
  document.getElementById("markPayrollPaid").addEventListener("click", () => {
    if (!can("payroll:manage")) return;
    state.payroll = normalizedPayroll().map((item) => ({ ...item, status: "Pagado" }));
    persistAndRender();
  });
  document.getElementById("processPayrollMonth").addEventListener("click", () => {
    if (!can("payroll:manage")) return;
    state.payroll = normalizedPayroll().map((item) => ({ ...item, status: "Procesada" }));
    persistAndRender();
  });
  document.getElementById("payrollNoveltyForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payroll:manage")) return;
    state.payrollNovelties ||= [];
    state.payrollNovelties.unshift({
      id: makeId(),
      userId: value("payrollNoveltyUser"),
      type: value("payrollNoveltyType"),
      amount: Number(value("payrollNoveltyAmount")) || 0,
      note: value("payrollNoveltyNote"),
      date: todayIso,
      period: "Mayo 2026",
      createdBy: currentUser?.id || "sin-usuario"
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("toothStatus").addEventListener("change", refreshSelectedToothHint);
  document.getElementById("toothSurface").addEventListener("change", () => {
    syncToothControlsFromSelection();
    refreshSelectedToothHint();
  });
  document.getElementById("updateToothButton").addEventListener("click", () => {
    if (selectedTooth && can("odontogram:edit")) {
      updateTooth(selectedTooth);
      return;
    }
    refreshSelectedToothHint();
  });

  document.getElementById("odontogramPatient").addEventListener("change", () => {
    selectedTooth = null;
    renderOdontogram();
  });

  document.getElementById("diagnosisForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("odontogram:edit")) return;
    state.diagnoses ||= [];
    state.diagnoses.unshift({
      id: makeId(),
      patientId: value("odontogramPatient"),
      doctorId: currentUser?.id || "sin-usuario",
      date: todayIso,
      title: value("diagnosisTitle"),
      priority: value("diagnosisPriority"),
      notes: value("diagnosisNotes")
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("evolutionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("odontogram:edit")) return;
    state.evolutions ||= [];
    state.evolutions.unshift({
      id: makeId(),
      patientId: value("odontogramPatient"),
      doctorId: currentUser?.id || "sin-usuario",
      date: value("evolutionDate") || todayIso,
      note: value("evolutionNote")
    });
    event.target.reset();
    document.getElementById("evolutionDate").value = todayIso;
    persistAndRender();
  });

  document.getElementById("clinicalDocumentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("clinical-documents:create")) return;
    state.clinicalDocuments ||= [];
    state.clinicalDocuments.unshift({
      id: makeId(),
      patientId: value("odontogramPatient"),
      type: value("clinicalDocumentType"),
      title: value("clinicalDocumentTitle"),
      note: value("clinicalDocumentNote"),
      date: todayIso,
      createdBy: currentUser?.id || "sin-usuario"
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("inventoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("inventory:manage")) return;
    state.inventory ||= [];
    state.inventory.push({
      id: makeId(),
      name: value("inventoryName"),
      stock: Number(value("inventoryStock")) || 0,
      min: Number(value("inventoryMin")) || 0,
      price: Number(value("inventoryPrice")) || 0,
      expiry: value("inventoryExpiry"),
      provider: value("inventoryProvider") || "Sin proveedor"
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("attendanceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payroll:manage")) return;
    state.hrAttendance ||= [];
    state.hrAttendance.unshift({
      id: makeId(),
      userId: value("attendanceUser"),
      date: value("attendanceDate"),
      status: value("attendanceStatus"),
      timeIn: value("attendanceIn"),
      timeOut: value("attendanceOut"),
      note: value("attendanceNote"),
      createdBy: currentUser?.id || "sin-usuario"
    });
    event.target.reset();
    document.getElementById("attendanceDate").value = todayIso;
    persistAndRender();
  });

  document.getElementById("vacationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payroll:manage")) return;
    state.hrVacations ||= [];
    state.hrVacations.unshift({
      id: makeId(),
      userId: value("vacationUser"),
      start: value("vacationStart"),
      end: value("vacationEnd"),
      status: value("vacationStatus"),
      note: value("vacationNote"),
      createdBy: currentUser?.id || "sin-usuario"
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("shiftForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payroll:manage")) return;
    state.hrShifts ||= [];
    state.hrShifts.unshift({
      id: makeId(),
      userId: value("shiftUser"),
      name: value("shiftName"),
      area: value("shiftArea") || userById(value("shiftUser")).room || "Sin área",
      start: value("shiftStart"),
      end: value("shiftEnd"),
      day: value("shiftDay"),
      createdBy: currentUser?.id || "sin-usuario"
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("evaluationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payroll:manage")) return;
    state.hrEvaluations ||= [];
    state.hrEvaluations.unshift({
      id: makeId(),
      userId: value("evaluationUser"),
      date: value("evaluationDate"),
      score: Number(value("evaluationScore")) || 0,
      status: value("evaluationStatus"),
      credential: value("evaluationCredential"),
      note: value("evaluationNote"),
      createdBy: currentUser?.id || "sin-usuario"
    });
    event.target.reset();
    document.getElementById("evaluationDate").value = todayIso;
    persistAndRender();
  });

  document.getElementById("printClinicalRecord").addEventListener("click", () => window.print());
  document.getElementById("printReports").addEventListener("click", () => window.print());

  document.getElementById("clinicSettingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("settings:manage")) return;
    state.settings = {
      clinicName: value("clinicName"),
      clinicPhone: value("clinicPhone"),
      clinicAddress: value("clinicAddress"),
      clinicTaxId: value("clinicTaxId"),
      clinicCurrency: value("clinicCurrency")
    };
    persistAndRender();
  });

  document.getElementById("exportData").addEventListener("click", () => {
    const payload = JSON.stringify({ state, users, userPermissionOverrides }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `novaclinic-respaldo-${todayIso}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.getElementById("resetDemoData").addEventListener("click", () => {
    if (!can("settings:manage")) return;
    localStorage.removeItem("novaclinic-state");
    localStorage.removeItem("novaclinic-users");
    localStorage.removeItem("novaclinic-user-permissions");
    users = [...defaultUsers];
    doctors = users.filter((user) => user.role === "Doctor");
    userPermissionOverrides = loadUserPermissionOverrides();
    selectedUserId = "admin";
    state = cloneSeed();
    populateUserLogin();
    persistAndRender();
  });
}

function setView(viewName) {
  if (!canView(viewName)) {
    setView(firstAllowedView());
    return;
  }

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });
  document.getElementById("pageTitle").textContent = views[viewName];
}

function applyPermissions() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("permission-hidden", !canView(button.dataset.view));
  });

  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.classList.toggle("permission-hidden", !canView(button.dataset.viewJump));
  });

  document.querySelectorAll(".view").forEach((view) => {
    if (!canView(view.id)) {
      view.classList.remove("active");
    }
  });

  toggleAction("addPatientToolbar", "patients:create");
  toggleAction("appointmentForm", "appointments:create");
  toggleAction("treatmentForm", "treatments:create");
  toggleAction("paymentForm", "payments:create");
  toggleAction("cashOpeningForm", "payments:create");
  toggleAction("closeCashRegister", "payments:create");
  toggleAction("toothStatus", "odontogram:edit");
  toggleAction("toothSurface", "odontogram:edit");
  toggleAction("updateToothButton", "odontogram:edit");
  toggleAction("diagnosisForm", "odontogram:edit");
  toggleAction("evolutionForm", "odontogram:edit");
  toggleAction("clinicalDocumentForm", "clinical-documents:create");
  toggleAction("inventoryForm", "inventory:manage");
  toggleAction("clinicSettingsForm", "settings:manage");
  toggleAction("markPayrollPaid", "payroll:manage");
  toggleAction("processPayrollMonth", "payroll:manage");
  toggleAction("payrollNoveltyForm", "payroll:manage");
  toggleAction("attendanceForm", "payroll:manage");
  toggleAction("vacationForm", "payroll:manage");
  toggleAction("shiftForm", "payroll:manage");
  toggleAction("evaluationForm", "payroll:manage");
  toggleAction("openUserModal", "users:create");
  toggleAction("editSelectedUser", "users:create");

  const activeView = document.querySelector(".view.active")?.id;
  if (!activeView || !canView(activeView)) {
    setView(firstAllowedView());
  }
}

function toggleAction(id, action) {
  const element = document.getElementById(id);
  if (!element) return;
  const allowed = can(action);
  element.classList.toggle("permission-hidden", !allowed);
  element.querySelectorAll?.("input, select, button, textarea").forEach((field) => {
    field.disabled = !allowed;
  });
}

function permissions() {
  return permissionsForUser(currentUser?.id);
}

function can(action) {
  return permissions().actions.includes(action);
}

function allowedSelfServiceActionsForRole(role) {
  return selfServiceActionsByRole[role] || ["selfservice:employee"];
}

function canView(viewName) {
  return permissions().views.includes(viewName);
}

function firstAllowedView() {
  return permissions().views.find((view) => panelViews.includes(view)) || permissions().views[0] || "dashboard";
}

function permissionsForUser(userId) {
  const user = users.find((item) => item.id === userId) || currentUser || users.find((item) => item.id === "recepcion");
  const defaults = rolePermissions[user?.role] || rolePermissions["Recepción"];
  const override = userPermissionOverrides[user?.id];
  if (!override) {
    return {
      views: [...defaults.views],
      actions: sanitizeSelfServiceActions([...defaults.actions], user?.role),
      scope: defaults.scope
    };
  }

  return {
    views: [...override.views],
    actions: sanitizeSelfServiceActions([...override.actions], user?.role),
    scope: defaults.scope
  };
}

function sanitizeSelfServiceActions(actions, role) {
  const allowed = new Set(allowedSelfServiceActionsForRole(role));
  return actions.filter((action) => !action.startsWith("selfservice:") || allowed.has(action));
}

function render() {
  populateSelects();
  renderDashboard();
  renderReceptionPanel();
  renderUsersPanel();
  renderHrPanel();
  renderLaboratoryPanel();
  renderAccountingPanel();
  renderPatients();
  renderSelfService();
  renderAgenda();
  renderOdontogram();
  renderTreatments();
  renderBilling();
  renderInventory();
  renderReports();
  renderAdmin();
}

function persistAndRender() {
  saveState();
  render();
}

function populateSelects() {
  const options = state.patients
    .map((patient) => `<option value="${patient.id}">${escapeHtml(patient.name)}</option>`)
    .join("");
  const doctorOptions = doctors
    .map((doctor) => `<option value="${doctor.id}">${escapeHtml(doctor.name)} · ${escapeHtml(doctor.specialty)}</option>`)
    .join("");

  const userOptions = users
    .map((user) => `<option value="${user.id}">${escapeHtml(user.name)} · ${escapeHtml(user.role)}</option>`)
    .join("");

  ["appointmentPatient", "odontogramPatient", "treatmentPatient", "paymentPatient", "selfRequestPatient"].forEach((id) => {
    const select = document.getElementById(id);
    const current = select.value;
    select.innerHTML = id === "selfRequestPatient" ? `<option value="">Sin paciente asociado</option>${options}` : options;
    if (current && state.patients.some((patient) => patient.id === current)) {
      select.value = current;
    }
  });

  const paymentDoctor = document.getElementById("paymentDoctor");
  if (paymentDoctor) {
    const current = paymentDoctor.value;
    paymentDoctor.innerHTML = doctorOptions;
    if (current && doctors.some((doctor) => doctor.id === current)) {
      paymentDoctor.value = current;
    } else if (currentUser?.role === "Doctor") {
      paymentDoctor.value = currentUser.id;
    }
  }

  const paymentCashier = document.getElementById("paymentCashier");
  if (paymentCashier) {
    const current = paymentCashier.value;
    paymentCashier.innerHTML = users
      .filter((user) => ["Administrador", "Recepción", "Contabilidad"].includes(user.role))
      .map((user) => `<option value="${user.id}">${escapeHtml(user.name)} · ${escapeHtml(user.role)}</option>`)
      .join("");
    if (current && users.some((user) => user.id === current)) {
      paymentCashier.value = current;
    } else if (currentUser) {
      paymentCashier.value = currentUser.id;
    }
  }

  ["appointmentDoctor", "treatmentDoctor"].forEach((id) => {
    const select = document.getElementById(id);
    const current = select.value;
    select.innerHTML = doctorOptions;
    if (current && doctors.some((doctor) => doctor.id === current)) {
      select.value = current;
    } else if (currentUser?.role === "Doctor") {
      select.value = currentUser.id;
    }
    select.disabled = currentUser?.role === "Doctor";
  });

  const paymentProduct = document.getElementById("paymentProduct");
  if (paymentProduct) {
    const current = paymentProduct.value;
    state.inventory ||= [];
    paymentProduct.innerHTML = state.inventory.length
      ? state.inventory
          .map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · ${currency.format(item.price || 0)} · Stock ${item.stock}</option>`)
          .join("")
      : `<option value="">Sin productos disponibles</option>`;
    if (current && state.inventory.some((item) => item.id === current)) {
      paymentProduct.value = current;
    }
    syncPaymentProductFields();
  }

  const payrollNoveltyUser = document.getElementById("payrollNoveltyUser");
  if (payrollNoveltyUser) {
    const current = payrollNoveltyUser.value;
    payrollNoveltyUser.innerHTML = userOptions;
    if (current && users.some((user) => user.id === current)) {
      payrollNoveltyUser.value = current;
    }
  }

  ["attendanceUser", "vacationUser", "shiftUser", "evaluationUser"].forEach((id) => {
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value;
    select.innerHTML = userOptions;
    if (current && users.some((user) => user.id === current)) {
      select.value = current;
    }
  });

  document.getElementById("appointmentDate").value ||= todayIso;
  document.getElementById("agendaDateFilter").value ||= todayIso;
  document.getElementById("evolutionDate").value ||= todayIso;
  document.getElementById("attendanceDate").value ||= todayIso;
  document.getElementById("evaluationDate").value ||= todayIso;
}

function renderDashboard() {
  const doctorAppointments = appointmentsForCurrentDoctor();
  const doctorTreatments = treatmentsForCurrentDoctor();
  const todayAppointments = doctorAppointments.filter((appointment) => appointment.date === todayIso);
  const pendingBalance = state.patients.reduce((sum, patient) => sum + patient.balance, 0);
  const activePlans = doctorTreatments.filter((treatment) => treatment.progress < 100).length;
  const confirmed = todayAppointments.filter((appointment) => appointment.status === "Confirmada").length;

  const metrics = [
    ["Pacientes", state.patients.length],
    ["Mis citas hoy", todayAppointments.length],
    ["Confirmadas", confirmed],
    ["Balance pendiente", currency.format(pendingBalance)]
  ];

  document.getElementById("metricGrid").innerHTML = metrics
    .map(([label, valueText]) => `<article class="metric-card"><span>${label}</span><strong>${valueText}</strong></article>`)
    .join("");

  renderPanelModules("doctorPanelModules", "dashboard");

  document.getElementById("todayAppointments").innerHTML = todayAppointments.length
    ? todayAppointments
        .sort(sortByDateTime)
        .map((appointment) => appointmentTemplate(appointment))
        .join("")
    : emptyState("No hay citas registradas para hoy.");

  const alerts = [
    ...state.patients.filter((patient) => patient.balance > 0).slice(0, 3).map((patient) => ({
      label: patient.name,
      detail: `Balance pendiente ${currency.format(patient.balance)}`,
      status: "Pendiente"
    })),
    {
      label: "Planes activos",
      detail: `${activePlans} tratamientos requieren seguimiento`,
      status: "Confirmada"
    }
  ];

  document.getElementById("alertList").innerHTML = alerts
    .map((alert) => `
      <article class="alert-item">
        <span class="status-pill ${className(alert.status)}">${alert.status}</span>
        <div><strong>${escapeHtml(alert.label)}</strong><p>${escapeHtml(alert.detail)}</p></div>
      </article>
    `)
    .join("");
}

function renderReceptionPanel() {
  const todayAppointments = state.appointments
    .filter((appointment) => appointment.date === todayIso)
    .sort(sortByDateTime);
  const pendingAppointments = todayAppointments.filter((appointment) => appointment.status === "Pendiente").length;
  const pendingBalance = state.patients.reduce((sum, patient) => sum + patient.balance, 0);

  document.getElementById("receptionPanelCards").innerHTML = [
    ["Citas de hoy", todayAppointments.length],
    ["Por confirmar", pendingAppointments],
    ["Pacientes registrados", state.patients.length],
    ["Balance abierto", currency.format(pendingBalance)]
  ].map(panelCardTemplate).join("");

  renderPanelModules("receptionPanelModules", "receptionPanel");

  document.getElementById("receptionAppointments").innerHTML = todayAppointments.length
    ? todayAppointments.slice(0, 6).map(appointmentTemplate).join("")
    : emptyState("No hay citas para hoy.");
}

function renderHrPanel() {
  const activeUsers = users.length;
  const doctorsCount = users.filter((user) => user.role === "Doctor").length;
  const supportCount = users.filter((user) => ["Recepción", "Recursos Humanos", "Laboratorio", "Contabilidad"].includes(user.role)).length;
  const shiftCount = new Set(users.map((user) => user.shift)).size;
  const payrollItems = normalizedPayroll().map(payrollDisplayItem);
  const payrollTotal = payrollItems.reduce((sum, item) => sum + payrollNet(item), 0);
  const pendingPayroll = payrollItems.filter((item) => item.status !== "Pagado").length;
  state.hrAttendance ||= [];
  state.hrVacations ||= [];
  state.hrShifts ||= [];
  state.hrEvaluations ||= [];

  document.getElementById("hrPanelCards").innerHTML = [
    ["Personal activo", activeUsers],
    ["Doctores", doctorsCount],
    ["Nómina neta", currency.format(payrollTotal)],
    ["Pagos pendientes", pendingPayroll]
  ].map(panelCardTemplate).join("");

  renderPanelModules("hrPanelModules", "hrPanel");

  document.getElementById("hrStaffCards").innerHTML = users.map((user) => `
    <article class="staff-card">
      <div>
        <span class="status-pill ${user.role === "Doctor" ? "confirmada" : "pendiente"}">${escapeHtml(user.role)}</span>
        <h2>${escapeHtml(user.name)}</h2>
        <p>${escapeHtml(user.specialty)} · ${escapeHtml(user.room)}</p>
      </div>
      <div class="staff-permissions">
        <strong>Turno</strong>
        <span>${escapeHtml(user.shift)}</span>
      </div>
    </article>
  `).join("");

  document.getElementById("hrNotes").innerHTML = [
    ["Asistencia", `${state.hrAttendance.filter((item) => item.date === todayIso).length} registros hoy.`],
    ["Vacaciones", `${state.hrVacations.filter((item) => item.status === "Solicitada").length} solicitudes pendientes.`],
    ["Turnos", `${state.hrShifts.length || shiftCount} turnos registrados para el personal.`],
    ["Evaluaciones", `${state.hrEvaluations.length} evaluaciones registradas.`]
  ].map(([label, detail]) => `
    <article class="alert-item">
      <span class="status-pill pendiente">${label}</span>
      <div><strong>${detail}</strong><p>Módulo activo dentro de RRHH.</p></div>
    </article>
  `).join("");

  renderHrControls();
  renderPayroll(payrollItems);
}

function renderLaboratoryPanel() {
  const labRequests = (state.selfServiceRequests || [])
    .filter((request) => request.type === "Laboratorio - pieza dental");
  const pending = labRequests.filter((request) => request.status === "Pendiente").length;
  const active = labRequests.filter((request) => ["Recibida", "En proceso"].includes(request.status)).length;
  const completed = labRequests.filter((request) => request.status === "Completada").length;
  const invoiced = labRequests.filter((request) => request.status === "Facturada").length;

  document.getElementById("laboratoryPanelCards").innerHTML = [
    ["Solicitudes", labRequests.length],
    ["Pendientes", pending],
    ["En proceso", active],
    ["Completadas", completed],
    ["Facturadas", invoiced]
  ].map(panelCardTemplate).join("");

  renderPanelModules("laboratoryPanelModules", "laboratoryPanel");

  document.getElementById("laboratoryStatusList").innerHTML = [
    ["Pendiente", `${pending} trabajos por recibir.`],
    ["En proceso", `${active} trabajos activos.`],
    ["Completada", `${completed} trabajos entregados.`],
    ["Facturada", `${invoiced} trabajos facturados al doctor.`]
  ].map(([label, detail]) => `
    <article class="alert-item">
      <span class="status-pill ${label === "Completada" ? "confirmada" : "pendiente"}">${label}</span>
      <div><strong>${detail}</strong><p>Solicitudes generadas desde Autoservicio.</p></div>
    </article>
  `).join("");

  document.getElementById("laboratoryRequestList").innerHTML = labRequests.length
    ? labRequests.map(laboratoryRequestTemplate).join("")
    : emptyState("No hay trabajos de laboratorio registrados.");

  document.querySelectorAll("[data-lab-status]").forEach((select) => {
    select.addEventListener("change", () => {
      if (!can("laboratory:manage")) return;
      const request = state.selfServiceRequests.find((item) => item.id === select.dataset.labStatus);
      if (!request) return;
      request.status = select.value;
      request.updatedAt = new Date().toISOString();
      request.updatedBy = currentUser?.id || "sin-usuario";
      persistAndRender();
    });
  });
  document.querySelectorAll("[data-lab-invoice]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("laboratory:manage")) return;
      createLaboratoryInvoice(button.dataset.labInvoice);
    });
  });
}

function laboratoryRequestTemplate(request) {
  const patient = request.patientId ? patientById(request.patientId) : null;
  return `
    <article class="ledger-item">
      <span class="status-pill ${request.status === "Completada" ? "confirmada" : "pendiente"}">${escapeHtml(request.status)}</span>
      <div>
        <strong>${escapeHtml(request.piece || "Pieza sin especificar")}</strong>
        <p>${patient ? `Paciente: ${escapeHtml(patient.name)} · ` : ""}${escapeHtml(request.detail || "Sin detalles")}${request.amount ? ` · ${currency.format(request.amount)}` : ""}</p>
        <small>Solicitado por ${escapeHtml(userById(request.createdBy).name)} · ${formatDateTime(request.createdAt)}</small>
      </div>
      <select data-lab-status="${request.id}" ${can("laboratory:manage") ? "" : "disabled"}>
        ${["Pendiente", "Recibida", "En proceso", "Completada", "Facturada", "Cancelada"].map((status) => `<option ${status === request.status ? "selected" : ""}>${status}</option>`).join("")}
      </select>
      <button class="ghost-button ${request.status === "Completada" && request.patientId && !request.invoiceId ? "" : "permission-hidden"}" data-lab-invoice="${request.id}" type="button">Facturar al doctor</button>
    </article>
  `;
}

function createLaboratoryInvoice(requestId) {
  const request = state.selfServiceRequests.find((item) => item.id === requestId);
  if (!request || request.status !== "Completada" || request.invoiceId) return;
  if (!request.patientId) {
    alert("Debe existir un paciente asociado para facturar el trabajo.");
    return;
  }
  const patient = patientById(request.patientId);
  const amount = Number(request.amount) || Number(prompt("Monto a facturar al doctor", "0")) || 0;
  if (amount <= 0) {
    alert("Indique un monto válido para facturar.");
    return;
  }
  const doctorId = request.createdBy;
  const invoiceNumber = nextInvoiceNumber();
  const receiptNumber = nextReceiptNumber();
  const payment = {
    id: makeId(),
    patientId: patient?.id || "",
    doctorId,
    attendedDoctorId: doctorId,
    cashierId: currentUser?.id || "laboratorio",
    billTo: "doctor",
    billedToDoctorId: doctorId,
    billedToPatientId: patient?.id || "",
    createdBy: currentUser?.id || "laboratorio",
    amount,
    discount: 0,
    discountReason: "",
    method: "Laboratorio",
    reference: request.id,
    receiptNumber,
    invoiceNumber,
    invoiceStatus: "Emitida",
    date: todayIso,
    concept: `Laboratorio: ${request.piece || "pieza dental"}`,
    type: "Laboratorio",
    laboratoryRequestId: request.id
  };
  state.payments.unshift(payment);
  request.invoiceId = payment.id;
  request.invoiceNumber = invoiceNumber;
  request.amount = amount;
  request.status = "Facturada";
  request.updatedAt = new Date().toISOString();
  request.updatedBy = currentUser?.id || "laboratorio";
  persistAndRender();
}

function renderHrControls() {
  document.getElementById("attendanceTable").innerHTML = state.hrAttendance.length
    ? state.hrAttendance.slice(0, 10).map((item) => `
      <tr>
        <td>${escapeHtml(userById(item.userId).name)}</td>
        <td>${formatDate(item.date)}</td>
        <td><span class="status-pill ${hrStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.timeIn || "Sin entrada")}</td>
        <td>${escapeHtml(item.timeOut || "Sin salida")}</td>
        <td>${escapeHtml(item.note || "Sin nota")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="6">${emptyState("Sin asistencia registrada.")}</td></tr>`;

  document.getElementById("vacationTable").innerHTML = state.hrVacations.length
    ? state.hrVacations.slice(0, 10).map((item) => `
      <tr>
        <td>${escapeHtml(userById(item.userId).name)}</td>
        <td>${formatDate(item.start)}</td>
        <td>${formatDate(item.end)}</td>
        <td><span class="status-pill ${hrStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.note || "Sin comentario")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5">${emptyState("Sin solicitudes de vacaciones.")}</td></tr>`;

  document.getElementById("shiftTable").innerHTML = state.hrShifts.length
    ? state.hrShifts.slice(0, 10).map((item) => `
      <tr>
        <td>${escapeHtml(userById(item.userId).name)}</td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.area || "Sin área")}</td>
        <td>${escapeHtml(item.start)} - ${escapeHtml(item.end)}</td>
        <td>${escapeHtml(item.day || "Sin día")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5">${emptyState("Sin turnos registrados.")}</td></tr>`;

  document.getElementById("evaluationTable").innerHTML = state.hrEvaluations.length
    ? state.hrEvaluations.slice(0, 10).map((item) => `
      <tr>
        <td>${escapeHtml(userById(item.userId).name)}</td>
        <td>${formatDate(item.date)}</td>
        <td><strong>${Number(item.score) || 0}/100</strong></td>
        <td><span class="status-pill ${hrStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.credential || "Sin credencial")}</td>
        <td>${escapeHtml(item.note || "Sin observación")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="6">${emptyState("Sin evaluaciones registradas.")}</td></tr>`;
}

function hrStatusClass(status) {
  return {
    Presente: "confirmada",
    Aprobada: "confirmada",
    Completada: "confirmada",
    Tarde: "pendiente",
    Solicitada: "pendiente",
    "En seguimiento": "pendiente",
    Ausente: "cancelada",
    Rechazada: "cancelada",
    "Requiere mejora": "cancelada",
    "Credencial vencida": "cancelada"
  }[status] || "pendiente";
}

function renderPayrollLegacy(payrollItems) {
  const grossTotal = payrollItems.reduce((sum, item) => sum + payrollGross(item), 0);
  const deductionsTotal = payrollItems.reduce((sum, item) => sum + item.deductions, 0);
  const netTotal = payrollItems.reduce((sum, item) => sum + payrollNet(item), 0);
  const paidCount = payrollItems.filter((item) => item.status === "Pagado").length;
  const doctorPoints = payrollItems.reduce((sum, item) => sum + (item.commission?.points || 0), 0);

  document.getElementById("payrollSummary").innerHTML = [
    ["Total bruto", currency.format(grossTotal)],
    ["Deducciones", currency.format(deductionsTotal)],
    ["Total neto", currency.format(netTotal)],
    ["Puntos doctores", doctorPoints],
    ["Novedades", (state.payrollNovelties || []).length],
    ["Pagados", `${paidCount}/${payrollItems.length}`]
  ].map(panelCardTemplate).join("");

  document.getElementById("payrollNoveltyTable").innerHTML = (state.payrollNovelties || []).length
    ? state.payrollNovelties.map((novelty) => `
      <tr>
        <td>${escapeHtml(userById(novelty.userId).name)}</td>
        <td><span class="status-pill ${["Ingreso", "Ajuste"].includes(novelty.type) ? "confirmada" : "pendiente"}">${escapeHtml(novelty.type)}</span></td>
        <td>${currency.format(Number(novelty.amount) || 0)}</td>
        <td>${escapeHtml(novelty.note)}</td>
        <td>${formatDate(novelty.date)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5">${emptyState("No hay novedades aplicadas para este período.")}</td></tr>`;

  document.getElementById("procedurePointTable").innerHTML = procedurePointCatalog.map((procedure) => `
    <tr>
      <td><strong>${escapeHtml(procedure.name)}</strong></td>
      <td>${procedure.points}</td>
      <td>${currency.format(procedure.value)}</td>
    </tr>
  `).join("");

  document.getElementById("payrollTable").innerHTML = payrollItems.map((item) => {
    const user = userById(item.userId);
    const isDoctor = user.role === "Doctor";
    return `
      <tr>
        <td>
          <div class="patient-name">
            <strong>${escapeHtml(user.name)}</strong>
            <small>${escapeHtml(item.period)} · ${isDoctor ? "Comisión por procedimientos completados" : "Salario fijo"}</small>
          </div>
        </td>
        <td>${escapeHtml(user.role || "Sin rol")}</td>
        <td>${isDoctor ? `${item.commission.points} pts` : currency.format(item.base)}</td>
        <td>${currency.format(item.bonus)}</td>
        <td>${currency.format(item.deductions)}</td>
        <td><strong>${currency.format(payrollNet(item))}</strong></td>
        <td><span class="status-pill ${item.status === "Pagado" ? "pagado" : "pendiente"}">${escapeHtml(item.status)}</span></td>
      </tr>
    `;
  }).join("");
}

function renderPayroll(payrollItems) {
  const adminPayrollItems = payrollItems.filter((item) => userById(item.userId).role !== "Doctor");
  const doctorPayrollItems = payrollItems.filter((item) => userById(item.userId).role === "Doctor");
  const grossTotal = payrollItems.reduce((sum, item) => sum + payrollGross(item), 0);
  const deductionsTotal = payrollItems.reduce((sum, item) => sum + item.deductions, 0);
  const netTotal = payrollItems.reduce((sum, item) => sum + payrollNet(item), 0);
  const paidCount = payrollItems.filter((item) => item.status === "Pagado").length;
  const adminNetTotal = adminPayrollItems.reduce((sum, item) => sum + payrollNet(item), 0);
  const adminDeductions = adminPayrollItems.reduce((sum, item) => sum + item.deductions, 0);
  const doctorCommissionTotal = doctorPayrollItems.reduce((sum, item) => sum + item.bonus, 0);
  const doctorPoints = doctorPayrollItems.reduce((sum, item) => sum + (item.commission?.points || 0), 0);
  const doctorProcedures = doctorPayrollItems.reduce((sum, item) => sum + (item.commission?.procedures || 0), 0);

  document.getElementById("payrollSummary").innerHTML = [
    ["Total bruto", currency.format(grossTotal)],
    ["Deducciones", currency.format(deductionsTotal)],
    ["Total neto", currency.format(netTotal)],
    ["Puntos doctores", doctorPoints],
    ["Pagados", `${paidCount}/${payrollItems.length}`]
  ].map(panelCardTemplate).join("");

  document.getElementById("procedurePointTable").innerHTML = procedurePointCatalog.map((procedure) => `
    <tr>
      <td><strong>${escapeHtml(procedure.name)}</strong></td>
      <td>${procedure.points}</td>
      <td>${currency.format(procedure.value)}</td>
    </tr>
  `).join("");

  document.getElementById("adminPayrollSummary").innerHTML = [
    ["Empleados", adminPayrollItems.length],
    ["Deducciones", currency.format(adminDeductions)],
    ["Neto administrativo", currency.format(adminNetTotal)]
  ].map(panelCardTemplate).join("");

  document.getElementById("doctorPayrollSummary").innerHTML = [
    ["Doctores", doctorPayrollItems.length],
    ["Puntos", doctorPoints],
    ["Procedimientos", doctorProcedures],
    ["Comisión total", currency.format(doctorCommissionTotal)]
  ].map(panelCardTemplate).join("");

  document.getElementById("adminPayrollTable").innerHTML = adminPayrollItems.map((item) => {
    const user = userById(item.userId);
    return `
      <tr>
        <td>
          <div class="patient-name">
            <strong>${escapeHtml(user.name)}</strong>
            <small>${escapeHtml(item.period)} · Salario fijo · ${item.novelty?.count || 0} novedades</small>
          </div>
        </td>
        <td>${escapeHtml(user.role || "Sin rol")}</td>
        <td>${currency.format(item.base)}</td>
        <td>${currency.format(item.bonus)}</td>
        <td>${currency.format(item.deductions)}</td>
        <td><strong>${currency.format(payrollNet(item))}</strong></td>
        <td><span class="status-pill ${item.status === "Pagado" ? "pagado" : "pendiente"}">${escapeHtml(item.status)}</span></td>
      </tr>
    `;
  }).join("");

  document.getElementById("doctorPayrollTable").innerHTML = doctorPayrollItems.map((item) => {
    const user = userById(item.userId);
    return `
      <tr>
        <td>
          <div class="patient-name">
            <strong>${escapeHtml(user.name)}</strong>
            <small>${escapeHtml(item.period)} · Comisión por procedimientos completados · ${item.novelty?.count || 0} novedades</small>
          </div>
        </td>
        <td>${escapeHtml(user.specialty || "Sin especialidad")}</td>
        <td>${item.commission?.points || 0} pts</td>
        <td>${item.commission?.procedures || 0}</td>
        <td><strong>${currency.format(item.bonus)}</strong></td>
        <td><span class="status-pill ${item.status === "Pagado" ? "pagado" : "pendiente"}">${escapeHtml(item.status)}</span></td>
      </tr>
    `;
  }).join("");
}

function payrollDisplayItem(item) {
  const user = userById(item.userId);
  const novelty = payrollNoveltyImpact(item.userId);
  if (user.role !== "Doctor") {
    return {
      ...item,
      bonus: item.bonus + novelty.income,
      deductions: item.deductions + novelty.deduction,
      novelty
    };
  }

  const commission = doctorCommission(item.userId);
  return {
    ...item,
    base: 0,
    bonus: commission.amount + novelty.income,
    deductions: novelty.deduction,
    commission,
    novelty
  };
}

function normalizedPayroll() {
  state.payroll ||= [];
  users.forEach((user) => {
    if (!state.payroll.some((item) => item.userId === user.id)) {
      state.payroll.push({
        id: makeId(),
        userId: user.id,
        period: "Mayo 2026",
        base: user.role === "Doctor" ? 0 : payrollSeed[user.id]?.base || 45000,
        bonus: user.role === "Doctor" ? 0 : payrollSeed[user.id]?.bonus || 0,
        deductions: user.role === "Doctor" ? 0 : payrollSeed[user.id]?.deductions || 0,
        status: "Pendiente"
      });
    }
  });
  return state.payroll;
}

function payrollNet(item) {
  return payrollGross(item) - item.deductions;
}

function payrollGross(item) {
  return userById(item.userId).role === "Doctor" ? item.bonus : item.base + item.bonus;
}

function payrollNoveltyImpact(userId) {
  return (state.payrollNovelties || [])
    .filter((novelty) => novelty.userId === userId)
    .reduce((summary, novelty) => {
      const amount = Number(novelty.amount) || 0;
      if (["Ingreso", "Ajuste"].includes(novelty.type)) {
        summary.income += amount;
      } else {
        summary.deduction += amount;
      }
      summary.count += 1;
      return summary;
    }, { income: 0, deduction: 0, count: 0 });
}

function doctorCommission(doctorId) {
  return state.treatments
    .filter((treatment) => treatment.doctorId === doctorId)
    .filter((treatment) => treatment.progress >= 100 || treatment.status === "Completado")
    .reduce((summary, treatment) => {
      const procedure = procedureByName(treatment.name);
      const points = Number(treatment.procedurePoints ?? procedure?.points ?? 0);
      const amount = Number(treatment.procedureValue ?? procedure?.value ?? 0);
      summary.points += points;
      summary.amount += amount;
      summary.procedures += points > 0 || amount > 0 ? 1 : 0;
      return summary;
    }, { points: 0, amount: 0, procedures: 0 });
}

function procedureByName(name) {
  return procedurePointCatalog.find((procedure) => normalizeText(procedure.name) === normalizeText(name));
}

function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function renderUsersPanel() {
  const activeUsers = users.length;
  const admins = users.filter((user) => user.role === "Administrador").length;
  const usersWithOverrides = Object.keys(userPermissionOverrides).length;
  const panelAccessCount = users.reduce((sum, user) => sum + permissionsForUser(user.id).views.filter((view) => panelViews.includes(view)).length, 0);
  const searchTerm = document.getElementById("userSearch")?.value.trim().toLowerCase() || "";
  const roleFilter = document.getElementById("userRoleFilter")?.value || "Todos";
  const visibleUsers = users.filter((user) => {
    const haystack = `${user.name} ${user.role} ${user.specialty} ${user.room}`.toLowerCase();
    return haystack.includes(searchTerm) && (roleFilter === "Todos" || user.role === roleFilter);
  });
  if (!users.some((user) => user.id === selectedUserId)) selectedUserId = users[0]?.id;
  if (visibleUsers.length && !visibleUsers.some((user) => user.id === selectedUserId)) {
    selectedUserId = visibleUsers[0].id;
  }

  document.getElementById("usersPanelCards").innerHTML = [
    ["Usuarios activos", activeUsers],
    ["Administradores", admins],
    ["Permisos personalizados", usersWithOverrides],
    ["Accesos a paneles", panelAccessCount]
  ].map(panelCardTemplate).join("");

  renderUserDirectorySummary(visibleUsers);

  document.getElementById("compactUserList").innerHTML = visibleUsers.length
    ? visibleUsers.map((user) => `
      <button class="compact-user ${user.id === selectedUserId ? "active" : ""}" data-select-user="${user.id}" type="button">
        <div>
          <strong>${escapeHtml(user.name)}</strong>
          <span>${escapeHtml(user.role)} · ${escapeHtml(user.specialty)}</span>
        </div>
        <small>${permissionsForUser(user.id).views.filter((view) => panelViews.includes(view)).length} paneles</small>
      </button>
    `).join("")
    : emptyState("No hay usuarios con ese criterio.");

  document.querySelectorAll("[data-select-user]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedUserId = button.dataset.selectUser;
      renderUsersPanel();
    });
  });

  renderSelectedUserPermissions();
}

function renderUserDirectorySummary(visibleUsers) {
  const roles = ["Doctor", "Recepción", "Recursos Humanos", "Laboratorio", "Contabilidad", "Administrador"];
  document.getElementById("userDirectorySummary").innerHTML = roles.map((role) => {
    const total = users.filter((user) => user.role === role).length;
    const visible = visibleUsers.filter((user) => user.role === role).length;
    return `
      <button class="user-role-chip" data-role-filter="${role}" type="button">
        <span>${escapeHtml(role)}</span>
        <strong>${visible}/${total}</strong>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-role-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById("userRoleFilter").value = button.dataset.roleFilter;
      renderUsersPanel();
    });
  });
}

function renderSelectedUserPermissions() {
  const user = users.find((item) => item.id === selectedUserId) || users[0];
  if (!user) return;

  document.getElementById("selectedUserTitle").textContent = user.name;
  document.getElementById("selectedUserMeta").textContent = `${user.role} · ${user.specialty} · ${user.room}`;

  renderPermissionMatrix(user.id);
}

function selectedUserSummary(user) {
  return `
    <article class="staff-card selected-user-card">
      <div>
        <span class="status-pill ${user.role === "Doctor" ? "confirmada" : "pendiente"}">${escapeHtml(user.role)}</span>
        <h2>${escapeHtml(user.name)}</h2>
        <p>${escapeHtml(user.specialty)} · ${escapeHtml(user.room)}</p>
      </div>
      <div class="staff-permissions">
        <strong>Permisos</strong>
        <span>${permissionsForUser(user.id).views.map((view) => views[view] || view).join(", ")}</span>
        <small>${escapeHtml(selfServicePermissionLabel(permissionsForUser(user.id)))}</small>
      </div>
    </article>
  `;
}

function selfServicePermissionLabel(userPermissions) {
  if (!userPermissions.views.includes("selfService")) return "Autoservicio: sin acceso";
  const labels = [];
  if (userPermissions.actions.includes("selfservice:clinical")) labels.push("clínico");
  if (userPermissions.actions.includes("selfservice:employee")) labels.push("empleados");
  if (userPermissions.actions.includes("selfservice:manage")) labels.push("gestión");
  return `Autoservicio: ${labels.join(", ") || "solo consulta"}`;
}

function renderPermissionMatrix(targetUserId = selectedUserId) {
  const canEditPermissions = currentUser?.role === "Administrador";
  const user = users.find((item) => item.id === targetUserId) || users[0];
  const userPermissions = permissionsForUser(user.id);
  const grouped = ["Paneles", "Doctores", "Recepción", "Laboratorio", "Contabilidad"]
      .map((group) => {
        const items = permissionCatalog.filter((item) => item.panel === group);
        return `
          <div class="permission-group">
            <strong>${group}</strong>
            ${items.map((item) => `
              <label class="permission-toggle">
                  <input
                  type="checkbox"
                  data-permission-user="${user.id}"
                  data-permission-view="${item.view}"
                  ${userPermissions.views.includes(item.view) ? "checked" : ""}
                  ${!canEditPermissions || user.id === "admin" ? "disabled" : ""}
                >
                <span>${escapeHtml(item.label)}</span>
              </label>
            `).join("")}
          </div>
        `;
      }).join("");
  const helpText = canEditPermissions
    ? user.id === "admin" ? "El Administrador conserva acceso completo." : "Activa solo los paneles y módulos que correspondan."
    : "Solo el Administrador puede modificar permisos.";

  document.getElementById("permissionMatrix").innerHTML = `
    ${selectedUserSummary(user)}
    <article class="permission-user compact">
      <div>
        <span class="status-pill ${user.role === "Administrador" ? "confirmada" : "pendiente"}">${escapeHtml(user.role)}</span>
        <h2>Accesos</h2>
        <p>${helpText}</p>
      </div>
      <div class="permission-groups">${grouped}</div>
    </article>
  `;

  document.querySelectorAll("[data-permission-user]").forEach((input) => {
    input.addEventListener("change", () => updateUserPermission(input));
  });
}

function updateUserPermission(input) {
  if (currentUser?.role !== "Administrador") return;
  const userId = input.dataset.permissionUser;
  if (userId === "admin") return;

  const nextPermissions = permissionsForUser(userId);
  const viewName = input.dataset.permissionView;
  const catalogItem = permissionCatalog.find((item) => item.view === viewName);
  if (!catalogItem) return;

  if (input.checked) {
    nextPermissions.views = [...new Set([...nextPermissions.views, viewName])];
    const user = users.find((item) => item.id === userId);
    const actions = viewName === "selfService" ? allowedSelfServiceActionsForRole(user?.role) : catalogItem.actions;
    nextPermissions.actions = [...new Set([...nextPermissions.actions, ...actions])];
  } else {
    nextPermissions.views = nextPermissions.views.filter((view) => view !== viewName);
    nextPermissions.actions = nextPermissions.actions.filter((action) => !catalogItem.actions.includes(action));
  }

  userPermissionOverrides[userId] = {
    views: nextPermissions.views,
    actions: nextPermissions.actions
  };
  saveUserPermissionOverrides();
  renderHrPanel();
  applyPermissions();
  render();
}

function renderAccountingPanel() {
  const collectedToday = state.payments
    .filter((payment) => payment.date === todayIso)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingTotal = state.patients.reduce((sum, patient) => sum + patient.balance, 0);
  const methodTotals = state.payments.reduce((summary, payment) => {
    summary[payment.method] = (summary[payment.method] || 0) + payment.amount;
    return summary;
  }, {});

  document.getElementById("accountingPanelCards").innerHTML = [
    ["Ingresos hoy", currency.format(collectedToday)],
    ["Cuentas por cobrar", currency.format(pendingTotal)],
    ["Recibos", state.payments.length],
    ["Método principal", topPaymentMethod(methodTotals)]
  ].map(panelCardTemplate).join("");

  renderPanelModules("accountingPanelModules", "accountingPanel");

  document.getElementById("accountingLedger").innerHTML = state.payments.length
    ? state.payments.slice(0, 5).map((payment) => `
      <article class="ledger-item">
        <span class="amount-pill">${currency.format(payment.amount)}</span>
        <div>
          <strong>${escapeHtml(payment.receiptNumber || "REC-S/N")} · ${escapeHtml(patientById(payment.patientId).name)}</strong>
          <p>${escapeHtml(payment.method)} · ${escapeHtml(payment.concept)} · ${formatDate(payment.date)}</p>
        </div>
      </article>
    `).join("")
    : emptyState("No hay recibos registrados.");

  const balances = state.patients.filter((patient) => patient.balance > 0);
  document.getElementById("accountingBalances").innerHTML = balances.length
    ? balances.slice(0, 5).map((patient) => `
      <article class="alert-item">
        <span class="amount-pill">${currency.format(patient.balance)}</span>
        <div><strong>${escapeHtml(patient.name)}</strong><p>${escapeHtml(patient.phone)}</p></div>
      </article>
    `).join("")
    : emptyState("No hay balances pendientes.");
}

function panelCardTemplate([label, valueText]) {
  return `
    <article class="panel-card">
      <span>${label}</span>
      <strong>${valueText}</strong>
    </article>
  `;
}

function renderPanelModules(containerId, panelView) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const modules = (panelModules[panelView] || [])
    .filter((viewName) => canView(viewName))
    .map(moduleButtonTemplate)
    .join("");
  container.innerHTML = modules || emptyState("No hay módulos habilitados para este panel.");
}

function moduleButtonTemplate(viewName) {
  return `<button class="module-button" data-view-jump="${viewName}" type="button">${views[viewName] || viewName}</button>`;
}

function renderPatients() {
  ensurePatientCodes();
  const term = document.getElementById("globalSearch").value.trim().toLowerCase();
  const patients = state.patients.filter((patient) => {
    const haystack = [
      patient.name,
      patient.code,
      patient.phone,
      patient.email,
      patient.documentType,
      patient.nationality,
      patient.document,
      patient.emergencyName,
      patient.emergencyPhone,
      patient.emergencyRelation,
      patient.insurance,
      patient.allergies,
      patient.conditions,
      patient.medications,
      patient.clinicalHistory,
      patient.notes
    ].join(" ").toLowerCase();
    return haystack.includes(term);
  });

  document.getElementById("patientTable").innerHTML = patients
    .map((patient) => `
      <tr>
        <td>
          <div class="patient-profile">
            ${patientPhotoTemplate(patient)}
            <div class="patient-name">
              <strong>${escapeHtml(patient.name)}</strong>
              <small>${escapeHtml(patient.code || "")} · ${escapeHtml(patient.documentType || "Documento")}: ${escapeHtml(patientDocumentLabel(patient))}</small>
            </div>
          </div>
        </td>
        <td>
          <div class="patient-detail">
            <span>${escapeHtml(patient.phone)}</span>
            <small>${escapeHtml(patient.email || "Sin correo")} · ${patientAge(patient.birthdate)} · ${escapeHtml(patient.gender || "No especificado")} · ${escapeHtml(patient.nationality || "Dominicano")}</small>
            <small>${escapeHtml(patient.address || "Sin dirección")}</small>
            <small>Emergencia: ${escapeHtml(emergencyContactText(splitEmergencyContact(patient)) || "No registrada")}</small>
          </div>
        </td>
        <td>${escapeHtml(patient.insurance)}</td>
        <td><span class="status-pill ${patient.allergies && patient.allergies !== "Ninguna" ? "caries" : "sano"}">${escapeHtml(patient.allergies || "Ninguna")}</span></td>
        <td>
          <div class="patient-detail">
            <span>${escapeHtml(patient.clinicalHistory || patient.notes || "Sin historial registrado")}</span>
            <small>Condiciones: ${escapeHtml(patient.conditions || "Sin registro")}</small>
            <small>Medicamentos: ${escapeHtml(patient.medications || "Sin registro")}</small>
            <small>Última visita: ${formatDate(patient.lastVisit)}</small>
          </div>
        </td>
        <td>${currency.format(patient.balance)}</td>
        <td><span class="status-pill ${patient.balance > 0 ? "pendiente" : "confirmada"}">${escapeHtml(patient.status)}</span></td>
        <td>
          <div class="table-actions">
            <button class="ghost-button" data-record-patient="${patient.id}" type="button">Ficha</button>
            <button class="ghost-button" data-edit-patient="${patient.id}" type="button">Editar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");

  document.querySelectorAll("[data-edit-patient]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("patients:create")) return;
      openPatientForm(button.dataset.editPatient);
    });
  });

  document.querySelectorAll("[data-record-patient]").forEach((button) => {
    button.addEventListener("click", () => openPatientRecord(button.dataset.recordPatient));
  });
}

function renderSelfService() {
  const resultsContainer = document.getElementById("selfServiceResults");
  const detailContainer = document.getElementById("selfServiceDetail");
  const requestContainer = document.getElementById("selfServiceRequestList");
  if (!resultsContainer || !detailContainer || !requestContainer) return;
  const term = normalizeText(value("selfServiceSearch"));
  const matches = term
    ? state.patients.filter((patient) => normalizeText([
        patient.name,
        patient.code,
        patient.document,
        patient.phone,
        patient.email
      ].join(" ")).includes(term)).slice(0, 8)
    : [];

  resultsContainer.innerHTML = matches.length
    ? matches.map((patient) => `
      <article class="alert-item">
        <span class="status-pill confirmada">${escapeHtml(patient.code || "Paciente")}</span>
        <div>
          <strong>${escapeHtml(patient.name)}</strong>
          <p>${escapeHtml(patient.phone)} · ${escapeHtml(patientDocumentLabel(patient))}</p>
        </div>
        <button class="ghost-button" data-self-service-patient="${patient.id}" type="button">Seleccionar</button>
      </article>
    `).join("")
    : emptyState(term ? "No se encontraron pacientes." : "Digite un dato para consultar.");

  if (!selectedSelfServicePatientId && matches[0]) {
    selectedSelfServicePatientId = matches[0].id;
  }
  if (selectedSelfServicePatientId && !state.patients.some((patient) => patient.id === selectedSelfServicePatientId)) {
    selectedSelfServicePatientId = null;
  }
  detailContainer.innerHTML = selectedSelfServicePatientId
    ? selfServiceDetailTemplate(patientById(selectedSelfServicePatientId))
    : emptyState("Seleccione un paciente para ver su autoservicio.");

  document.querySelectorAll("[data-self-service-patient]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSelfServicePatientId = button.dataset.selfServicePatient;
      renderSelfService();
    });
  });
  document.querySelectorAll("[data-self-checkin]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("appointments:confirm")) return;
      const appointment = state.appointments.find((item) => item.id === button.dataset.selfCheckin);
      if (!appointment) return;
      appointment.status = "Confirmada";
      appointment.checkInAt = new Date().toISOString();
      persistAndRender();
    });
  });
  document.querySelectorAll("[data-self-record]").forEach((button) => {
    button.addEventListener("click", () => openPatientRecord(button.dataset.selfRecord));
  });
  requestContainer.innerHTML = selfServiceVisibleRequests().length
    ? selfServiceVisibleRequests().map(selfServiceRequestTemplate).join("")
    : emptyState("No hay solicitudes de autoservicio registradas.");
  syncSelfServiceRequestOptions();
}

function selfServiceDetailTemplate(patient) {
  const appointments = state.appointments
    .filter((appointment) => appointment.patientId === patient.id && appointment.date >= todayIso && appointment.status !== "Cancelada")
    .sort(sortByDateTime)
    .slice(0, 5);
  return `
    <div class="self-service-summary">
      <article class="record-block">
        <h3>${escapeHtml(patient.name)}</h3>
        <p>${escapeHtml(patient.phone)} · ${escapeHtml(patient.email || "Sin correo")}</p>
        <p>${escapeHtml(patient.documentType || "Documento")}: ${escapeHtml(patientDocumentLabel(patient))}</p>
        <p>Balance: <strong>${currency.format(patient.balance || 0)}</strong></p>
        <div class="table-actions">
          <button class="ghost-button" data-self-record="${patient.id}" type="button">Abrir ficha</button>
          <button class="ghost-button" data-view-jump="agenda" type="button">Ir a agenda</button>
          <button class="ghost-button" data-view-jump="billing" type="button">Ir a facturación</button>
        </div>
      </article>
      <section class="record-block">
        <h3>Próximas citas</h3>
        <div class="clinical-list">
          ${appointments.length ? appointments.map((appointment) => `
            <article class="clinical-item">
              <span class="time-chip">${formatDate(appointment.date)}</span>
              <div>
                <strong>${escapeHtml(appointment.time)} · ${escapeHtml(appointment.type)}</strong>
                <p>${escapeHtml(doctorById(appointment.doctorId).name)} · ${escapeHtml(appointment.status)}</p>
              </div>
              <button class="ghost-button ${can("appointments:confirm") ? "" : "permission-hidden"}" data-self-checkin="${appointment.id}" type="button">Confirmar llegada</button>
            </article>
          `).join("") : emptyState("No hay próximas citas.")}
        </div>
      </section>
      <section class="record-block">
        <h3>Solicitud rápida</h3>
        <p>Para actualizar datos, solicitar cita o consultar balance, el personal puede abrir la ficha, agenda o facturación desde este autoservicio.</p>
      </section>
    </div>
  `;
}

function selfServiceVisibleRequests() {
  state.selfServiceRequests ||= [];
  if (can("selfservice:manage")) {
    return state.selfServiceRequests.slice(0, 12);
  }
  return state.selfServiceRequests
    .filter((request) => request.createdBy === currentUser?.id)
    .slice(0, 12);
}

function syncSelfServiceRequestOptions() {
  const typeSelect = document.getElementById("selfRequestType");
  if (!typeSelect) return;
  const options = selfServiceRequestOptionsForCurrentUser();
  const current = typeSelect.value;
  typeSelect.innerHTML = options.map((option) => `<option>${option}</option>`).join("");
  if (options.includes(current)) typeSelect.value = current;
  document.getElementById("selfServiceRequestForm").classList.toggle("permission-disabled", !options.length);
}

function selfServiceRequestOptionsForCurrentUser() {
  const clinicalOptions = ["Placa adicional", "Laboratorio - pieza dental", "Insumos de trabajo", "Ausencia doctor", "Reparación de equipo", "Ticket de TI"];
  const employeeOptions = ["Vacaciones empleado", "Insumos de trabajo", "Ticket de TI", "Reparación de equipo"];
  const options = [];
  if (can("selfservice:clinical")) options.push(...clinicalOptions);
  if (can("selfservice:employee")) options.push(...employeeOptions);
  return [...new Set(options)];
}

function canCreateSelfServiceRequest(type) {
  return selfServiceRequestOptionsForCurrentUser().includes(type);
}

function selfServiceRequestTemplate(request) {
  const patient = request.patientId ? patientById(request.patientId) : null;
  return `
    <article class="ledger-item">
      <span class="status-pill ${request.status === "Activa" ? "confirmada" : "pendiente"}">${escapeHtml(request.status)}</span>
      <div>
        <strong>${escapeHtml(request.type)}${request.piece ? ` · ${escapeHtml(request.piece)}` : ""}</strong>
        <p>${patient ? `Paciente: ${escapeHtml(patient.name)} · ` : ""}${escapeHtml(request.detail)}${request.start ? ` · ${formatDate(request.start)}${request.end && request.end !== request.start ? ` a ${formatDate(request.end)}` : ""}` : ""}</p>
        <small>Solicitado por ${escapeHtml(userById(request.createdBy).name)} · ${formatDateTime(request.createdAt)}</small>
      </div>
    </article>
  `;
}

function ensurePatientCodes() {
  let changed = false;
  state.patients.forEach((patient) => {
    if (!patient.code) {
      patient.code = nextPatientCode();
      changed = true;
    }
    if (!patient.documentType) {
      patient.documentType = "Cédula";
      changed = true;
    } else if (patient.documentType === "Licencia médica") {
      patient.documentType = "Licencia de conducir";
      changed = true;
    }
    if (!patient.nationality) {
      patient.nationality = "Dominicano";
      changed = true;
    }
    const minor = patientIsMinor(patient);
    if (minor !== Boolean(patient.isMinor)) {
      patient.isMinor = minor;
      changed = true;
    }
    if (patient.isMinor && patient.document) {
      patient.document = "";
      changed = true;
    }
    if (patient.emergency && !patient.emergencyName && !patient.emergencyPhone) {
      const emergency = splitEmergencyContact(patient);
      patient.emergencyName = emergency.name;
      patient.emergencyPhone = emergency.phone;
      patient.emergencyRelation = emergency.relation;
      changed = true;
    }
  });
  if (changed) saveState();
}

function openPatientRecord(patientId) {
  const patient = patientById(patientId);
  const patientAppointments = state.appointments
    .filter((appointment) => appointment.patientId === patientId)
    .sort(sortByDateTime);
  const upcomingAppointments = patientAppointments.filter((appointment) =>
    appointment.date >= todayIso && appointment.status !== "Cancelada"
  );
  const patientTreatments = state.treatments
    .filter((treatment) => treatment.patientId === patientId);
  const patientPayments = state.payments
    .filter((payment) => payment.patientId === patientId);
  const patientDocuments = (state.clinicalDocuments || [])
    .filter((documentItem) => documentItem.patientId === patientId);
  const patientPlates = (state.patientPlates || [])
    .filter((plate) => plate.patientId === patientId)
    .sort((a, b) => String(b.takenAt).localeCompare(String(a.takenAt)));
  const patientDentalHistory = (state.odontogramHistory || [])
    .filter((item) => item.patientId === patientId)
    .slice(0, 8);
  const paidTotal = patientPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const treatmentTotal = patientTreatments.reduce((sum, treatment) => sum + treatment.cost, 0);
  const emergency = splitEmergencyContact(patient);

  document.getElementById("patientRecordTitle").textContent = `${patient.name} · ${patient.code || ""}`;
  document.getElementById("patientRecordMeta").textContent = `${patient.documentType || "Documento"}: ${patientDocumentLabel(patient)} · ${patientAge(patient.birthdate)} · ${patient.phone}`;
  document.getElementById("patientRecordContent").innerHTML = `
    <div class="patient-record-grid">
      <section class="record-block">
        <h3>Datos personales</h3>
        <div class="record-patient-card">
          ${patientPhotoTemplate(patient)}
          <div>
            <strong>${escapeHtml(patient.name)}</strong>
            <span>${escapeHtml(patient.email || "Sin correo")}</span>
            <span>${escapeHtml(patient.nationality || "Dominicano")} · ${escapeHtml(patient.gender || "No especificado")}</span>
            <span>${escapeHtml(patient.address || "Sin dirección")}</span>
            <span>Emergencia: ${escapeHtml(emergency.name || "No registrada")} · ${escapeHtml(emergency.phone || "Sin teléfono")} · ${escapeHtml(emergency.relation || "Sin parentesco")}</span>
          </div>
        </div>
      </section>
      <section class="record-block">
        <h3>Alertas clínicas</h3>
        <p>Alergias: <strong>${escapeHtml(patient.allergies || "Ninguna")}</strong></p>
        <p>Condiciones: ${escapeHtml(patient.conditions || "Sin registro")}</p>
        <p>Medicamentos: ${escapeHtml(patient.medications || "Sin registro")}</p>
      </section>
      <section class="record-block">
        <h3>Historial clínico</h3>
        <p>${escapeHtml(patient.clinicalHistory || patient.notes || "Sin historial registrado")}</p>
        <p>Última visita: ${formatDate(patient.lastVisit)}</p>
      </section>
      <section class="record-block">
        <h3>Resumen financiero</h3>
        <p>Tratamientos: <strong>${currency.format(treatmentTotal)}</strong></p>
        <p>Pagado: <strong>${currency.format(paidTotal)}</strong></p>
        <p>Balance: <strong>${currency.format(patient.balance)}</strong></p>
      </section>
    </div>
    ${upcomingAppointmentsByDoctorSection(upcomingAppointments)}
    ${patientRecordSection("Citas", patientAppointments, appointmentRecordTemplate)}
    ${patientRecordSection("Tratamientos", patientTreatments, treatmentRecordTemplate)}
    ${patientRecordSection("Pagos y facturas", patientPayments, paymentRecordTemplate)}
    ${patientPlatesSection(patient.id, patientPlates)}
    ${patientRecordSection("Documentos clínicos", patientDocuments, documentRecordTemplate)}
    ${patientRecordSection("Historial odontograma", patientDentalHistory, dentalHistoryRecordTemplate)}
  `;
  bindPatientPlateForm(patient.id);
  document.getElementById("patientRecordDialog").showModal();
}

function closePatientRecord() {
  document.getElementById("patientRecordDialog").close();
}

function patientRecordSection(title, items, template) {
  return `
    <section class="record-block full">
      <h3>${title}</h3>
      <div class="clinical-list">
        ${items.length ? items.map(template).join("") : emptyState("Sin registros.")}
      </div>
    </section>
  `;
}

function upcomingAppointmentsByDoctorSection(appointments) {
  const grouped = appointments.reduce((summary, appointment) => {
    summary[appointment.doctorId] ||= [];
    summary[appointment.doctorId].push(appointment);
    return summary;
  }, {});
  const groups = Object.entries(grouped);
  return `
    <section class="record-block full">
      <h3>Próximas citas por doctor</h3>
      <div class="appointment-doctor-groups">
        ${groups.length ? groups.map(([doctorId, items]) => `
          <article class="doctor-appointment-group">
            <strong>${escapeHtml(doctorById(doctorId).name)}</strong>
            <div class="clinical-list">
              ${items.sort(sortByDateTime).map((appointment) => `
                <article class="clinical-item">
                  <span class="time-chip">${formatDate(appointment.date)}</span>
                  <div>
                    <strong>${escapeHtml(appointment.time)} · ${escapeHtml(appointment.type)}</strong>
                    <p>${escapeHtml(appointment.status)} · ${appointment.duration || 30} min · ${escapeHtml(appointment.reminder || "Sin recordatorio")}</p>
                  </div>
                </article>
              `).join("")}
            </div>
          </article>
        `).join("") : emptyState("No hay próximas citas registradas.")}
      </div>
    </section>
  `;
}

function patientPlatesSection(patientId, plates) {
  return `
    <section class="record-block full">
      <h3>Histórico de placas</h3>
      <form class="inline-form plate-form" id="patientPlateForm" data-patient-id="${patientId}">
        <input id="patientPlateTakenAt" type="datetime-local" required>
        <select id="patientPlateType">
          <option>Panorámica</option>
          <option>Periapical</option>
          <option>Bitewing</option>
          <option>Oclusal</option>
          <option>Cefalométrica</option>
          <option>Tomografía</option>
          <option>Otra</option>
        </select>
        <input id="patientPlateNote" placeholder="Nota o zona evaluada">
        <input id="patientPlateFile" type="file" accept="image/*,.pdf" required>
        <button class="primary-button" type="submit">Cargar placa</button>
      </form>
      <div class="plate-history">
        ${plates.length ? plates.map(plateRecordTemplate).join("") : emptyState("Sin placas registradas.")}
      </div>
    </section>
  `;
}

function plateRecordTemplate(plate) {
  const isImage = String(plate.file || "").startsWith("data:image/");
  return `
    <article class="plate-item">
      ${isImage ? `<img src="${plate.file}" alt="Placa ${escapeHtml(plate.type)}">` : `<div class="plate-file">PDF</div>`}
      <div>
        <strong>${escapeHtml(plate.type)}</strong>
        <p>${formatDateTime(plate.takenAt)} · ${escapeHtml(plate.note || "Sin nota")}</p>
        <small>Cargada por ${escapeHtml(userById(plate.createdBy).name)} · ${formatDateTime(plate.createdAt)}</small>
        <a class="ghost-link" href="${plate.file}" target="_blank" rel="noopener">Ver archivo</a>
      </div>
    </article>
  `;
}

function bindPatientPlateForm(patientId) {
  const form = document.getElementById("patientPlateForm");
  if (!form) return;
  document.getElementById("patientPlateTakenAt").value = localDateTimeValue();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById("patientPlateFile");
    const file = fileInput.files[0];
    if (!file) return;
    state.patientPlates ||= [];
    state.patientPlates.unshift({
      id: makeId(),
      patientId,
      type: value("patientPlateType"),
      note: value("patientPlateNote"),
      takenAt: value("patientPlateTakenAt") || localDateTimeValue(),
      fileName: file.name,
      file: await readFileAsDataUrl(file),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "sin-usuario"
    });
    saveState();
    openPatientRecord(patientId);
  });
}

function appointmentRecordTemplate(appointment) {
  return `
    <article class="clinical-item">
      <span class="time-chip">${formatDate(appointment.date)}</span>
      <div>
        <strong>${escapeHtml(appointment.time)} · ${escapeHtml(appointment.type)}</strong>
        <p>${escapeHtml(doctorById(appointment.doctorId).name)} · ${escapeHtml(appointment.status)}</p>
      </div>
    </article>
  `;
}

function treatmentRecordTemplate(treatment) {
  return `
    <article class="clinical-item">
      <span class="status-pill ${treatment.progress >= 100 ? "confirmada" : "pendiente"}">${treatment.progress}%</span>
      <div>
        <strong>${escapeHtml(treatment.name)}</strong>
        <p>${escapeHtml(doctorById(treatment.doctorId).name)} · ${currency.format(treatment.cost)} · ${escapeHtml(treatment.status)}</p>
      </div>
    </article>
  `;
}

function paymentRecordTemplate(payment) {
  return `
    <article class="clinical-item">
      <span class="amount-pill">${currency.format(payment.amount)}</span>
      <div>
        <strong>${escapeHtml(payment.invoiceNumber || payment.receiptNumber || "Sin número")}</strong>
        <p>${escapeHtml(payment.concept)} · ${escapeHtml(payment.method)} · ${escapeHtml(paymentBillToLabel(payment))} · Doctor ${escapeHtml(paymentDoctorLabel(payment))} · Cajero ${escapeHtml(paymentCashierLabel(payment))} · ${formatDate(payment.date)}</p>
      </div>
    </article>
  `;
}

function documentRecordTemplate(documentItem) {
  return `
    <article class="clinical-item">
      <span class="status-pill confirmada">${escapeHtml(documentItem.type)}</span>
      <div>
        <strong>${escapeHtml(documentItem.title)}</strong>
        <p>${escapeHtml(documentItem.note)} · ${formatDate(documentItem.date)}</p>
      </div>
    </article>
  `;
}

function dentalHistoryRecordTemplate(item) {
  return `
    <article class="clinical-item">
      <span class="time-chip">${escapeHtml(item.tooth)}</span>
      <div>
        <strong>${escapeHtml(item.surface)} · ${labelStatus(item.status)}</strong>
        <p>${formatDate(item.date)} · ${escapeHtml(userById(item.userId).name)}</p>
      </div>
    </article>
  `;
}

function renderAgenda() {
  const dateFilter = value("agendaDateFilter") || todayIso;
  const statusFilter = value("agendaStatusFilter");
  const appointments = state.appointments
    .slice()
    .filter((appointment) => appointmentBelongsToCurrentDoctor(appointment))
    .filter((appointment) => appointment.date === dateFilter)
    .filter((appointment) => statusFilter === "Todas" || appointment.status === statusFilter)
    .sort(sortByDateTime)
  document.getElementById("calendarCaption").textContent = formatDate(dateFilter);
  document.getElementById("monthCalendar").innerHTML = renderMonthCalendar(dateFilter);
  document.getElementById("calendarDay").innerHTML = renderCalendarDay(appointments, dateFilter);

  document.getElementById("scheduleBoard").innerHTML = appointments.length
    ? appointments.map((appointment) => `
      <article class="schedule-item">
        <span class="time-chip">${appointment.time} · ${appointment.duration || 30} min</span>
        <div>
          <strong>${escapeHtml(patientById(appointment.patientId).name)}</strong>
          <p>${escapeHtml(appointment.type)} · ${escapeHtml(doctorById(appointment.doctorId).name)}</p>
          <p>Recordatorio: ${escapeHtml(appointment.reminder || "Sin recordatorio")}</p>
        </div>
        <div class="appointment-actions ${can("appointments:confirm") ? "" : "permission-hidden"}">
          <span class="status-pill ${className(appointment.status)}">${escapeHtml(appointment.status)}</span>
          <select data-status-appointment="${appointment.id}" aria-label="Estado de cita">
            ${appointmentStatusOptions(appointment.status)}
          </select>
          <button class="ghost-button" data-edit-appointment="${appointment.id}" type="button">Editar</button>
        </div>
      </article>
    `)
    .join("")
    : emptyState("No hay citas con estos filtros.");

  document.querySelectorAll("[data-status-appointment]").forEach((select) => {
    select.addEventListener("change", () => {
      if (!can("appointments:confirm")) return;
      const appointment = state.appointments.find((item) => item.id === select.dataset.statusAppointment);
      appointment.status = select.value;
      persistAndRender();
    });
  });

  document.querySelectorAll("[data-edit-appointment]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("appointments:create")) return;
      openAppointmentForm(button.dataset.editAppointment);
    });
  });
}

function renderMonthCalendar(dateFilter) {
  const selected = new Date(`${dateFilter}T12:00:00`);
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDay }, () => `<span class="month-day muted"></span>`).join("");
  const dayCells = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const count = state.appointments.filter((appointment) => appointment.date === iso && appointmentBelongsToCurrentDoctor(appointment)).length;
    return `
      <button class="month-day ${iso === dateFilter ? "active" : ""}" data-month-date="${iso}" type="button">
        <strong>${day}</strong>
        ${count ? `<span>${count}</span>` : ""}
      </button>
    `;
  }).join("");
  queueMicrotask(() => {
    document.querySelectorAll("[data-month-date]").forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById("agendaDateFilter").value = button.dataset.monthDate;
        renderAgenda();
      });
    });
  });
  return `
    <div class="month-weekdays">
      <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
    </div>
    <div class="month-grid">${blanks}${dayCells}</div>
  `;
}

function renderCalendarDay(appointments, dateFilter) {
  const hours = Array.from({ length: 11 }, (_, index) => `${String(index + 8).padStart(2, "0")}:00`);
  return hours
    .map((hour) => {
      const items = appointments.filter((appointment) => appointment.time.slice(0, 2) === hour.slice(0, 2));
      return `
        <div class="calendar-slot">
          <span>${hour}</span>
          <div>
            ${items.length ? items.map(calendarAppointmentTemplate).join("") : `<small>${formatDate(dateFilter)}</small>`}
          </div>
        </div>
      `;
    })
    .join("");
}

function calendarAppointmentTemplate(appointment) {
  return `
    <article class="calendar-chip ${className(appointment.status)}">
      <strong>${appointment.time}</strong>
      <span>${escapeHtml(patientById(appointment.patientId).name)}</span>
    </article>
  `;
}

function appointmentStatusOptions(currentStatus) {
  return ["Pendiente", "Confirmada", "Atendida", "Cancelada"]
    .map((status) => `<option ${status === currentStatus ? "selected" : ""}>${status}</option>`)
    .join("");
}

function renderOdontogram() {
  const patientId = value("odontogramPatient") || state.patients[0]?.id;
  const patient = patientById(patientId);
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  const teeth = [...upperTeeth, ...lowerTeeth];
  const chart = state.odontograms[patientId] || {};

  document.getElementById("recordPatientSummary").innerHTML = `
    <div class="record-patient-card">
      ${patientPhotoTemplate(patient)}
      <div>
        <strong>${escapeHtml(patient.name)}</strong>
        <span>${escapeHtml(patientDocumentLabel(patient))} · ${patientAge(patient.birthdate)}</span>
        <span>Alergias: ${escapeHtml(patient.allergies || "Ninguna")}</span>
        <span>Condiciones: ${escapeHtml(patient.conditions || "Sin registro")}</span>
      </div>
    </div>
  `;

  document.getElementById("toothGrid").innerHTML = `
    <div class="mouth-diagram">
      <div class="arch-label">Arcada superior</div>
      <div class="dental-arch upper-arch">
        ${upperTeeth.map((tooth) => toothTemplate(tooth, toothDisplayStatus(chart[tooth]), "upper", chart[tooth])).join("")}
      </div>
      <div class="mouth-divider"></div>
      <div class="dental-arch lower-arch">
        ${lowerTeeth.map((tooth) => toothTemplate(tooth, toothDisplayStatus(chart[tooth]), "lower", chart[tooth])).join("")}
      </div>
      <div class="arch-label">Arcada inferior</div>
    </div>
  `;

  document.querySelectorAll("[data-tooth]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("odontogram:edit")) return;
      selectTooth(button.dataset.tooth);
    });
  });

  const counts = teeth.reduce((summary, tooth) => {
    const status = toothDisplayStatus(chart[tooth]);
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});

  document.getElementById("toothSummary").innerHTML = ["sano", "caries", "restaurado", "ausente", "endodoncia", "implante"]
    .map((status) => `
      <div class="summary-row">
        <span class="status-pill ${status}">${labelStatus(status)}</span>
        <strong>${counts[status] || 0}</strong>
      </div>
    `)
    .join("");

  renderOdontogramHistory(patientId);
  renderClinicalRecord(patientId);
  refreshSelectedToothHint();
}

function renderOdontogramHistory(patientId) {
  const history = (state.odontogramHistory || [])
    .filter((item) => item.patientId === patientId)
    .slice(0, 6);
  document.getElementById("odontogramHistory").innerHTML = `
    <h3>Historial odontograma</h3>
    ${history.length ? history.map((item) => `
      <article class="clinical-item">
        <span class="time-chip">${escapeHtml(item.tooth)}</span>
        <div>
          <strong>${escapeHtml(item.surface)} · ${labelStatus(item.status)}</strong>
          <p>${formatDate(item.date)} · ${escapeHtml(userById(item.userId).name)}</p>
        </div>
      </article>
    `).join("") : emptyState("Sin cambios registrados.")}
  `;
}

function selectTooth(tooth) {
  selectedTooth = String(tooth);
  syncToothControlsFromSelection();
  renderOdontogram();
}

function toothTemplate(tooth, status, arch, rawStatus) {
  const selected = selectedTooth === String(tooth) ? " selected" : "";
  const surfaceMarkers = typeof rawStatus === "object" && rawStatus?.surfaces
    ? Object.entries(rawStatus.surfaces).map(([surface, surfaceStatus]) => `<span class="surface-dot ${surface} ${surfaceStatus}" title="${surface}: ${surfaceStatus}"></span>`).join("")
    : "";
  return `
    <button class="tooth ${status}${selected}" data-tooth="${tooth}" title="Pieza ${tooth}: ${labelStatus(status)}">
      <span class="tooth-shape ${arch}"></span>
      <span class="surface-map">${surfaceMarkers}</span>
      <span class="tooth-number">${tooth}</span>
    </button>
  `;
}

function toothDisplayStatus(entry) {
  if (!entry) return "sano";
  if (typeof entry === "string") return entry;
  return entry.status || Object.values(entry.surfaces || {}).find((status) => status !== "sano") || "sano";
}

function selectedToothStatusForSurface() {
  const patientId = value("odontogramPatient");
  const entry = state.odontograms[patientId]?.[selectedTooth];
  const surface = value("toothSurface");

  if (!entry) return "sano";
  if (surface !== "pieza" && typeof entry === "object") {
    return entry.surfaces?.[surface] || "sano";
  }
  return toothDisplayStatus(entry);
}

function syncToothControlsFromSelection() {
  if (!selectedTooth) return;
  document.getElementById("toothStatus").value = selectedToothStatusForSurface();
}

function refreshSelectedToothHint() {
  const hint = document.getElementById("selectedToothHint");
  const updateButton = document.getElementById("updateToothButton");
  if (!hint || !updateButton) return;

  const canUpdate = Boolean(selectedTooth && can("odontogram:edit"));
  updateButton.disabled = !canUpdate;
  hint.textContent = selectedTooth
    ? `Pieza ${selectedTooth} lista para actualizar`
    : "Selecciona una pieza";
}

function updateTooth(tooth) {
  const patientId = value("odontogramPatient");
  state.odontograms[patientId] ||= {};
  state.odontogramHistory ||= [];
  const surface = value("toothSurface");
  const status = value("toothStatus");
  if (surface === "pieza") {
    state.odontograms[patientId][tooth] = status;
  } else {
    const current = state.odontograms[patientId][tooth];
    const next = typeof current === "object" ? current : { status: current || "sano", surfaces: {} };
    next.surfaces ||= {};
    next.surfaces[surface] = status;
    next.status = Object.values(next.surfaces).find((status) => status !== "sano") || next.status || "sano";
    state.odontograms[patientId][tooth] = next;
  }
  state.odontogramHistory.unshift({
    id: makeId(),
    patientId,
    tooth: String(tooth),
    surface: surface === "pieza" ? "Pieza completa" : surface,
    status,
    date: todayIso,
    userId: currentUser?.id || "sin-usuario"
  });
  selectedTooth = String(tooth);
  persistAndRender();
}

function renderClinicalRecord(patientId) {
  const diagnoses = (state.diagnoses || [])
    .filter((diagnosis) => diagnosis.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const evolutions = (state.evolutions || [])
    .filter((evolution) => evolution.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const treatments = state.treatments
    .filter((treatment) => treatment.patientId === patientId)
    .filter((treatment) => treatmentBelongsToCurrentDoctor(treatment));
  const documents = (state.clinicalDocuments || [])
    .filter((documentItem) => documentItem.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById("diagnosisList").innerHTML = diagnoses.length
    ? diagnoses.map((diagnosis) => `
      <article class="clinical-item">
        <span class="status-pill ${diagnosisPriorityClass(diagnosis.priority)}">${escapeHtml(diagnosis.priority)}</span>
        <div>
          <strong>${escapeHtml(diagnosis.title)}</strong>
          <p>${escapeHtml(diagnosis.notes)}</p>
          <small>${formatDate(diagnosis.date)} · ${escapeHtml(userById(diagnosis.doctorId).name)}</small>
        </div>
      </article>
    `).join("")
    : emptyState("Sin diagnósticos registrados.");

  document.getElementById("evolutionList").innerHTML = evolutions.length
    ? evolutions.map((evolution) => `
      <article class="clinical-item">
        <span class="time-chip">${formatDate(evolution.date)}</span>
        <div>
          <strong>${escapeHtml(userById(evolution.doctorId).name)}</strong>
          <p>${escapeHtml(evolution.note)}</p>
        </div>
      </article>
    `).join("")
    : emptyState("Sin evolución registrada.");

  document.getElementById("recordTreatmentList").innerHTML = treatments.length
    ? treatments.map((treatment) => `
      <article class="clinical-treatment">
        <div>
          <strong>${escapeHtml(treatment.name)}</strong>
          <small>${escapeHtml(doctorById(treatment.doctorId).name)} · ${currency.format(treatment.cost)}</small>
        </div>
        <div class="progress-track"><div class="progress-bar" style="width:${treatment.progress}%"></div></div>
        <span>${treatment.progress}% · ${escapeHtml(treatment.status)}</span>
      </article>
    `).join("")
    : emptyState("Sin tratamientos registrados para este paciente.");

  document.getElementById("clinicalDocumentList").innerHTML = documents.length
    ? documents.map((documentItem) => `
      <article class="clinical-item">
        <span class="status-pill confirmada">${escapeHtml(documentItem.type)}</span>
        <div>
          <strong>${escapeHtml(documentItem.title)}</strong>
          <p>${escapeHtml(documentItem.note)}</p>
          <small>${formatDate(documentItem.date)} · ${escapeHtml(userById(documentItem.createdBy).name)}</small>
        </div>
      </article>
    `).join("")
    : emptyState("Sin documentos clínicos registrados.");
}

function diagnosisPriorityClass(priority) {
  return { Alta: "cancelada", Media: "pendiente", Baja: "confirmada" }[priority] || "pendiente";
}

function renderTreatments() {
  document.getElementById("treatmentCards").innerHTML = state.treatments
    .filter((treatment) => treatmentBelongsToCurrentDoctor(treatment))
    .map((treatment) => `
      <article class="treatment-card">
        <div>
          <span class="status-pill ${treatment.progress >= 100 ? "confirmada" : "pendiente"}">${escapeHtml(treatment.status)}</span>
          <h2>${escapeHtml(treatment.name)}</h2>
          <p>${escapeHtml(patientById(treatment.patientId).name)} · ${escapeHtml(doctorById(treatment.doctorId).name)} · ${currency.format(treatment.cost)}</p>
        </div>
        <div class="progress-track"><div class="progress-bar" style="width:${treatment.progress}%"></div></div>
        <div class="card-actions">
          <strong>${treatment.progress}%</strong>
          <button class="ghost-button ${can("treatments:progress") ? "" : "permission-hidden"}" data-progress-treatment="${treatment.id}">Avanzar</button>
        </div>
      </article>
    `)
    .join("");

  document.querySelectorAll("[data-progress-treatment]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("treatments:progress")) return;
      const treatment = state.treatments.find((item) => item.id === button.dataset.progressTreatment);
      treatment.progress = Math.min(100, treatment.progress + 15);
      treatment.status = treatment.progress >= 100 ? "Completado" : "En curso";
      persistAndRender();
    });
  });
}

function renderBilling() {
  const collectedToday = state.payments
    .filter((payment) => payment.date === todayIso)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const discountsToday = state.payments
    .filter((payment) => payment.date === todayIso)
    .reduce((sum, payment) => sum + (Number(payment.discount) || 0), 0);
  const productsToday = state.payments
    .filter((payment) => payment.date === todayIso && payment.type === "Producto")
    .reduce((sum, payment) => sum + (Number(payment.quantity) || 1), 0);
  const pendingTotal = state.patients.reduce((sum, patient) => sum + patient.balance, 0);
  const methodTotals = state.payments.reduce((summary, payment) => {
    summary[payment.method] = (summary[payment.method] || 0) + payment.amount;
    return summary;
  }, {});

  document.getElementById("billingSummary").innerHTML = [
    ["Cobrado hoy", currency.format(collectedToday)],
    ["Descuentos hoy", currency.format(discountsToday)],
    ["Productos facturados", productsToday],
    ["Balance pendiente", currency.format(pendingTotal)],
    ["Facturas/recibos", state.payments.length],
    ["Método principal", topPaymentMethod(methodTotals)]
  ].map(([label, valueText]) => `
    <article class="billing-card">
      <span>${label}</span>
      <strong>${valueText}</strong>
    </article>
  `).join("");

  document.getElementById("ledgerList").innerHTML = state.payments.length
    ? state.payments
        .map((payment) => `
          <article class="ledger-item">
            <span class="amount-pill">${currency.format(payment.amount)}</span>
            <div>
              <strong>${escapeHtml(payment.invoiceNumber || "FAC-S/N")} · ${escapeHtml(payment.receiptNumber || "REC-S/N")} · ${escapeHtml(patientById(payment.patientId).name)}</strong>
              <p>${escapeHtml(payment.concept)}${payment.type === "Producto" ? ` · Cant. ${payment.quantity || 1}` : ""} · ${escapeHtml(payment.method)} · ${escapeHtml(payment.invoiceStatus || "Pagada")}${payment.reference ? ` · Ref. ${escapeHtml(payment.reference)}` : ""} · ${escapeHtml(paymentBillToLabel(payment))} · Doctor ${escapeHtml(paymentDoctorLabel(payment))} · Cajero ${escapeHtml(paymentCashierLabel(payment))} · ${formatDate(payment.date)}</p>
              ${(payment.discount || 0) > 0 ? `<p>Descuento: ${currency.format(payment.discount)} · ${escapeHtml(payment.discountReason || "Sin motivo")}</p>` : ""}
            </div>
            <button class="ghost-button" data-receipt="${payment.id}">Recibo</button>
          </article>
        `)
        .join("")
    : emptyState("No hay pagos registrados.");

  document.querySelectorAll("[data-receipt]").forEach((button) => {
    button.addEventListener("click", () => openReceipt(button.dataset.receipt));
  });

  const balances = state.patients.filter((patient) => patient.balance > 0);
  document.getElementById("balanceList").innerHTML = balances.length
    ? balances
        .map((patient) => `
          <article class="alert-item">
            <span class="amount-pill">${currency.format(patient.balance)}</span>
            <div>
              <strong>${escapeHtml(patient.name)}</strong>
              <p>${escapeHtml(patient.phone)} · ${receivableAgeBucket(patient.lastVisit)} · Última visita: ${formatDate(patient.lastVisit)}</p>
            </div>
          </article>
        `)
        .join("")
    : emptyState("No hay balances pendientes.");

  renderCashClose();
}

function renderCashClose() {
  const totals = paymentMethodTotals(todayIso);
  const total = Object.values(totals).reduce((sum, amountValue) => sum + amountValue, 0);
  const opening = currentCashOpening();
  const lastClosing = (state.cashClosings || []).find((closing) => closing.date === todayIso);
  const openingAmount = opening?.openingAmount || lastClosing?.openingAmount || 0;
  document.getElementById("cashCloseSummary").innerHTML = [
    ["Estado", opening ? "Caja abierta" : lastClosing ? "Caja cerrada" : "Sin apertura"],
    ["Monto inicial", currency.format(openingAmount)],
    ["Ventas de hoy", currency.format(total)],
    ["Total esperado", currency.format(openingAmount + total)],
    ["Efectivo", currency.format(totals.Efectivo || 0)],
    ["Tarjeta", currency.format(totals.Tarjeta || 0)],
    ["Transferencia", currency.format(totals.Transferencia || 0)],
    ["Seguro", currency.format(totals.Seguro || 0)]
  ].map(panelCardTemplate).join("");

  document.getElementById("cashCloseHistory").innerHTML = (state.cashClosings || []).length
    ? state.cashClosings.slice(0, 5).map((closing) => `
      <article class="ledger-item">
        <span class="amount-pill">${currency.format(closing.expectedTotal || closing.total)}</span>
        <div>
          <strong>Cierre ${formatDate(closing.date)}</strong>
          <p>Apertura ${currency.format(closing.openingAmount || 0)} · Ventas ${currency.format(closing.total)} · Usuario: ${escapeHtml(userById(closing.closedBy).name)} · Efectivo ${currency.format(closing.totals.Efectivo || 0)} · Tarjeta ${currency.format(closing.totals.Tarjeta || 0)} · Transferencia ${currency.format(closing.totals.Transferencia || 0)}</p>
        </div>
      </article>
    `).join("")
    : emptyState("No hay cierres de caja registrados.");
}

function renderInventory() {
  state.inventory ||= [];
  const lowStock = state.inventory.filter((item) => item.stock <= item.min).length;
  const expiring = state.inventory.filter((item) => item.expiry && new Date(`${item.expiry}T12:00:00`) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)).length;
  const totalUnits = state.inventory.reduce((sum, item) => sum + item.stock, 0);

  document.getElementById("inventorySummary").innerHTML = [
    ["Materiales", state.inventory.length],
    ["Unidades", totalUnits],
    ["Stock bajo", lowStock],
    ["Vencen pronto", expiring]
  ].map(panelCardTemplate).join("");

  document.getElementById("inventoryTable").innerHTML = state.inventory.map((item) => {
    const isLow = item.stock <= item.min;
    const status = isLow ? "Stock bajo" : "Disponible";
    return `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${item.stock}</td>
        <td>${item.min}</td>
        <td>${currency.format(item.price || 0)}</td>
        <td>${item.expiry ? formatDate(item.expiry) : "Sin fecha"}</td>
        <td>${escapeHtml(item.provider || "Sin proveedor")}</td>
        <td><span class="status-pill ${isLow ? "cancelada" : "confirmada"}">${status}</span></td>
      </tr>
    `;
  }).join("");
}

function renderReports() {
  const income = state.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const cancelled = state.appointments.filter((appointment) => appointment.status === "Cancelada").length;
  const completedTreatments = state.treatments.filter((treatment) => treatment.progress >= 100).length;
  const receivable = state.patients.reduce((sum, patient) => sum + patient.balance, 0);

  document.getElementById("reportCards").innerHTML = [
    ["Ingresos", currency.format(income)],
    ["Cuentas por cobrar", currency.format(receivable)],
    ["Citas canceladas", cancelled],
    ["Tratamientos completados", completedTreatments]
  ].map(panelCardTemplate).join("");

  document.getElementById("doctorProductivity").innerHTML = doctors.map((doctor) => {
    const appointments = state.appointments.filter((appointment) => appointment.doctorId === doctor.id).length;
    const treatments = state.treatments.filter((treatment) => treatment.doctorId === doctor.id && treatment.progress < 100).length;
    return `
      <article class="clinical-item">
        <span class="status-pill confirmada">${appointments} citas</span>
        <div>
          <strong>${escapeHtml(doctor.name)}</strong>
          <p>${treatments} tratamientos activos · ${escapeHtml(doctor.specialty)}</p>
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("reportAlerts").innerHTML = [
    ["Stock bajo", `${state.inventory.filter((item) => item.stock <= item.min).length} materiales requieren compra.`],
    ["Balances", `${state.patients.filter((patient) => patient.balance > 0).length} pacientes con deuda.`],
    ["Seguimiento", `${state.treatments.filter((treatment) => treatment.progress > 0 && treatment.progress < 100).length} tratamientos en curso.`]
  ].map(([label, detail]) => `
    <article class="alert-item">
      <span class="status-pill pendiente">${label}</span>
      <div><strong>${detail}</strong><p>Revise el módulo correspondiente.</p></div>
    </article>
  `).join("");

  renderPosInvoiceReport();
}

function renderPosInvoiceReport() {
  const posInvoices = state.payments.filter(isPosInvoice);
  const total = posInvoices.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const discounts = posInvoices.reduce((sum, payment) => sum + Number(payment.discount || 0), 0);
  const emitted = posInvoices.filter((payment) => payment.invoiceStatus === "Emitida").length;

  document.getElementById("posInvoiceSummary").innerHTML = [
    ["Facturas POS/POST", posInvoices.length],
    ["Total cobrado", currency.format(total)],
    ["Descuentos", currency.format(discounts)],
    ["Emitidas", emitted]
  ].map(panelCardTemplate).join("");

  document.getElementById("posInvoiceTable").innerHTML = posInvoices.length
    ? posInvoices.map((payment) => `
      <tr>
        <td><strong>${escapeHtml(payment.invoiceNumber || "FAC-S/N")}</strong></td>
        <td>${escapeHtml(patientById(payment.patientId).name)}</td>
        <td>${escapeHtml(paymentDoctorLabel(payment))}</td>
        <td>${escapeHtml(payment.method || "Sin método")}</td>
        <td>${escapeHtml(payment.reference || "Sin referencia")}</td>
        <td><span class="status-pill ${payment.invoiceStatus === "Pagada" ? "confirmada" : "pendiente"}">${escapeHtml(payment.invoiceStatus || "Pagada")}</span></td>
        <td>${currency.format(payment.amount || 0)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7">${emptyState("No hay facturas POS/POST registradas.")}</td></tr>`;
}

function isPosInvoice(payment) {
  const method = normalizeText(payment.method || "");
  const reference = normalizeText(payment.reference || "");
  return method.includes("tarjeta") || reference.includes("pos") || reference.includes("post");
}

function renderAdmin() {
  state.settings ||= cloneSeed().settings;
  document.getElementById("clinicName").value = state.settings.clinicName || "NovaClinic";
  document.getElementById("clinicPhone").value = state.settings.clinicPhone || "";
  document.getElementById("clinicAddress").value = state.settings.clinicAddress || "";
  document.getElementById("clinicTaxId").value = state.settings.clinicTaxId || "";
  document.getElementById("clinicCurrency").value = state.settings.clinicCurrency || "DOP";
}

function nextReceiptNumber() {
  const next = String(state.payments.length + 1).padStart(3, "0");
  return `REC-${todayIso.replaceAll("-", "")}-${next}`;
}

function nextInvoiceNumber() {
  const next = String(state.payments.length + 1).padStart(4, "0");
  return `FAC-${todayIso.replaceAll("-", "")}-${next}`;
}

function syncPaymentProductFields() {
  const paymentType = value("paymentType");
  const isProduct = paymentType === "Producto";
  const productSelect = document.getElementById("paymentProduct");
  const quantityInput = document.getElementById("paymentQuantity");
  productSelect.disabled = !isProduct;
  quantityInput.disabled = !isProduct;
  if (paymentType === "Laboratorio") {
    document.getElementById("paymentBillTo").value = "doctor";
  }
  if (isProduct) {
    syncSelectedProductSale();
  }
}

function syncSelectedProductSale() {
  if (value("paymentType") !== "Producto") return;
  const product = state.inventory.find((item) => item.id === value("paymentProduct"));
  const quantity = Math.max(1, Number(value("paymentQuantity")) || 1);
  if (!product) return;
  document.getElementById("paymentConcept").value = `Producto: ${product.name}`;
  document.getElementById("paymentAmount").value = (Number(product.price) || 0) * quantity;
}

function currentCashOpening() {
  state.cashOpenings ||= [];
  return state.cashOpenings.find((opening) => opening.date === todayIso && opening.status === "Abierta");
}

function paymentBillToLabel(payment) {
  if (payment.billTo === "doctor") {
    return `Doctor: ${doctorById(payment.billedToDoctorId || payment.attendedDoctorId || payment.doctorId).name}`;
  }
  return `Paciente: ${patientById(payment.billedToPatientId || payment.patientId).name}`;
}

function paymentDoctorLabel(payment) {
  return doctorById(payment.attendedDoctorId || payment.doctorId).name;
}

function paymentCashierLabel(payment) {
  return userById(payment.cashierId || payment.createdBy).name;
}

function paymentMethodTotals(date = null) {
  return state.payments
    .filter((payment) => !date || payment.date === date)
    .reduce((summary, payment) => {
      summary[payment.method] = (summary[payment.method] || 0) + Number(payment.amount || 0);
      return summary;
    }, {});
}

function receivableAgeBucket(dateValue) {
  if (!dateValue) return "Sin fecha";
  const days = Math.max(0, Math.floor((new Date(`${todayIso}T12:00:00`) - new Date(`${dateValue}T12:00:00`)) / 86400000));
  if (days <= 30) return "0-30 días";
  if (days <= 60) return "31-60 días";
  if (days <= 90) return "61-90 días";
  return "Más de 90 días";
}

function topPaymentMethod(methodTotals) {
  const entries = Object.entries(methodTotals).sort((a, b) => b[1] - a[1]);
  return entries[0] ? `${entries[0][0]} · ${currency.format(entries[0][1])}` : "Sin cobros";
}

function openReceipt(paymentId) {
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment) return;
  const patient = patientById(payment.patientId);
  document.getElementById("receiptContent").innerHTML = `
    <div class="receipt-box">
      <div class="receipt-row"><span>Factura</span><strong>${escapeHtml(payment.invoiceNumber || "FAC-S/N")}</strong></div>
      <div class="receipt-row"><span>Recibo</span><strong>${escapeHtml(payment.receiptNumber || "REC-S/N")}</strong></div>
      <div class="receipt-row"><span>Fecha</span><strong>${formatDate(payment.date)}</strong></div>
      <div class="receipt-row"><span>Paciente</span><strong>${escapeHtml(patient.name)}</strong></div>
      <div class="receipt-row"><span>Facturado a</span><strong>${escapeHtml(paymentBillToLabel(payment))}</strong></div>
      <div class="receipt-row"><span>Doctor que atendió</span><strong>${escapeHtml(paymentDoctorLabel(payment))}</strong></div>
      <div class="receipt-row"><span>Cajero</span><strong>${escapeHtml(paymentCashierLabel(payment))}</strong></div>
      <div class="receipt-row"><span>Tipo</span><strong>${escapeHtml(payment.type || "Servicio")}</strong></div>
      <div class="receipt-row"><span>Concepto</span><strong>${escapeHtml(payment.concept)}</strong></div>
      ${payment.type === "Producto" ? `<div class="receipt-row"><span>Producto</span><strong>${escapeHtml(payment.productName || payment.concept)} · Cant. ${payment.quantity || 1}</strong></div>` : ""}
      <div class="receipt-row"><span>Estado factura</span><strong>${escapeHtml(payment.invoiceStatus || "Pagada")}</strong></div>
      <div class="receipt-row"><span>Método</span><strong>${escapeHtml(payment.method)}</strong></div>
      <div class="receipt-row"><span>Referencia</span><strong>${escapeHtml(payment.reference || "No aplica")}</strong></div>
      <div class="receipt-row"><span>Descuento</span><strong>${currency.format(payment.discount || 0)}</strong></div>
      <div class="receipt-row"><span>Motivo descuento</span><strong>${escapeHtml(payment.discountReason || "No aplica")}</strong></div>
      <div class="receipt-total"><span>Total pagado</span><strong>${currency.format(payment.amount)}</strong></div>
      <div class="receipt-row"><span>Balance pendiente</span><strong>${currency.format(patient.balance)}</strong></div>
      <div class="receipt-row"><span>Registrado por</span><strong>${escapeHtml(paymentCashierLabel(payment))}</strong></div>
    </div>
  `;
  document.getElementById("receiptDialog").showModal();
}

function closeReceipt() {
  document.getElementById("receiptDialog").close();
}

function appointmentTemplate(appointment) {
  return `
    <article class="appointment-item">
      <span class="time-chip">${appointment.time}</span>
      <div>
        <strong>${escapeHtml(patientById(appointment.patientId).name)}</strong>
        <p>${escapeHtml(appointment.type)} · ${escapeHtml(doctorById(appointment.doctorId).name)} · ${escapeHtml(appointment.reminder || "Sin recordatorio")}</p>
      </div>
      <span class="status-pill ${className(appointment.status)}">${escapeHtml(appointment.status)}</span>
    </article>
  `;
}

function patientById(id) {
  return state.patients.find((patient) => patient.id === id) || state.patients[0];
}

function readPatientPhoto() {
  const file = document.getElementById("patientPhoto").files[0];
  if (!file) return Promise.resolve("");

  return readFileAsDataUrl(file);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => resolve(""));
    reader.readAsDataURL(file);
  });
}

function patientPhotoTemplate(patient) {
  if (patient.photo) {
    return `<img class="patient-photo" src="${patient.photo}" alt="Foto de ${escapeHtml(patient.name)}">`;
  }

  return `<span class="patient-photo patient-photo-empty">${initials(patient.name)}</span>`;
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function makeUserId(name) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24) || "usuario";
  let candidate = base;
  let index = 2;
  while (users.some((user) => user.id === candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

function patientAge(birthdate) {
  if (!birthdate) return "Edad no registrada";
  const birth = new Date(`${birthdate}T12:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return `${age} años`;
}

function patientAgeNumber(birthdate) {
  if (!birthdate) return null;
  const birth = new Date(`${birthdate}T12:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function doctorById(id) {
  return doctors.find((doctor) => doctor.id === id) || { name: "Sin doctor", specialty: "No asignado" };
}

function userById(id) {
  return users.find((user) => user.id === id) || doctorById(id) || { name: "Sin usuario", role: "No asignado" };
}

function appointmentsForCurrentDoctor() {
  return state.appointments.filter((appointment) => appointmentBelongsToCurrentDoctor(appointment));
}

function treatmentsForCurrentDoctor() {
  return state.treatments.filter((treatment) => treatmentBelongsToCurrentDoctor(treatment));
}

function appointmentBelongsToCurrentDoctor(appointment) {
  return permissions().scope === "all" || !appointment.doctorId || appointment.doctorId === currentUser?.id;
}

function treatmentBelongsToCurrentDoctor(treatment) {
  return permissions().scope === "all" || !treatment.doctorId || treatment.doctorId === currentUser?.id;
}

function value(id) {
  return document.getElementById(id).value;
}

function formatDate(dateText) {
  if (!dateText) return "Sin fecha";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${dateText}T12:00:00`));
}

function formatDateTime(dateTimeText) {
  if (!dateTimeText) return "Sin fecha y hora";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateTimeText));
}

function localDateTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function sortByDateTime(a, b) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}

function labelStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function className(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function emptyState(message) {
  return `<article class="alert-item"><div><strong>${message}</strong><p>Agrega información para verla aquí.</p></div></article>`;
}

function escapeHtml(valueText) {
  return String(valueText)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
