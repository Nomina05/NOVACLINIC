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
    actions: ["patients:create", "appointments:create", "appointments:confirm", "odontogram:edit", "clinical-documents:create", "treatments:create", "treatments:progress", "payments:create", "cash:reopen", "payroll:manage", "users:create", "inventory:manage", "settings:manage", "selfservice:clinical", "selfservice:employee", "selfservice:manage", "laboratory:manage"],
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
  patientAttachments: [],
  patientConsents: [],
  selfServiceRequests: [],
  inventory: [],
  settings: {},
  payroll: [],
  payrollNovelties: [],
  payrollRuns: [],
  auditLog: [],
  securityLocks: {},
  hrAttendance: [],
  hrVacations: [],
  hrShifts: [],
  hrEvaluations: [],
  cashOpenings: [],
  cashClosings: [],
  odontogramHistory: [],
  initialOdontograms: {},
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
seedState.inventoryMovements = [];
seedState.inventoryPurchases = [];
seedState.suppliers = [
  { id: makeId(), name: "Dental Supply RD", phone: "", contact: "" },
  { id: makeId(), name: "Medident", phone: "", contact: "" },
  { id: makeId(), name: "Nova Insumos", phone: "", contact: "" }
];

seedState.settings = {
  clinicName: "NovaClinic",
  clinicPhone: "809-555-0100",
  clinicAddress: "Santo Domingo, República Dominicana",
  clinicTaxId: "RNC-000000",
  clinicCurrency: "DOP",
  ncfSequences: {
    final: { prefix: "B02", next: 1 },
    fiscal: { prefix: "B01", next: 1 },
    gov: { prefix: "B15", next: 1 },
    special: { prefix: "B14", next: 1 }
  }
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
let activeHrTab = "payroll";
let editingPatientId = null;
let editingAppointmentId = null;
let patientCameraStream = null;
let capturedPatientPhoto = "";
let selectedSelfServicePatientId = null;
let sessionExpiryTimer = null;
let compactMode = localStorage.getItem("novaclinic-compact-mode") === "true";
let currentPanelView = "dashboard";

const securityConfig = {
  maxLoginAttempts: 3,
  lockoutMinutes: 5,
  sessionMinutes: 30,
  minPinLength: 4
};

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

const actionPermissionCatalog = [
  { action: "patients:view", label: "Ver pacientes", group: "Pacientes" },
  { action: "patients:create", label: "Crear y editar pacientes", group: "Pacientes" },
  { action: "patients:edit", label: "Editar pacientes", group: "Pacientes" },
  { action: "appointments:view", label: "Ver agenda", group: "Agenda" },
  { action: "appointments:create", label: "Crear citas", group: "Agenda" },
  { action: "appointments:edit", label: "Editar citas", group: "Agenda" },
  { action: "appointments:confirm", label: "Confirmar citas y llegada", group: "Agenda" },
  { action: "billing:view", label: "Ver facturación", group: "Facturacion" },
  { action: "odontogram:edit", label: "Actualizar odontograma", group: "Doctores" },
  { action: "clinical-documents:create", label: "Crear documentos clinicos", group: "Doctores" },
  { action: "treatments:create", label: "Crear tratamientos", group: "Doctores" },
  { action: "treatments:progress", label: "Actualizar evolucion de tratamientos", group: "Doctores" },
  { action: "payments:create", label: "Crear facturas y recibos", group: "Facturacion" },
  { action: "payments:edit", label: "Editar/abonar facturas", group: "Facturacion" },
  { action: "payments:void", label: "Anular facturas y notas", group: "Facturacion" },
  { action: "payments:print", label: "Imprimir facturas y recibos", group: "Facturacion" },
  { action: "cash:reopen", label: "Reabrir caja cerrada", group: "Caja" },
  { action: "inventory:view", label: "Ver almacen", group: "Almacen" },
  { action: "inventory:manage", label: "Gestionar almacen", group: "Almacen" },
  { action: "payroll:view", label: "Ver RRHH y nomina", group: "Recursos Humanos" },
  { action: "payroll:manage", label: "Procesar nomina y RRHH", group: "Recursos Humanos" },
  { action: "laboratory:view", label: "Ver laboratorio", group: "Laboratorio" },
  { action: "laboratory:manage", label: "Gestionar laboratorio", group: "Laboratorio" },
  { action: "selfservice:clinical", label: "Autoservicio clinico", group: "Autoservicio" },
  { action: "selfservice:employee", label: "Autoservicio empleado", group: "Autoservicio" },
  { action: "selfservice:manage", label: "Gestionar solicitudes internas", group: "Autoservicio" },
  { action: "users:create", label: "Crear y editar usuarios", group: "Administracion" },
  { action: "users:edit", label: "Editar usuarios y permisos", group: "Administracion" },
  { action: "security:audit", label: "Ver bitacora de seguridad", group: "Administracion" },
  { action: "settings:manage", label: "Configurar clinica y comprobantes", group: "Administracion" }
];

const legacyActionAliases = {
  "patients:create": ["patients:view", "patients:edit"],
  "appointments:create": ["appointments:view", "appointments:edit"],
  "payments:create": ["billing:view", "payments:edit", "payments:print"],
  "inventory:manage": ["inventory:view"],
  "payroll:manage": ["payroll:view"],
  "laboratory:manage": ["laboratory:view"],
  "users:create": ["users:edit", "security:audit"],
  "settings:manage": ["security:audit"]
};

const panelModules = {
  dashboard: ["selfService", "patients", "agenda", "odontogram", "treatments", "inventory"],
  receptionPanel: ["patients", "selfService", "agenda", "billing", "inventory", "reports"],
  usersPanel: [],
  hrPanel: ["selfService"],
  laboratoryPanel: ["selfService"],
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
    return normalizeState(repairStoredEncoding(JSON.parse(saved)));
  } catch {
    return cloneSeed();
  }
}

function normalizeState(loadedState) {
  const next = { ...cloneSeed(), ...loadedState };
  next.settings = normalizeSettings(next.settings);
  next.inventory = (next.inventory || []).map((item) => ({ price: 0, ...item }));
  next.inventoryMovements ||= [];
  next.inventoryPurchases ||= [];
  next.suppliers ||= [];
  next.payments = (next.payments || []).map((payment) => ({
    type: "Servicio",
    billTo: "patient",
    cashierId: payment.createdBy || "",
    attendedDoctorId: payment.doctorId || "",
    invoiceType: "Consumidor Final",
    invoiceStatus: "Pagada",
    amountReceived: Number(payment.amount || 0),
    ncf: "",
    reprintCount: 0,
    reprints: [],
    paymentHistory: [],
    creditNotes: [],
    convertedFromQuoteId: "",
    ...payment
  }));
  next.cashOpenings ||= [];
  next.cashClosings = (next.cashClosings || []).map((closing) => ({
    status: "Cerrada",
    totals: {},
    countedAmount: closing.expectedCash ?? closing.expectedTotal ?? closing.total ?? 0,
    difference: 0,
    ...closing
  }));
  next.hrAttendance ||= [];
  next.hrVacations = (next.hrVacations || []).map((item) => ({
    type: "Vacaciones",
    approvedBy: "",
    approvedAt: "",
    ...item
  }));
  next.hrEvaluations = (next.hrEvaluations || []).map((item) => ({
    credentialExpiresAt: "",
    ...item
  }));
  next.hrShifts = Array.isArray(next.hrShifts) && next.hrShifts.length ? next.hrShifts : cloneSeed().hrShifts;
  next.hrEvaluations ||= [];
  next.payrollRuns ||= [];
  next.auditLog ||= [];
  next.securityLocks ||= {};
  next.payrollNovelties = (next.payrollNovelties || []).map((item) => ({
    period: currentPayrollPeriod(),
    ...item
  }));
  next.patientPlates ||= [];
  next.patientAttachments ||= [];
  next.patientConsents ||= [];
  next.initialOdontograms ||= {};
  next.selfServiceRequests ||= [];
  next.selfServiceRequests = next.selfServiceRequests.map((request) => ({
    attachments: [],
    promisedAt: "",
    deliveredAt: "",
    labNote: "",
    labInstructions: "",
    labProvider: "",
    labCost: 0,
    ...request
  })).map((request) => request.type === "Laboratorio - pieza dental"
    ? { ...request, status: normalizeLaboratoryStatus(request.status) }
    : request);
  return next;
}

function repairStoredEncoding(value) {
  const mojibake = (text, passes = 1) => {
    let output = text;
    for (let index = 0; index < passes; index += 1) {
      output = new TextDecoder("windows-1252").decode(new TextEncoder().encode(output));
    }
    return output;
  };
  const repairedCharacters = ["á", "é", "í", "ó", "ú", "ñ", "ü", "Á", "É", "Í", "Ó", "Ú", "·", "¿", "×"];
  const replacements = repairedCharacters.flatMap((character) => [
    [mojibake(character, 2), character],
    [mojibake(character), character]
  ]);

  if (typeof value === "string") {
    let repaired = value;
    let changed = true;
    while (changed) {
      changed = false;
      replacements.forEach(([from, to]) => {
        if (repaired.includes(from)) {
          repaired = repaired.split(from).join(to);
          changed = true;
        }
      });
    }
    return repaired;
  }

  if (Array.isArray(value)) return value.map(repairStoredEncoding);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [repairStoredEncoding(key), repairStoredEncoding(item)])
    );
  }
  return value;
}

function normalizeSettings(settings = {}) {
  const defaults = cloneSeed().settings;
  const ncfSequences = { ...defaults.ncfSequences, ...(settings.ncfSequences || {}) };
  Object.entries(defaults.ncfSequences).forEach(([key, sequence]) => {
    ncfSequences[key] = {
      prefix: ncfSequences[key]?.prefix || sequence.prefix,
      next: Math.max(1, Number(ncfSequences[key]?.next) || sequence.next)
    };
  });
  return { ...defaults, ...settings, ncfSequences };
}

function saveState() {
  localStorage.setItem("novaclinic-state", JSON.stringify(state));
}

function loadUsers() {
  const saved = localStorage.getItem("novaclinic-users");
  if (!saved) return [...defaultUsers];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? repairStoredEncoding(parsed) : [...defaultUsers];
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
        actions: [...actionList],
        scope: ["all", "own"].includes(override.scope) ? override.scope : undefined
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
    applyPatientContext(viewName, button.dataset.patientContext);
    if (canView(viewName)) {
      setView(viewName);
    }
    hideGlobalSearchResults();
  });

  document.addEventListener("click", (event) => {
    const recordButton = event.target.closest("[data-open-patient-record]");
    if (recordButton) {
      openPatientRecord(recordButton.dataset.openPatientRecord);
      return;
    }

    const attendButton = event.target.closest("[data-doctor-attend]");
    if (attendButton) {
      const appointment = state.appointments.find((item) => item.id === attendButton.dataset.doctorAttend);
      if (!appointment) return;
      if (can("appointments:confirm") && ["Pendiente", "Confirmada"].includes(appointment.status)) {
        appointment.status = "Llegó";
        appointment.updatedAt = new Date().toISOString();
        appointment.updatedBy = currentUser?.id || "sin-usuario";
        logAudit("appointments:status", `Marcó llegada de ${patientById(appointment.patientId).name}`, appointment.patientId);
        saveState();
      }
      openPatientRecord(appointment.patientId);
      render();
      return;
    }

    const appointmentStatusButton = event.target.closest("[data-quick-appointment-status]");
    if (appointmentStatusButton && can("appointments:confirm")) {
      const appointment = state.appointments.find((item) => item.id === appointmentStatusButton.dataset.quickAppointmentStatus);
      if (!appointment) return;
      appointment.status = appointmentStatusButton.dataset.statusValue || appointment.status;
      appointment.updatedAt = new Date().toISOString();
      appointment.updatedBy = currentUser?.id || "sin-usuario";
      logAudit("appointments:status", `Cambió cita de ${patientById(appointment.patientId).name} a ${appointment.status}`, appointment.patientId);
      persistAndRender();
    }
  });

  const globalSearch = document.getElementById("globalSearch");
  globalSearch.addEventListener("input", () => {
    renderPatients();
    renderGlobalSearch();
  });
  globalSearch.addEventListener("focus", renderGlobalSearch);
  globalSearch.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    globalSearch.value = "";
    hideGlobalSearchResults();
    renderPatients();
  });
  document.getElementById("compactModeToggle").addEventListener("click", toggleCompactMode);
  document.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
    button.addEventListener("click", () => activateDashboardTab(button.dataset.dashboardTab));
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".search-box") || event.target.closest("#globalSearchResults")) return;
    hideGlobalSearchResults();
  });
  document.getElementById("userSearch").addEventListener("input", renderUsersPanel);
  document.getElementById("userRoleFilter").addEventListener("change", renderUsersPanel);
  document.getElementById("patientLocalSearch")?.addEventListener("input", renderPatients);
  document.getElementById("patientStatusFilter")?.addEventListener("change", renderPatients);
  document.addEventListener("input", (event) => {
    if (event.target.matches("#doctorClinicalSearch")) {
      const cursorPosition = event.target.selectionStart;
      renderDashboard();
      const search = document.getElementById("doctorClinicalSearch");
      search?.focus();
      search?.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches("#doctorQueueFilter")) renderDashboard();
  });
  document.getElementById("billingSearch")?.addEventListener("input", renderBilling);
  document.getElementById("billingStatusFilter")?.addEventListener("change", renderBilling);
  document.getElementById("agendaDateFilter").addEventListener("change", renderAgenda);
  document.getElementById("agendaDoctorFilter").addEventListener("change", renderAgenda);
  document.getElementById("agendaViewFilter").addEventListener("change", renderAgenda);
  document.getElementById("agendaStatusFilter").addEventListener("change", renderAgenda);
  document.getElementById("todayAgendaButton").addEventListener("click", () => {
    document.getElementById("agendaDateFilter").value = todayIso;
    renderAgenda();
  });
}

function bindAuth() {
  populateUserLogin();
  ["click", "keydown", "change"].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      if (currentUser && !isSessionExpired()) extendSession();
    });
  });

  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const user = users.find((item) => item.id === value("userLogin"));
    const pin = value("userPin");
    const lockMessage = user ? loginLockMessage(user.id) : "";

    if (lockMessage) {
      document.getElementById("loginError").textContent = lockMessage;
      logAudit("login:blocked", `Intento bloqueado para ${user.name}`, user.id);
      return;
    }

    if (!user || user.pin !== pin) {
      registerFailedLogin(user?.id || "sin-usuario");
      document.getElementById("loginError").textContent = loginLockMessage(user?.id) || "PIN incorrecto para el usuario seleccionado.";
      logAudit("login:failed", `PIN incorrecto para ${user?.name || "usuario no identificado"}`, user?.id || "sin-usuario");
      return;
    }

    clearLoginFailures(user.id);
    localStorage.setItem("novaclinic-current-user", user.id);
    localStorage.setItem("novaclinic-session-expires", sessionExpiryValue());
    localStorage.removeItem("novaclinic-current-doctor");
    document.getElementById("userPin").value = "";
    document.getElementById("loginError").textContent = "";
    logAudit("login:success", `Inicio de sesión de ${user.name}`, user.id);
    applyUserSession(user);
  });

  document.getElementById("logoutButton").addEventListener("click", () => {
    lockSession("logout", "Cierre de sesión manual");
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
  if (user && isSessionExpired()) {
    lockSession("session:expired", "Sesión expirada por seguridad");
    return;
  }
  if (user) {
    applyUserSession(user);
    return;
  }

  document.getElementById("appShell").classList.add("is-locked");
  document.getElementById("loginScreen").classList.remove("is-hidden");
}

function applyUserSession(user) {
  currentUser = user;
  extendSession();
  document.getElementById("appShell").classList.remove("is-locked");
  document.getElementById("loginScreen").classList.add("is-hidden");
  document.getElementById("currentShift").textContent = user.name;
  document.getElementById("currentShiftMeta").textContent = `${user.role} · ${user.room} · ${user.shift}`;
  document.getElementById("doctorBadge").textContent = `${user.name} · ${user.role}`;
  applyCompactMode();
  applyPermissions();
  render();
}

function lockSession(reason = "logout", detail = "Sesión cerrada") {
  if (currentUser) logAudit(reason, detail, currentUser.id);
  clearTimeout(sessionExpiryTimer);
  localStorage.removeItem("novaclinic-current-user");
  localStorage.removeItem("novaclinic-current-doctor");
  localStorage.removeItem("novaclinic-session-expires");
  currentUser = null;
  document.getElementById("appShell").classList.add("is-locked");
  document.getElementById("loginScreen").classList.remove("is-hidden");
  document.getElementById("currentShift").textContent = "Sin sesion";
  document.getElementById("currentShiftMeta").textContent = "Selecciona un usuario para entrar";
  document.getElementById("doctorBadge").textContent = "Sin sesion";
}

function sessionExpiryValue() {
  return String(Date.now() + securityConfig.sessionMinutes * 60000);
}

function isSessionExpired() {
  const expiresAt = Number(localStorage.getItem("novaclinic-session-expires") || 0);
  return !expiresAt || Date.now() > expiresAt;
}

function extendSession() {
  clearTimeout(sessionExpiryTimer);
  localStorage.setItem("novaclinic-session-expires", sessionExpiryValue());
  sessionExpiryTimer = setTimeout(() => lockSession("session:expired", "Sesión expirada por inactividad"), securityConfig.sessionMinutes * 60000);
}

function loginLockMessage(userId) {
  if (!userId) return "";
  const lock = state.securityLocks?.[userId];
  if (!lock?.lockedUntil) return "";
  const lockedUntil = Number(lock.lockedUntil);
  if (Date.now() >= lockedUntil) {
    clearLoginFailures(userId);
    return "";
  }
  const minutes = Math.ceil((lockedUntil - Date.now()) / 60000);
  return `Usuario bloqueado por seguridad. Intente de nuevo en ${minutes} min.`;
}

function registerFailedLogin(userId) {
  if (!userId) return;
  state.securityLocks ||= {};
  const lock = state.securityLocks[userId] || { attempts: 0 };
  lock.attempts = Number(lock.attempts || 0) + 1;
  lock.lastFailedAt = new Date().toISOString();
  if (lock.attempts >= securityConfig.maxLoginAttempts) {
    lock.lockedUntil = Date.now() + securityConfig.lockoutMinutes * 60000;
    logAudit("login:locked", `Usuario bloqueado por ${lock.attempts} intentos fallidos`, userId);
  }
  state.securityLocks[userId] = lock;
  saveState();
}

function clearLoginFailures(userId) {
  if (!userId || !state.securityLocks) return;
  delete state.securityLocks[userId];
  saveState();
}

function isValidPin(pin) {
  return new RegExp(`^\\d{${securityConfig.minPinLength},}$`).test(String(pin || ""));
}

function logAudit(action, detail, targetUserId = "") {
  if (!state?.auditLog) return;
  state.auditLog.unshift({
    id: makeId(),
    action,
    detail,
    targetUserId,
    by: currentUser?.id || targetUserId || "sistema",
    at: new Date().toISOString()
  });
  state.auditLog = state.auditLog.slice(0, 120);
  saveState();
}

function safeUsersForExport() {
  return users.map((user) => ({ ...user, pin: "****" }));
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
  const pin = value("newUserPin");
  if (!isValidPin(pin)) {
    alert(`El PIN debe tener al menos ${securityConfig.minPinLength} numeros.`);
    return null;
  }
  user.pin = pin;

  if (!existing) {
    users.push(user);
    const defaults = rolePermissions[user.role] || rolePermissions["Recepción"];
    userPermissionOverrides[user.id] = {
      views: [...defaults.views],
      actions: [...defaults.actions],
      scope: defaults.scope
    };
    saveUserPermissionOverrides();
  } else if (previousRole !== user.role) {
    const defaults = rolePermissions[user.role] || rolePermissions["Recepción"];
    userPermissionOverrides[user.id] = {
      views: [...defaults.views],
      actions: [...defaults.actions],
      scope: defaults.scope
    };
    saveUserPermissionOverrides();
  }

  saveUsers();
  upsertPayrollForUser(user);
  logAudit(existing ? "users:update" : "users:create", `${existing ? "Actualizó" : "Creó"} usuario ${user.name}`, user.id);
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
  logAudit(existing ? "patients:edit" : "patients:create", `${existing ? "Editó" : "Creó"} paciente ${patient.name}`, patient.id);
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

function patientSearchHaystack(patient) {
  return normalizeText([
    patient.name,
    patient.code,
    patient.phone,
    patient.email,
    patient.documentType,
    patient.nationality,
    patient.document,
    patientDocumentLabel(patient),
    patient.emergencyName,
    patient.emergencyPhone,
    patient.emergencyRelation,
    patient.insurance,
    patient.bloodType,
    patient.allergies,
    patient.conditions,
    patient.medications,
    patient.clinicalHistory,
    patient.notes
  ].join(" "));
}

function hasMedicalAlert(patient) {
  const values = [patient?.allergies, patient?.conditions, patient?.medications].map((item) => normalizeText(item));
  return values.some((item) => item && !["ninguna", "ninguno", "sin registro", "sin condiciones registradas", "sin condiciones sistemicas reportadas"].includes(item));
}

function patientMedicalAlertText(patient) {
  const parts = [];
  if (normalizeText(patient?.allergies) && normalizeText(patient?.allergies) !== "ninguna") parts.push(`Alergias: ${patient.allergies}`);
  if (normalizeText(patient?.conditions) && !["sin registro", "sin condiciones registradas", "sin condiciones sistemicas reportadas"].includes(normalizeText(patient.conditions))) parts.push(`Condiciones: ${patient.conditions}`);
  if (normalizeText(patient?.medications) && !["ninguno", "sin registro"].includes(normalizeText(patient.medications))) parts.push(`Medicamentos: ${patient.medications}`);
  return parts.join(" | ") || "Sin alertas";
}

function clinicalAlertBadges(patient) {
  const text = normalizeText([patient?.allergies, patient?.conditions, patient?.medications, patient?.clinicalHistory].join(" "));
  const alerts = [];
  if (normalizeText(patient?.allergies) && normalizeText(patient?.allergies) !== "ninguna") alerts.push(`Alergia: ${patient.allergies}`);
  if (text.includes("hipertension")) alerts.push("Hipertensión");
  if (text.includes("diabetes")) alerts.push("Diabetes");
  if (text.includes("embarazo") || text.includes("embarazada")) alerts.push("Embarazo");
  if (text.includes("anticoagulante") || text.includes("warfarina") || text.includes("aspirina")) alerts.push("Anticoagulantes");
  return [...new Set(alerts)];
}

function clinicalAlertPanelTemplate(patient) {
  const alerts = clinicalAlertBadges(patient);
  if (!alerts.length) return "";
  return `
    <article class="clinical-alert-panel">
      <strong>Alertas clínicas activas</strong>
      <div>${alerts.map((alert) => `<span>${escapeHtml(alert)}</span>`).join("")}</div>
    </article>
  `;
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
  document.getElementById("appointmentWaitlist").checked = appointment.status === "Lista de espera";
  document.getElementById("saveAppointmentButton").textContent = "Guardar cita";
}

function saveAppointmentFromForm() {
  const appointment = state.appointments.find((item) => item.id === editingAppointmentId) || {
    id: makeId(),
    createdBy: currentUser?.id || "sin-usuario",
    status: document.getElementById("appointmentWaitlist").checked ? "Lista de espera" : "Pendiente"
  };
  appointment.patientId = value("appointmentPatient");
  appointment.doctorId = value("appointmentDoctor");
  appointment.date = value("appointmentDate");
  appointment.time = value("appointmentTime");
  appointment.duration = Number(value("appointmentDuration")) || 30;
  appointment.type = value("appointmentType");
  appointment.reminder = value("appointmentReminder");
  if (document.getElementById("appointmentWaitlist").checked) {
    appointment.status = "Lista de espera";
  } else if (appointment.status === "Lista de espera") {
    appointment.status = "Pendiente";
  }
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
    !["Cancelada"].includes(appointment.status)
  );
  const sameTimeDoctorAppointments = state.appointments.filter((appointment) =>
    appointment.id !== currentId &&
    appointment.doctorId === doctorId &&
    appointment.date === date &&
    appointment.time === time &&
    !["Cancelada", "Lista de espera"].includes(appointment.status)
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

function doctorVacationForDate(doctorId, date) {
  return (state.hrVacations || []).find((vacation) =>
    vacation.userId === doctorId &&
    ["Aprobada", "Completada"].includes(vacation.status) &&
    vacation.start &&
    date >= vacation.start &&
    date <= (vacation.end || vacation.start)
  );
}

function shiftMatchesDate(shift, date) {
  if (!shift?.day) return true;
  const dayName = new Intl.DateTimeFormat("es-DO", { weekday: "long" })
    .format(new Date(`${date}T12:00:00`))
    .toLowerCase();
  const normalizedDay = normalizeText(dayName);
  const rule = normalizeText(shift.day);
  if (rule.includes("lunes a viernes")) return !["sabado", "domingo"].includes(normalizedDay);
  if (rule.includes("fin de semana")) return ["sabado", "domingo"].includes(normalizedDay);
  return rule.includes(normalizedDay);
}

function doctorShiftsForDate(doctorId, date) {
  return (state.hrShifts || [])
    .filter((shift) => shift.userId === doctorId && shiftMatchesDate(shift, date))
    .sort((a, b) => `${a.start || "00:00"}`.localeCompare(`${b.start || "00:00"}`));
}

function minutesFromTime(time) {
  const [hours, minutes] = String(time || "00:00").split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function timeWithinShift(time, shifts) {
  if (!shifts.length) return true;
  const current = minutesFromTime(time);
  return shifts.some((shift) => current >= minutesFromTime(shift.start) && current < minutesFromTime(shift.end));
}

function doctorAvailabilityBlocks(doctorId, date, time = "") {
  const blocks = [];
  const absence = doctorAbsenceForDate(doctorId, date);
  const vacation = doctorVacationForDate(doctorId, date);
  const shifts = doctorShiftsForDate(doctorId, date);
  const hasAssignedShifts = (state.hrShifts || []).some((shift) => shift.userId === doctorId);
  if (absence) blocks.push(`Ausencia: ${absence.detail || "doctor no disponible"}`);
  if (vacation) blocks.push(`Vacaciones: ${vacation.type || "periodo aprobado"}`);
  if (hasAssignedShifts && !shifts.length) blocks.push("Sin turno asignado para este dia");
  if (time && shifts.length && !timeWithinShift(time, shifts)) {
    blocks.push(`Fuera de turno (${shifts.map((shift) => `${shift.start}-${shift.end}`).join(", ")})`);
  }
  return blocks;
}

function appointmentOverlapsSlot(appointment, slotMinutes) {
  const start = minutesFromTime(appointment.time);
  const end = start + (Number(appointment.duration) || 30);
  return slotMinutes >= start && slotMinutes < end;
}

function availableDoctorSlots(doctorId, date) {
  const blocks = doctorAvailabilityBlocks(doctorId, date);
  if (blocks.length) return [];
  const shifts = doctorShiftsForDate(doctorId, date);
  const windows = shifts.length ? shifts : [{ start: "08:00", end: "18:00" }];
  const busy = state.appointments.filter((appointment) =>
    appointment.doctorId === doctorId &&
    appointment.date === date &&
    appointment.status !== "Lista de espera" &&
    !appointmentIsCancelledSlot(appointment)
  );
  const slots = [];
  windows.forEach((shift) => {
    for (let current = minutesFromTime(shift.start); current < minutesFromTime(shift.end); current += 30) {
      if (!busy.some((appointment) => appointmentOverlapsSlot(appointment, current))) {
        slots.push(`${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`);
      }
    }
  });
  return slots.slice(0, 8);
}

function doctorsForAgendaFilter(doctorFilter) {
  return doctors.filter((doctor) =>
    appointmentBelongsToCurrentDoctor({ doctorId: doctor.id }) &&
    (doctorFilter === "all" || doctor.id === doctorFilter)
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
  document.getElementById("paymentMethod").addEventListener("change", syncPaymentReceivedRequirement);
  document.getElementById("paymentProduct").addEventListener("change", syncSelectedProductSale);
  document.getElementById("paymentQuantity").addEventListener("input", syncSelectedProductSale);
  syncPaymentReceivedRequirement();
  document.getElementById("patientBirthdate").addEventListener("change", syncPatientDocumentRequirement);
  document.getElementById("patientIsMinor").addEventListener("change", syncPatientDocumentRequirement);
  dialog.addEventListener("close", () => {
    editingPatientId = null;
    stopPatientCamera();
  });
  document.getElementById("openUserModal").addEventListener("click", () => {
    if (can("users:create")) openUserForm();
  });
  document.getElementById("editSelectedUser").addEventListener("click", () => {
    if (can("users:edit")) openUserForm(selectedUserId);
  });
  document.getElementById("applyPermissionProfile").addEventListener("click", () => {
    if (!can("users:edit")) return;
    applyPermissionProfile(selectedUserId, value("userPermissionProfile"));
  });
  document.getElementById("resetPermissionProfile").addEventListener("click", () => {
    if (!can("users:edit")) return;
    resetPermissionProfile(selectedUserId);
  });
  document.getElementById("cancelUser").addEventListener("click", () => closeUserForm());
  userDialog.addEventListener("close", () => {
    editingUserId = null;
  });

  document.getElementById("userForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!(editingUserId ? can("users:edit") : can("users:create"))) return;
    const savedUser = saveUserFromForm();
    if (!savedUser) return;
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
  document.getElementById("selfServiceRequestForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.selfServiceRequests ||= [];
    const type = value("selfRequestType");
    if (!canCreateSelfServiceRequest(type)) {
      alert("No tiene permiso para crear este tipo de solicitud.");
      return;
    }
    const attachmentFile = document.getElementById("selfRequestAttachment")?.files?.[0];
    const attachments = attachmentFile ? [{
      id: makeId(),
      fileName: attachmentFile.name,
      file: await readFileAsDataUrl(attachmentFile),
      type: attachmentFile.type || "archivo",
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "sin-usuario"
    }] : [];
    state.selfServiceRequests.unshift({
      id: makeId(),
      type,
      patientId: value("selfRequestPatient"),
      piece: value("selfRequestPiece"),
      amount: Number(value("selfRequestAmount")) || 0,
      labCost: 0,
      labInstructions: value("selfRequestDetail"),
      start: value("selfRequestStart"),
      end: value("selfRequestEnd") || value("selfRequestStart"),
      detail: value("selfRequestDetail"),
      attachments,
      status: type === "Ausencia doctor" ? "Activa" : type === "Laboratorio - pieza dental" ? "Solicitado" : "Pendiente",
      createdBy: currentUser?.id || "sin-usuario",
      createdAt: new Date().toISOString()
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("appointmentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("appointments:create")) return;
    const availabilityBlocks = doctorAvailabilityBlocks(value("appointmentDoctor"), value("appointmentDate"), value("appointmentTime"));
    if (availabilityBlocks.length) {
      alert(`No se puede agendar. ${doctorById(value("appointmentDoctor")).name} no tiene disponibilidad:\n\n${availabilityBlocks.join("\n")}`);
      return;
    }
    const conflicts = appointmentConflictsFromForm();
    if (conflicts.length && !confirm(`Aviso de agenda:\n\n${conflicts.join("\n")}\n\n¿Desea guardar la cita de todos modos?`)) {
      return;
    }
    const wasEditingAppointment = Boolean(editingAppointmentId);
    const savedAppointment = saveAppointmentFromForm();
    logAudit(wasEditingAppointment ? "appointments:edit" : "appointments:create", `Guardó cita de ${patientById(savedAppointment.patientId).name} con ${doctorById(savedAppointment.doctorId).name}`, savedAppointment.patientId);
    event.target.reset();
    document.getElementById("appointmentDate").value = todayIso;
    document.getElementById("appointmentWaitlist").checked = false;
    document.getElementById("agendaDateFilter").value = savedAppointment.date || todayIso;
    persistAndRender();
  });

  document.getElementById("treatmentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("treatments:create")) return;
    const patient = patientById(value("treatmentPatient"));
    const cost = Number(value("treatmentCost"));
    const procedure = procedureByName(value("treatmentName"));
    const consentSigned = document.getElementById("treatmentConsentSigned")?.checked || false;
    const supplyUsage = procedureSuppliesForTreatment(value("treatmentName"));
    const shortage = supplyUsage.find((usage) => usage.product.stock < usage.quantity);
    if (shortage) {
      alert(`Stock insuficiente para el procedimiento. ${shortage.product.name}: disponible ${shortage.product.stock}, requerido ${shortage.quantity}.`);
      return;
    }
    const treatment = {
      id: makeId(),
      patientId: patient.id,
      doctorId: value("treatmentDoctor"),
      createdBy: currentUser?.id || "sin-usuario",
      name: value("treatmentName"),
      cost,
      phase: value("treatmentPhase") || "Diagnóstico",
      progress: treatmentProgressForPhase(value("treatmentPhase") || "Diagnóstico"),
      status: treatmentStatusForPhase(value("treatmentPhase") || "Diagnóstico"),
      consentSigned,
      consentSignedAt: consentSigned ? new Date().toISOString() : "",
      consentSignedBy: consentSigned ? currentUser?.id || "sin-usuario" : "",
      procedurePoints: procedure?.points || 0,
      procedureValue: procedure?.value || 0
    };
    state.treatments.push(treatment);
    supplyUsage.forEach((usage) => {
      applyInventoryMovement({
        productId: usage.product.id,
        type: "Salida",
        quantity: usage.quantity,
        reason: `Insumo usado en procedimiento: ${treatment.name}`,
        reference: treatment.id
      });
    });
    if (consentSigned) createTreatmentConsentDocument(treatment);
    patient.balance += cost;
    logAudit("treatments:create", `Creó tratamiento ${treatment.name} para ${patient.name}`, patient.id);
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
    const invoiceTotal = Math.max(0, amount - discount);
    const invoiceType = value("paymentInvoiceType");
    const isQuote = invoiceType === "Cotización";
    const method = value("paymentMethod");
    const amountReceived = Number(value("paymentReceived")) || 0;
    if (!isQuote && !currentCashOpening()) {
      alert("Debe abrir la caja antes de registrar cobros.");
      return;
    }
    if (!isQuote && method === "Efectivo" && value("paymentInvoiceStatus") === "Pagada" && amountReceived < invoiceTotal) {
      alert("En pagos en efectivo el monto recibido es obligatorio y no puede ser menor al total facturado.");
      return;
    }
    const requestedStatus = isQuote ? "Cotización" : value("paymentInvoiceStatus");
    const initialPaid = isQuote || requestedStatus === "Pendiente"
      ? 0
      : Math.min(invoiceTotal, requestedStatus === "Pagada" ? (amountReceived || invoiceTotal) : amountReceived);
    const finalStatus = isQuote
      ? "Cotización"
      : initialPaid >= invoiceTotal
        ? "Pagada"
        : initialPaid > 0
          ? "Parcialmente pagada"
          : requestedStatus;
    const receiptNumber = nextReceiptNumber();
    const invoiceNumber = nextInvoiceNumber();
    const ncf = isQuote ? "" : nextNcf(invoiceType);
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
      amountReceived: amountReceived || initialPaid,
      discount,
      discountReason: value("paymentDiscountReason"),
      method,
      reference: value("paymentReference"),
      receiptNumber,
      invoiceNumber,
      ncf,
      invoiceType,
      documentKind: isQuote ? "Cotización" : "Factura",
      invoiceStatus: finalStatus,
      paymentHistory: initialPaid > 0 ? [{
        id: makeId(),
        date: todayIso,
        amount: initialPaid,
        method,
        reference: value("paymentReference"),
        cashierId,
        createdAt: new Date().toISOString(),
        note: "Pago inicial"
      }] : [],
      creditNotes: [],
      date: todayIso,
      createdAt: new Date().toISOString(),
      concept: value("paymentConcept"),
      type: paymentType,
      productId: product?.id || "",
      productName: product?.name || "",
      quantity: product ? quantity : 0
    });
    if (product && !isQuote) {
      applyInventoryMovement({
        productId: product.id,
        type: "Salida",
        quantity,
        reason: "Venta facturada",
        reference: invoiceNumber
      });
    }
    if (!isQuote) {
      patient.balance = Math.max(0, patient.balance - initialPaid);
    }
    logAudit(isQuote ? "billing:quote" : "billing:create", `${isQuote ? "Creó cotización" : "Creó factura"} ${invoiceNumber} para ${patient.name}`, patient.id);
    event.target.reset();
    document.getElementById("paymentCashier").value = currentUser?.id || "";
    syncPaymentProductFields();
    syncPaymentReceivedRequirement();
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
    const closedToday = (state.cashClosings || []).find((closing) => closing.date === todayIso && closing.status !== "Reabierta");
    if (closedToday) {
      alert("La caja de hoy ya fue cerrada. Use Reabrir caja cerrada con permiso especial.");
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
    logAudit("cash:open", `Apertura de caja con ${currency.format(Number(value("cashOpeningAmount")) || 0)}`);
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("cashCloseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payments:create")) return;
    state.cashClosings ||= [];
    const opening = currentCashOpening();
    if (!opening) {
      alert("Debe abrir la caja antes de cerrarla.");
      return;
    }
    const totals = paymentMethodTotals(todayIso);
    const total = Object.values(totals).reduce((sum, amountValue) => sum + amountValue, 0);
    const expectedTotal = total + (opening?.openingAmount || 0);
    const expectedCash = (opening?.openingAmount || 0) + (totals.Efectivo || 0);
    const countedAmount = Number(value("cashCountedAmount")) || 0;
    state.cashClosings.unshift({
      id: makeId(),
      date: todayIso,
      openingId: opening?.id || "",
      openingAmount: opening?.openingAmount || 0,
      totals,
      cashierMethodTotals: cashierMethodTotals(todayIso),
      total,
      expectedTotal,
      expectedCash,
      countedAmount,
      difference: countedAmount - expectedCash,
      note: value("cashCloseNote"),
      openedBy: opening?.openedBy || "",
      closedBy: currentUser?.id || "sin-usuario",
      closedAt: new Date().toISOString(),
      status: "Cerrada"
    });
    if (opening) {
      opening.status = "Cerrada";
      opening.closedAt = new Date().toISOString();
    }
    logAudit("cash:close", `Cierre de caja. Esperado ${currency.format(expectedCash)} contado ${currency.format(countedAmount)}`);
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("reopenCashRegister").addEventListener("click", () => {
    if (!can("cash:reopen")) return;
    if (currentCashOpening()) {
      alert("Ya existe una caja abierta.");
      return;
    }
    const closing = (state.cashClosings || []).find((item) => item.date === todayIso && item.status !== "Reabierta");
    if (!closing) {
      alert("No hay una caja cerrada hoy para reabrir.");
      return;
    }
    const opening = (state.cashOpenings || []).find((item) => item.id === closing.openingId);
    if (opening) {
      opening.status = "Abierta";
      opening.reopenedAt = new Date().toISOString();
      opening.reopenedBy = currentUser?.id || "sin-usuario";
    }
    closing.status = "Reabierta";
    closing.reopenedAt = new Date().toISOString();
    closing.reopenedBy = currentUser?.id || "sin-usuario";
    persistAndRender();
  });

  document.getElementById("closeReceipt").addEventListener("click", closeReceipt);
  document.getElementById("doneReceipt").addEventListener("click", closeReceipt);
  document.getElementById("printReceipt").addEventListener("click", () => {
    if (!can("payments:print")) return;
    logAudit("print:dialog", "Imprimió documento desde visor POS");
    window.print();
  });
  document.getElementById("markPayrollPaid").addEventListener("click", () => {
    if (!can("payroll:manage")) return;
    const period = selectedPayrollPeriod();
    state.payroll = normalizedPayroll().map((item) => ({ ...item, period, status: "Pagado", paidAt: new Date().toISOString(), paidBy: currentUser?.id || "sin-usuario" }));
    state.payrollRuns ||= [];
    const run = state.payrollRuns.find((item) => item.period === period);
    if (run) {
      run.status = "Pagada";
      run.paidAt = new Date().toISOString();
      run.paidBy = currentUser?.id || "sin-usuario";
    } else {
      state.payrollRuns.unshift({ ...payrollRunSummaryForPeriod(period), status: "Pagada", paidAt: new Date().toISOString(), paidBy: currentUser?.id || "sin-usuario" });
    }
    logAudit("payroll:paid", `Marcó nómina pagada para ${formatPayrollPeriod(period)}`);
    persistAndRender();
  });
  document.getElementById("processPayrollMonth").addEventListener("click", () => {
    if (!can("payroll:manage")) return;
    const period = selectedPayrollPeriod();
    state.payroll = normalizedPayroll().map((item) => ({ ...item, period, status: "Procesada", processedAt: new Date().toISOString(), processedBy: currentUser?.id || "sin-usuario" }));
    state.payrollRuns ||= [];
    const summary = payrollRunSummaryForPeriod(period);
    const existing = state.payrollRuns.find((item) => item.period === period);
    if (existing) {
      Object.assign(existing, { ...summary, id: existing.id }, { status: "Procesada", processedAt: new Date().toISOString(), processedBy: currentUser?.id || "sin-usuario" });
    } else {
      state.payrollRuns.unshift({ ...summary, status: "Procesada", processedAt: new Date().toISOString(), processedBy: currentUser?.id || "sin-usuario" });
    }
    logAudit("payroll:process", `Procesó nómina de ${formatPayrollPeriod(period)}`);
    persistAndRender();
  });
  document.getElementById("payrollPeriod").addEventListener("change", () => {
    document.getElementById("payrollNoveltyPeriod").value = selectedPayrollPeriod();
    renderHrPanel();
  });
  document.getElementById("employeeRecordUser").addEventListener("change", renderHrPanel);
  document.getElementById("attendanceMonthFilter").addEventListener("change", renderHrControls);
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
      period: value("payrollNoveltyPeriod") || selectedPayrollPeriod(),
      createdBy: currentUser?.id || "sin-usuario"
    });
    logAudit("payroll:novelty", `Aplicó novedad ${value("payrollNoveltyType")} a ${userById(value("payrollNoveltyUser")).name}`, value("payrollNoveltyUser"));
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
  document.getElementById("saveInitialOdontogram").addEventListener("click", saveInitialOdontogram);
  document.getElementById("printOdontogramSummary").addEventListener("click", printOdontogramSummary);

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
      note: value("evolutionNote"),
      signature: value("evolutionSignature") || currentUser?.name || userById(currentUser?.id).name
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
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "sin-usuario"
    });
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("inventoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("inventory:manage")) return;
    state.inventory ||= [];
    const item = {
      id: makeId(),
      name: value("inventoryName"),
      stock: Number(value("inventoryStock")) || 0,
      min: Number(value("inventoryMin")) || 0,
      price: Number(value("inventoryPrice")) || 0,
      expiry: value("inventoryExpiry"),
      provider: value("inventoryProvider") || "Sin proveedor"
    };
    state.inventory.push(item);
    ensureSupplier(item.provider);
    registerInventoryMovement({
      productId: item.id,
      type: "Entrada",
      quantity: item.stock,
      reason: "Inventario inicial",
      reference: "Alta de producto",
      provider: item.provider,
      expiry: item.expiry,
      previousStock: 0,
      newStock: item.stock
    });
    logAudit("inventory:create", `Creó producto ${item.name} con stock ${item.stock}`);
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("purchaseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("inventory:manage")) return;
    const product = state.inventory.find((item) => item.id === value("purchaseProduct"));
    if (!product) return;
    const quantity = Number(value("purchaseQuantity")) || 0;
    if (quantity <= 0) return;
    const supplier = value("purchaseSupplier") || product.provider || "Sin proveedor";
    product.provider = supplier;
    product.expiry = value("purchaseExpiry") || product.expiry;
    ensureSupplier(supplier);
    state.inventoryPurchases ||= [];
    const purchase = {
      id: makeId(),
      productId: product.id,
      supplier,
      quantity,
      unitCost: Number(value("purchaseCost")) || 0,
      expiry: value("purchaseExpiry") || product.expiry,
      date: todayIso,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "sin-usuario"
    };
    state.inventoryPurchases.unshift(purchase);
    applyInventoryMovement({
      productId: product.id,
      type: "Entrada",
      quantity,
      reason: "Compra a proveedor",
      reference: purchase.id,
      provider: supplier,
      unitCost: purchase.unitCost,
      expiry: purchase.expiry
    });
    logAudit("inventory:purchase", `Registró compra ${quantity} de ${product.name} a ${supplier}`);
    event.target.reset();
    persistAndRender();
  });

  document.getElementById("inventoryMovementForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("inventory:manage")) return;
    const productId = value("inventoryMovementProduct");
    const type = value("inventoryMovementType");
    const quantity = Number(value("inventoryMovementQuantity")) || 0;
    const reason = value("inventoryMovementNote");
    if (!applyInventoryMovement({ productId, type, quantity, reason, reference: "Ajuste manual" })) return;
    logAudit("inventory:movement", `${type} de ${quantity} en ${inventoryName(productId)}: ${reason}`);
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
    logAudit("hr:attendance", `Registró asistencia ${value("attendanceStatus")} de ${userById(value("attendanceUser")).name}`, value("attendanceUser"));
    event.target.reset();
    document.getElementById("attendanceDate").value = todayIso;
    persistAndRender();
  });

  document.getElementById("vacationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("payroll:manage")) return;
    state.hrVacations ||= [];
    const vacationStatus = value("vacationStatus");
    state.hrVacations.unshift({
      id: makeId(),
      userId: value("vacationUser"),
      type: value("vacationType"),
      start: value("vacationStart"),
      end: value("vacationEnd"),
      status: vacationStatus,
      note: value("vacationNote"),
      approvedBy: ["Aprobada", "Rechazada", "Completada"].includes(vacationStatus) ? currentUser?.id || "sin-usuario" : "",
      approvedAt: ["Aprobada", "Rechazada", "Completada"].includes(vacationStatus) ? new Date().toISOString() : "",
      createdBy: currentUser?.id || "sin-usuario"
    });
    logAudit("hr:vacation", `Registró solicitud ${vacationStatus} para ${userById(value("vacationUser")).name}`, value("vacationUser"));
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
      credentialExpiresAt: value("evaluationCredentialExpiry"),
      note: value("evaluationNote"),
      createdBy: currentUser?.id || "sin-usuario"
    });
    logAudit("hr:evaluation", `Registró evaluación de ${userById(value("evaluationUser")).name}`, value("evaluationUser"));
    event.target.reset();
    document.getElementById("evaluationDate").value = todayIso;
    persistAndRender();
  });

  document.addEventListener("click", (event) => {
    const approveVacation = event.target.closest("[data-approve-vacation]");
    if (approveVacation) {
      updateVacationStatus(approveVacation.dataset.approveVacation, "Aprobada");
      return;
    }
    const rejectVacation = event.target.closest("[data-reject-vacation]");
    if (rejectVacation) {
      updateVacationStatus(rejectVacation.dataset.rejectVacation, "Rechazada");
      return;
    }
    const payrollReceipt = event.target.closest("[data-payroll-receipt]");
    if (payrollReceipt) {
      printPayrollReceipt(payrollReceipt.dataset.payrollReceipt);
    }
  });

  document.querySelectorAll("[data-hr-tab]").forEach((button) => {
    button.addEventListener("click", () => activateHrTab(button.dataset.hrTab));
  });

  document.getElementById("printClinicalRecord").addEventListener("click", () => window.print());
  document.getElementById("printReports").addEventListener("click", printReports);
  document.getElementById("exportReports").addEventListener("click", exportReportsCsv);
  document.getElementById("reportFilterForm").addEventListener("change", renderReports);
  document.getElementById("reportFilterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    renderReports();
  });

  document.getElementById("clinicSettingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!can("settings:manage")) return;
    state.settings = {
      clinicName: value("clinicName"),
      clinicPhone: value("clinicPhone"),
      clinicAddress: value("clinicAddress"),
      clinicTaxId: value("clinicTaxId"),
      clinicCurrency: value("clinicCurrency"),
      ncfSequences: readNcfSettingsFromForm()
    };
    persistAndRender();
  });

  document.getElementById("exportData").addEventListener("click", () => {
    if (!can("settings:manage")) return;
    logAudit("data:export", "Exportación de respaldo JSON");
    const payload = JSON.stringify({ state, users: safeUsersForExport(), userPermissionOverrides }, null, 2);
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
    logAudit("data:reset", "Restauración de datos demo");
    populateUserLogin();
    persistAndRender();
  });
}

function setView(viewName) {
  if (!canView(viewName)) {
    setView(firstAllowedView());
    return;
  }

  currentPanelView = panelViewFor(viewName);
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === currentPanelView);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });
  document.getElementById("pageTitle").textContent = views[viewName];
  renderContextModuleBar(viewName);
}

function panelViewFor(viewName) {
  if (panelViews.includes(viewName)) return viewName;
  if (panelModules[currentPanelView]?.includes(viewName) && canView(currentPanelView)) return currentPanelView;
  const allowedPanel = panelViews.find((panelView) => canView(panelView) && (panelModules[panelView] || []).includes(viewName));
  return allowedPanel || firstAllowedView();
}

function renderContextModuleBar(activeView = document.querySelector(".view.active")?.id || firstAllowedView()) {
  const container = document.getElementById("contextModuleBar");
  if (!container) return;
  const panelView = panelViewFor(activeView);
  const modules = (panelModules[panelView] || []).filter((viewName) => canView(viewName));

  if (!modules.length) {
    container.classList.add("is-empty");
    container.innerHTML = "";
    return;
  }

  container.classList.remove("is-empty");
  container.innerHTML = `
    <span class="context-module-label">${escapeHtml(views[panelView] || "Panel")}</span>
    <div class="context-module-list">
      ${modules.map((viewName) => `
        <button class="context-module-button ${viewName === activeView ? "active" : ""}" data-view-jump="${viewName}" type="button">
          ${escapeHtml(views[viewName] || viewName)}
        </button>
      `).join("")}
    </div>
  `;
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
  toggleAction("cashCloseForm", "payments:create");
  toggleAction("reopenCashRegister", "cash:reopen");
  toggleAction("toothStatus", "odontogram:edit");
  toggleAction("toothSurface", "odontogram:edit");
  toggleAction("updateToothButton", "odontogram:edit");
  toggleAction("diagnosisForm", "odontogram:edit");
  toggleAction("evolutionForm", "odontogram:edit");
  toggleAction("clinicalDocumentForm", "clinical-documents:create");
  toggleAction("inventoryForm", "inventory:manage");
  toggleAction("clinicSettingsForm", "settings:manage");
  toggleAction("exportData", "settings:manage");
  toggleAction("resetDemoData", "settings:manage");
  toggleAction("markPayrollPaid", "payroll:manage");
  toggleAction("processPayrollMonth", "payroll:manage");
  toggleAction("payrollNoveltyForm", "payroll:manage");
  toggleAction("attendanceForm", "payroll:manage");
  toggleAction("vacationForm", "payroll:manage");
  toggleAction("shiftForm", "payroll:manage");
  toggleAction("evaluationForm", "payroll:manage");
  toggleAction("openUserModal", "users:create");
  toggleAction("editSelectedUser", "users:edit");

  const activeView = document.querySelector(".view.active")?.id;
  if (!activeView || !canView(activeView)) {
    setView(firstAllowedView());
  } else {
    renderContextModuleBar(activeView);
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
  const actions = permissions().actions;
  return actions.includes(action) || actions.some((owned) => legacyActionAliases[owned]?.includes(action));
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
      actions: sanitizeSelfServiceActions(expandPermissionActions([...defaults.actions]), user?.role),
      scope: defaults.scope
    };
  }

  return {
    views: [...override.views],
    actions: sanitizeSelfServiceActions(expandPermissionActions([...override.actions]), user?.role),
    scope: override.scope || defaults.scope
  };
}

function expandPermissionActions(actions) {
  const expanded = new Set(actions);
  actions.forEach((action) => {
    (legacyActionAliases[action] || []).forEach((alias) => expanded.add(alias));
  });
  return [...expanded];
}

function sanitizeSelfServiceActions(actions, role) {
  const allowed = new Set(allowedSelfServiceActionsForRole(role));
  return actions.filter((action) => !action.startsWith("selfservice:") || allowed.has(action));
}

function applyPatientContext(viewName, patientId) {
  if (!patientId || !state.patients.some((patient) => patient.id === patientId)) return;
  const contextTargets = {
    patients: [],
    odontogram: ["odontogramPatient"],
    treatments: ["treatmentPatient"],
    billing: ["paymentPatient"],
    selfService: ["selfRequestPatient"],
    agenda: ["appointmentPatient"]
  };
  (contextTargets[viewName] || []).forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) field.value = patientId;
  });
}

function render() {
  applyCompactMode();
  populateSelects();
  renderTopNotifications();
  renderGlobalSearch();
  renderContextModuleBar();
  renderDashboard();
  renderRoleDashboard();
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
  renderSecurityPanel();
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

  const cashierUsers = users.filter((user) => ["Administrador", "Recepción", "Contabilidad"].includes(user.role));

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

  const reportDoctorFilter = document.getElementById("reportDoctorFilter");
  if (reportDoctorFilter) {
    const current = reportDoctorFilter.value;
    reportDoctorFilter.innerHTML = `<option value="all">Todos</option>${doctorOptions}`;
    if (current && (current === "all" || doctors.some((doctor) => doctor.id === current))) {
      reportDoctorFilter.value = current;
    }
  }

  const agendaDoctorFilter = document.getElementById("agendaDoctorFilter");
  if (agendaDoctorFilter) {
    const current = agendaDoctorFilter.value;
    const agendaDoctorOptions = doctors
      .filter((doctor) => appointmentBelongsToCurrentDoctor({ doctorId: doctor.id }))
      .map((doctor) => `<option value="${doctor.id}">${escapeHtml(doctor.name)} · ${escapeHtml(doctor.specialty)}</option>`)
      .join("");
    agendaDoctorFilter.innerHTML = `<option value="all">Todos los doctores</option>${agendaDoctorOptions}`;
    if (current && (current === "all" || doctors.some((doctor) => doctor.id === current && appointmentBelongsToCurrentDoctor({ doctorId: doctor.id })))) {
      agendaDoctorFilter.value = current;
    } else if (currentUser?.role === "Doctor") {
      agendaDoctorFilter.value = currentUser.id;
    }
  }

  const reportCashierFilter = document.getElementById("reportCashierFilter");
  if (reportCashierFilter) {
    const current = reportCashierFilter.value;
    reportCashierFilter.innerHTML = `<option value="all">Todos</option>${cashierUsers
      .map((user) => `<option value="${user.id}">${escapeHtml(user.name)} · ${escapeHtml(user.role)}</option>`)
      .join("")}`;
    if (current && (current === "all" || cashierUsers.some((user) => user.id === current))) {
      reportCashierFilter.value = current;
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

  ["purchaseProduct", "inventoryMovementProduct"].forEach((id) => {
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value;
    state.inventory ||= [];
    select.innerHTML = state.inventory.length
      ? state.inventory
          .map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · Stock ${item.stock}</option>`)
          .join("")
      : `<option value="">Sin productos registrados</option>`;
    if (current && state.inventory.some((item) => item.id === current)) {
      select.value = current;
    }
  });

  const payrollNoveltyUser = document.getElementById("payrollNoveltyUser");
  if (payrollNoveltyUser) {
    const current = payrollNoveltyUser.value;
    payrollNoveltyUser.innerHTML = userOptions;
    if (current && users.some((user) => user.id === current)) {
      payrollNoveltyUser.value = current;
    }
  }

  const employeeRecordUser = document.getElementById("employeeRecordUser");
  if (employeeRecordUser) {
    const current = employeeRecordUser.value;
    employeeRecordUser.innerHTML = userOptions;
    if (current && users.some((user) => user.id === current)) {
      employeeRecordUser.value = current;
    } else if (currentUser?.id) {
      employeeRecordUser.value = currentUser.id;
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
  document.getElementById("attendanceMonthFilter").value ||= currentPayrollPeriod();
  document.getElementById("evaluationDate").value ||= todayIso;
  const evolutionSignature = document.getElementById("evolutionSignature");
  if (evolutionSignature) evolutionSignature.value = currentUser?.name || userById(currentUser?.id).name;
  document.getElementById("payrollPeriod").value ||= currentPayrollPeriod();
  document.getElementById("payrollNoveltyPeriod").value ||= selectedPayrollPeriod();
  document.getElementById("reportStartDate").value ||= `${todayIso.slice(0, 8)}01`;
  document.getElementById("reportEndDate").value ||= todayIso;
}

function toggleCompactMode() {
  compactMode = !compactMode;
  localStorage.setItem("novaclinic-compact-mode", String(compactMode));
  applyCompactMode();
}

function applyCompactMode() {
  document.body.classList.toggle("compact-mode", compactMode);
  const toggle = document.getElementById("compactModeToggle");
  if (!toggle) return;
  toggle.classList.toggle("active", compactMode);
  toggle.setAttribute("aria-pressed", String(compactMode));
  toggle.title = compactMode ? "Modo compacto activo" : "Modo compacto";
}

function activateDashboardTab(tabName = "agenda") {
  document.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.dashboardTab === tabName);
  });
  document.querySelectorAll("[data-dashboard-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.dashboardPanel === tabName);
  });
}

function renderTopNotifications() {
  const container = document.getElementById("topNotifications");
  if (!container) return;
  const notifications = topNotificationItems().filter((item) => !item.view || canView(item.view));
  container.innerHTML = notifications.length
    ? notifications.map((item) => `
      <button class="top-notification ${item.level}" data-view-jump="${item.view}" type="button">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.detail)}</span>
      </button>
    `).join("")
    : `<span class="top-notification ok">Operacion estable</span>`;
}

function topNotificationItems() {
  const cashOpening = currentCashOpening();
  const lowStock = state.inventory.filter((item) => item.stock <= item.min);
  const upcoming = state.appointments
    .filter((appointment) => appointment.date >= todayIso && appointment.status !== "Cancelada")
    .sort(sortByDateTime)
    .slice(0, 3);
  const overdue = activeBillingPayments().filter((payment) => invoiceBalance(payment) > 0 && receivableAgeDays(payment.date) > 30);

  return [
    {
      label: cashOpening ? "Caja abierta" : "Caja sin abrir",
      detail: cashOpening ? currency.format(cashOpening.openingAmount || 0) : "Pendiente",
      level: cashOpening ? "ok" : "warning",
      view: "billing"
    },
    {
      label: "Stock bajo",
      detail: lowStock.length ? `${lowStock.length} item(s)` : "Sin alerta",
      level: lowStock.length ? "danger" : "ok",
      view: "inventory"
    },
    {
      label: "Citas proximas",
      detail: upcoming.length ? `${upcoming.length} activas` : "Sin citas",
      level: upcoming.length ? "info" : "ok",
      view: "agenda"
    },
    {
      label: "Balances vencidos",
      detail: overdue.length ? `${overdue.length} factura(s)` : "Sin vencidos",
      level: overdue.length ? "danger" : "ok",
      view: "billing"
    }
  ];
}

function renderGlobalSearch() {
  const container = document.getElementById("globalSearchResults");
  const input = document.getElementById("globalSearch");
  if (!container || !input) return;
  const term = normalizeText(input.value);
  if (term.length < 2) {
    hideGlobalSearchResults();
    return;
  }

  const results = globalSearchResults(term);
  container.innerHTML = results.length
    ? results.map(globalSearchResultTemplate).join("")
    : `<div class="global-search-empty">Sin resultados para la busqueda.</div>`;
  container.classList.add("active");
}

function hideGlobalSearchResults() {
  const container = document.getElementById("globalSearchResults");
  if (!container) return;
  container.classList.remove("active");
}

function globalSearchResults(term) {
  const results = [];
  if (canView("patients")) {
    state.patients
      .filter((patient) => patientSearchHaystack(patient).includes(term))
      .slice(0, 5)
      .forEach((patient) => results.push({
        type: "Paciente",
        title: patient.name,
        detail: `${patient.code || "Sin codigo"} · ${patient.phone || "Sin telefono"}`,
        view: "patients"
      }));
  }

  if (canView("billing")) {
    activeBillingPayments()
      .filter((payment) => normalizeText([
        payment.invoiceNumber,
        payment.receiptNumber,
        payment.ncf,
        payment.concept,
        patientById(payment.patientId).name,
        paymentBillToLabel(payment)
      ].join(" ")).includes(term))
      .slice(0, 5)
      .forEach((payment) => results.push({
        type: "Factura",
        title: payment.invoiceNumber || payment.receiptNumber || "Documento sin numero",
        detail: `${patientById(payment.patientId).name} · ${currency.format(invoiceBalance(payment))} pendiente`,
        view: "billing"
      }));
  }

  if (canView("agenda")) {
    state.appointments
      .filter((appointment) => appointmentBelongsToCurrentDoctor(appointment))
      .filter((appointment) => normalizeText([
        patientById(appointment.patientId).name,
        doctorById(appointment.doctorId).name,
        appointment.reason,
        appointment.status,
        appointment.date,
        appointment.time
      ].join(" ")).includes(term))
      .sort(sortByDateTime)
      .slice(0, 5)
      .forEach((appointment) => results.push({
        type: "Cita",
        title: patientById(appointment.patientId).name,
        detail: `${formatDate(appointment.date)} ${appointment.time} · ${doctorById(appointment.doctorId).name}`,
        view: "agenda"
      }));
  }

  if (canView("dashboard") || canView("usersPanel")) {
    doctors
      .filter((doctor) => normalizeText([doctor.name, doctor.specialty, doctor.room, doctor.shift].join(" ")).includes(term))
      .slice(0, 5)
      .forEach((doctor) => results.push({
        type: "Doctor",
        title: doctor.name,
        detail: `${doctor.specialty} · ${doctor.room}`,
        view: canView("usersPanel") ? "usersPanel" : "dashboard"
      }));
  }

  return results.slice(0, 12);
}

function globalSearchResultTemplate(result) {
  return `
    <button class="global-search-result" data-view-jump="${result.view}" type="button">
      <span>${escapeHtml(result.type)}</span>
      <strong>${escapeHtml(result.title)}</strong>
      <small>${escapeHtml(result.detail)}</small>
    </button>
  `;
}

function renderRoleDashboard() {
  const container = document.getElementById("roleDashboardPanel");
  if (!container) return;
  const role = currentUser?.role || "Recepción";
  const config = roleDashboardConfig(role);
  const modules = config.modules.filter((viewName) => canView(viewName));
  container.innerHTML = `
    <div class="role-dashboard-copy">
      <span class="status-pill ${className(config.status)}">${escapeHtml(config.status)}</span>
      <div>
        <h2>${escapeHtml(config.title)}</h2>
        <p>${escapeHtml(config.detail)}</p>
      </div>
    </div>
    <div class="role-dashboard-actions">
      ${modules.map((viewName) => `<button class="ghost-button" data-view-jump="${viewName}" type="button">${escapeHtml(views[viewName] || viewName)}</button>`).join("")}
    </div>
  `;
}

function roleDashboardConfig(role) {
  const pendingLab = (state.selfServiceRequests || []).filter((request) => normalizeText(request.type).includes("laboratorio") && !["Completada", "Facturada"].includes(request.status)).length;
  const pendingVacations = (state.vacations || []).filter((vacation) => vacation.status === "Solicitada").length;
  const openInvoices = activeBillingPayments().filter((payment) => invoiceBalance(payment) > 0).length;
  const todayAppointments = state.appointments.filter((appointment) => appointment.date === todayIso).length;
  const roleMap = {
    Administrador: {
      title: "Panel ejecutivo administrador",
      detail: `${todayAppointments} citas hoy, ${openInvoices} facturas con balance y control completo de seguridad.`,
      status: "Acceso completo",
      modules: ["receptionPanel", "usersPanel", "accountingPanel", "reports", "adminPanel"]
    },
    Doctor: {
      title: "Panel clinico del doctor",
      detail: `${appointmentsForCurrentDoctor().filter((appointment) => appointment.date === todayIso).length} citas propias hoy y seguimiento de odontograma/evolucion.`,
      status: "Clinico",
      modules: ["agenda", "patients", "odontogram", "treatments", "selfService"]
    },
    "Recepción": {
      title: "Panel operativo de recepcion",
      detail: `${todayAppointments} citas para gestionar, admision de pacientes y cobros rapidos.`,
      status: "Front desk",
      modules: ["patients", "agenda", "billing", "selfService"]
    },
    "Recursos Humanos": {
      title: "Panel de Recursos Humanos",
      detail: `${pendingVacations} solicitudes pendientes, nomina, asistencia, turnos y evaluaciones.`,
      status: "RRHH",
      modules: ["hrPanel", "selfService"]
    },
    Laboratorio: {
      title: "Panel de laboratorio",
      detail: `${pendingLab} solicitudes activas para piezas, placas, detalles y facturacion al doctor.`,
      status: "Laboratorio",
      modules: ["laboratoryPanel"]
    },
    Contabilidad: {
      title: "Panel de caja y contabilidad",
      detail: `${currency.format(paymentCollections(todayIso).reduce((sum, item) => sum + item.amount, 0))} ingresados hoy y ${openInvoices} balances abiertos.`,
      status: "Caja",
      modules: ["accountingPanel", "billing", "reports", "inventory"]
    }
  };
  return roleMap[role] || roleMap["Recepción"];
}

function renderDashboard() {
  const doctorAppointments = appointmentsForCurrentDoctor();
  const doctorTreatments = treatmentsForCurrentDoctor();
  const todayAppointments = doctorAppointments.filter((appointment) => appointment.date === todayIso);
  const allTodayAppointments = state.appointments.filter((appointment) => appointment.date === todayIso);
  const todayIncome = paymentCollections(todayIso).reduce((sum, collection) => sum + collection.amount, 0);
  const pendingBalance = activeBillingPayments().reduce((sum, payment) => sum + invoiceBalance(payment), 0);
  const patientsWithBalance = new Set(activeBillingPayments().filter((payment) => invoiceBalance(payment) > 0).map((payment) => payment.patientId)).size;
  const activePlans = doctorTreatments.filter((treatment) => treatment.progress < 100).length;
  const confirmed = todayAppointments.filter((appointment) => appointment.status === "Confirmada").length;
  const cashOpening = currentCashOpening();
  const cashClosedToday = (state.cashClosings || []).find((closing) => closing.date === todayIso && closing.status !== "Reabierta");
  const cashStatus = cashOpening ? "Abierta" : cashClosedToday ? "Cerrada" : "Sin abrir";
  const lowStock = state.inventory.filter((item) => item.stock <= item.min);
  const upcomingAppointments = state.appointments
    .filter((appointment) => appointment.date >= todayIso && appointment.status !== "Cancelada")
    .sort(sortByDateTime)
    .slice(0, 3);

  const metrics = [
    {
      label: "Citas hoy",
      value: allTodayAppointments.length,
      detail: `${confirmed} confirmadas para mi usuario`,
      status: allTodayAppointments.length ? "confirmada" : "pendiente"
    },
    {
      label: "Ingresos hoy",
      value: currency.format(todayIncome),
      detail: `${activeBillingPayments().filter((payment) => payment.date === todayIso).length} cobros registrados`,
      status: todayIncome > 0 ? "confirmada" : "pendiente"
    },
    {
      label: "Pacientes pendientes",
      value: patientsWithBalance,
      detail: `${currency.format(pendingBalance)} por cobrar`,
      status: patientsWithBalance ? "pendiente" : "confirmada"
    },
    {
      label: "Caja",
      value: cashStatus,
      detail: cashOpening ? `Inicial ${currency.format(cashOpening.openingAmount || 0)}` : cashClosedToday ? "Cierre registrado hoy" : "Debe abrirse para cobrar",
      status: cashOpening ? "confirmada" : cashClosedToday ? "pagado" : "cancelada"
    }
  ];

  document.getElementById("metricGrid").innerHTML = metrics
    .map(dashboardMetricTemplate)
    .join("");

  renderDoctorCommandCenter({
    todayAppointments,
    doctorAppointments,
    doctorTreatments
  });

  renderTaskFlow("doctorTaskFlow", "doctor", {
    appointmentCount: todayAppointments.length,
    pendingOdontograms: doctorTreatments.filter((treatment) => treatment.progress < 100).length,
    billableRequests: doctorLabRequestsForCurrentUser().filter((request) => ["Terminado", "Entregado", "Completada"].includes(request.status)).length
  });

  document.getElementById("dashboardAlertStrip").innerHTML = [
    {
      label: "Stock bajo",
      detail: lowStock.length ? `${lowStock.length} productos requieren reposición` : "Inventario sin alertas críticas",
      status: lowStock.length ? "Pendiente" : "Confirmada",
      view: "inventory"
    },
    {
      label: "Pacientes con deuda",
      detail: patientsWithBalance ? `${patientsWithBalance} pacientes con balance pendiente` : "No hay balances pendientes",
      status: patientsWithBalance ? "Pendiente" : "Confirmada",
      view: "patients"
    },
    {
      label: "Próximas citas",
      detail: upcomingAppointments.length ? upcomingAppointments.map((appointment) => `${appointment.time} ${patientById(appointment.patientId).name}`).join(" | ") : "No hay próximas citas activas",
      status: upcomingAppointments.length ? "Confirmada" : "Pendiente",
      view: "agenda"
    }
  ].map(dashboardAlertTemplate).join("");

  renderDashboardQuickActions();
  renderPanelModules("dashboardModuleDetails", "dashboard");

  document.getElementById("todayAppointments").innerHTML = todayAppointments.length
    ? todayAppointments
        .sort(sortByDateTime)
        .slice(0, 4)
        .map((appointment) => appointmentTemplate(appointment))
        .join("")
    : emptyState("No hay citas registradas para hoy.");

  const receivableAlerts = activeBillingPayments().filter((payment) => invoiceBalance(payment) > 0).slice(0, 3);
  const alerts = [
    ...receivableAlerts.map((payment) => ({
      label: patientById(payment.patientId).name,
      detail: `${payment.invoiceNumber || "FAC-S/N"} pendiente ${currency.format(invoiceBalance(payment))}`,
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

function renderDoctorCommandCenter({ todayAppointments, doctorAppointments, doctorTreatments }) {
  const container = document.getElementById("doctorCommandCenter");
  if (!container) return;

  const queueFilter = document.getElementById("doctorQueueFilter")?.value || "today";
  const clinicalSearch = normalizeText(document.getElementById("doctorClinicalSearch")?.value || "");
  const sortedTodayAppointments = todayAppointments.slice().sort(sortByDateTime);
  const visibleAppointments = doctorQueueAppointments(doctorAppointments, queueFilter, clinicalSearch);
  const currentAppointment = visibleAppointments.find((appointment) => appointment.status === "Llegó")
    || visibleAppointments.find((appointment) => !["Atendida", "Cancelada", "No asistió"].includes(appointment.status))
    || sortedTodayAppointments.find((appointment) => appointment.status === "Llegó")
    || sortedTodayAppointments.find((appointment) => !["Atendida", "Cancelada", "No asistió"].includes(appointment.status))
    || visibleAppointments[0]
    || sortedTodayAppointments[0];
  const currentPatient = currentAppointment ? patientById(currentAppointment.patientId) : null;
  const activeTreatments = doctorTreatments.filter((treatment) => Number(treatment.progress || 0) < 100);
  const pendingOdontograms = activeTreatments.filter((treatment) => !["Terminado", "Facturado"].includes(treatment.phase || treatment.status));
  const labRequests = doctorLabRequestsForCurrentUser();
  const pendingLab = labRequests.filter((request) => !["Completada", "Facturada", "Facturado"].includes(request.status));
  const readyLab = labRequests.filter((request) => ["Terminado", "Entregado", "Completada"].includes(request.status));
  const patientsInRoom = sortedTodayAppointments.filter((appointment) => appointment.status === "Llegó").length;
  const pendingEvolutions = sortedTodayAppointments.filter((appointment) => {
    const hasEvolutionToday = (state.evolutions || []).some((evolution) =>
      evolution.patientId === appointment.patientId &&
      evolution.doctorId === appointment.doctorId &&
      evolution.date === todayIso
    );
    return ["Llegó", "Atendida"].includes(appointment.status) && !hasEvolutionToday;
  }).length;
  const billingPending = activeBillingPayments().filter((payment) =>
    invoiceBalance(payment) > 0 &&
    sortedTodayAppointments.some((appointment) => appointment.patientId === payment.patientId)
  ).length;

  container.innerHTML = `
    <div class="doctor-command-header">
      <div>
        <span class="eyebrow">Mi día clínico</span>
        <h2>${escapeHtml(currentPatient ? `Atención de ${currentPatient.name}` : "Panel clínico del doctor")}</h2>
        <p>${escapeHtml(currentAppointment ? `${currentAppointment.time} · ${currentAppointment.type} · ${currentAppointment.status}` : "Sin citas activas para hoy.")}</p>
      </div>
      <div class="doctor-command-actions">
        ${currentPatient ? `<button class="primary-button primary-action" data-open-patient-record="${currentPatient.id}" type="button">Abrir ficha</button>` : ""}
        <button class="ghost-button" data-view-jump="agenda" type="button">Agenda clínica</button>
      </div>
    </div>
    <div class="doctor-notification-bar">
      ${doctorMiniNotice("Sala", `${patientsInRoom} paciente(s)`, patientsInRoom ? "warning" : "ok")}
      ${doctorMiniNotice("Laboratorio", `${readyLab.length} listo(s)`, readyLab.length ? "warning" : "ok")}
      ${doctorMiniNotice("Evolución", `${pendingEvolutions} pendiente(s)`, pendingEvolutions ? "danger" : "ok")}
      ${doctorMiniNotice("Facturación", `${billingPending} balance(s)`, billingPending ? "warning" : "ok")}
    </div>
    <div class="doctor-command-tools">
      <input id="doctorClinicalSearch" type="search" placeholder="Buscar paciente, documento, teléfono o procedimiento" value="${escapeHtml(document.getElementById("doctorClinicalSearch")?.value || "")}">
      <select id="doctorQueueFilter" aria-label="Filtro de cola clínica">
        ${[
          ["today", "Hoy"],
          ["mine", "Mis pacientes"],
          ["pending", "Pendientes"]
        ].map(([value, label]) => `<option value="${value}" ${queueFilter === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </div>
    <div class="doctor-command-layout">
      <div class="doctor-command-main">
        ${doctorPrimaryActionsTemplate(currentPatient, {
          activeTreatments: activeTreatments.filter((treatment) => treatment.patientId === currentPatient?.id),
          pendingOdontograms: pendingOdontograms.filter((treatment) => treatment.patientId === currentPatient?.id),
          pendingLab
        })}
        <div class="doctor-agenda-strip">
          ${visibleAppointments.length
            ? visibleAppointments.slice(0, 6).map(doctorAppointmentCardTemplate).join("")
            : emptyState("No hay pacientes en la cola clínica con este filtro.")}
        </div>
      </div>
      ${doctorContextPanelTemplate(currentPatient, currentAppointment, activeTreatments)}
    </div>
  `;
}

function doctorQueueAppointments(appointments, filter, searchTerm) {
  const filtered = appointments
    .filter((appointment) => appointment.status !== "Cancelada")
    .filter((appointment) => {
      if (filter === "today") return appointment.date === todayIso;
      if (filter === "pending") return ["Pendiente", "Confirmada", "Llegó", "Lista de espera"].includes(appointment.status);
      return appointment.date >= todayIso;
    })
    .filter((appointment) => {
      if (!searchTerm) return true;
      const patient = patientById(appointment.patientId);
      const treatments = state.treatments
        .filter((treatment) => treatment.patientId === appointment.patientId)
        .map((treatment) => treatment.name)
        .join(" ");
      return normalizeText([
        patient.name,
        patient.code,
        patient.document,
        patient.phone,
        appointment.type,
        treatments
      ].join(" ")).includes(searchTerm);
    });
  return filtered.sort(sortByDateTime);
}

function doctorMiniNotice(label, valueText, tone) {
  return `<span class="doctor-mini-notice ${tone}"><strong>${escapeHtml(label)}</strong>${escapeHtml(valueText)}</span>`;
}

function doctorCurrentPatientTemplate(patient, appointment, activeTreatments) {
  if (!patient) {
    return `
      <article class="doctor-focus-card">
        <span class="status-pill pendiente">Sin paciente activo</span>
        <h3>Próxima atención</h3>
        <p>Cuando exista una cita activa, aquí aparecerá la ficha rápida del paciente.</p>
      </article>
    `;
  }
  const patientTreatments = activeTreatments.filter((treatment) => treatment.patientId === patient.id);
  const lastTreatment = patientTreatments[0] || state.treatments.find((treatment) => treatment.patientId === patient.id);
  return `
    <article class="doctor-focus-card patient-focus-card">
      <div class="doctor-patient-line">
        ${patientPhotoTemplate(patient)}
        <div>
          <span class="status-pill ${className(appointment?.status || "Pendiente")}">${escapeHtml(appointment?.status || "Pendiente")}</span>
          <h3>${escapeHtml(patient.name)}</h3>
          <p>${escapeHtml(patientAge(patient.birthdate))} · ${escapeHtml(patient.insurance || "Sin seguro")}</p>
        </div>
      </div>
      <div class="doctor-mini-facts">
        <span>Alergias: <strong>${escapeHtml(patient.allergies || "Ninguna")}</strong></span>
        <span>Condiciones: <strong>${escapeHtml(patient.conditions || "Sin registro")}</strong></span>
        <span>Balance: <strong>${currency.format(patient.balance || 0)}</strong></span>
        <span>Último tratamiento: <strong>${escapeHtml(lastTreatment?.name || "Sin tratamiento")}</strong></span>
      </div>
    </article>
  `;
}

function doctorPrimaryActionsTemplate(patient, context) {
  const patientId = patient?.id || "";
  const disabled = patientId ? "" : "disabled";
  const hasTreatment = context.activeTreatments.length > 0;
  const needsOdontogram = context.pendingOdontograms.length > 0;
  const hasLab = context.pendingLab.some((request) => request.patientId === patientId || !request.patientId);
  return `
    <section class="doctor-primary-actions" aria-label="Acciones principales del doctor">
      <button class="primary-button primary-action" data-open-patient-record="${patientId}" type="button" ${disabled}>Atender paciente</button>
      <button class="ghost-button ${needsOdontogram ? "priority-warning" : ""}" data-view-jump="odontogram" data-patient-context="${patientId}" type="button" ${disabled}>Actualizar odontograma</button>
      <button class="ghost-button ${hasTreatment ? "priority-warning" : ""}" data-view-jump="odontogram" data-patient-context="${patientId}" type="button" ${disabled}>Registrar evolución</button>
      <button class="ghost-button ${hasLab ? "priority-warning" : ""}" data-view-jump="selfService" data-patient-context="${patientId}" type="button" ${disabled}>Solicitar laboratorio</button>
      <button class="ghost-button" data-view-jump="billing" data-patient-context="${patientId}" type="button" ${disabled}>Finalizar atención</button>
    </section>
  `;
}

function doctorContextPanelTemplate(patient, appointment, activeTreatments) {
  if (!patient) {
    return `
      <aside class="doctor-context-panel">
        <span class="status-pill pendiente">Panel contextual</span>
        <h3>Seleccione un paciente</h3>
        <p>Al elegir una cita, verá alergias, última visita, tratamiento activo, balance e historial resumido.</p>
      </aside>
    `;
  }
  const patientTreatments = activeTreatments.filter((treatment) => treatment.patientId === patient.id);
  const allTreatments = state.treatments.filter((treatment) => treatment.patientId === patient.id);
  const activeTreatment = patientTreatments[0] || allTreatments[0];
  const lastEvolution = (state.evolutions || []).find((evolution) => evolution.patientId === patient.id);
  const lastDentalHistory = (state.odontogramHistory || []).find((item) => item.patientId === patient.id);
  const nextAppointment = state.appointments
    .filter((item) => item.patientId === patient.id && item.date >= todayIso && item.status !== "Cancelada")
    .sort(sortByDateTime)[0];
  return `
    <aside class="doctor-context-panel">
      <div class="doctor-context-head">
        ${patientPhotoTemplate(patient)}
        <div>
          <span class="status-pill ${priorityClassForPatient(patient)}">${priorityLabelForPatient(patient)}</span>
          <h3>${escapeHtml(patient.name)}</h3>
          <p>${escapeHtml(patient.code || "Sin código")} · ${escapeHtml(patientAge(patient.birthdate))}</p>
        </div>
      </div>
      ${doctorClinicalProgressTemplate(appointment, activeTreatment, lastEvolution)}
      <div class="doctor-context-facts">
        <span>Alergias <strong>${escapeHtml(patient.allergies || "Ninguna")}</strong></span>
        <span>Última visita <strong>${formatDate(patient.lastVisit)}</strong></span>
        <span>Tratamiento activo <strong>${escapeHtml(activeTreatment?.name || "Sin tratamiento")}</strong></span>
        <span>Balance <strong>${currency.format(patient.balance || 0)}</strong></span>
      </div>
      <div class="doctor-history-summary">
        <h4>Historial resumido</h4>
        <p><strong>Última evolución:</strong> ${escapeHtml(lastEvolution?.note || "Sin evolución registrada")}</p>
        <p><strong>Último odontograma:</strong> ${lastDentalHistory ? `${escapeHtml(lastDentalHistory.tooth)} · ${labelStatus(lastDentalHistory.status)}` : "Sin cambios registrados"}</p>
        <p><strong>Próxima cita:</strong> ${nextAppointment ? `${formatDate(nextAppointment.date)} ${nextAppointment.time}` : "Sin cita próxima"}</p>
        <div class="doctor-treatment-chips">
          ${allTreatments.slice(0, 3).map((treatment) => `<span>${escapeHtml(treatment.name)} · ${escapeHtml(treatment.phase || treatment.status)}</span>`).join("") || "<span>Sin tratamientos recientes</span>"}
        </div>
      </div>
      <div class="doctor-context-actions">
        <button class="ghost-button" data-open-patient-record="${patient.id}" type="button">Ver histórico completo</button>
        <button class="ghost-button" data-view-jump="odontogram" data-patient-context="${patient.id}" type="button">Odontograma</button>
      </div>
    </aside>
  `;
}

function doctorClinicalProgressTemplate(appointment, treatment, evolution) {
  const steps = [
    { label: "Cita", done: Boolean(appointment) },
    { label: "Evaluación", done: Boolean(appointment && ["Llegó", "Atendida"].includes(appointment.status)) },
    { label: "Tratamiento", done: Boolean(treatment) },
    { label: "Evolución", done: Boolean(evolution) },
    { label: "Facturación", done: Boolean(treatment && ["Facturado", "Terminado"].includes(treatment.phase || treatment.status)) }
  ];
  return `
    <div class="doctor-progress">
      ${steps.map((step) => `<span class="${step.done ? "done" : ""}">${escapeHtml(step.label)}</span>`).join("")}
    </div>
  `;
}

function priorityClassForPatient(patient) {
  if (hasMedicalAlert(patient)) return "cancelada";
  if ((patient.balance || 0) > 0 || patientIsMinor(patient)) return "pendiente";
  return "confirmada";
}

function priorityLabelForPatient(patient) {
  if (hasMedicalAlert(patient)) return "Riesgo clínico";
  if (patientIsMinor(patient)) return "Menor de edad";
  if ((patient.balance || 0) > 0) return "Pendiente";
  return "Normal";
}

function doctorWorkflowTemplate(patient) {
  const patientId = patient?.id || "";
  const disabledClass = patientId ? "" : "is-disabled";
  return `
    <article class="doctor-focus-card">
      <span class="status-pill confirmada">Flujo de atención</span>
      <div class="doctor-workflow-steps">
        ${[
          { label: "Llegó", view: "agenda" },
          { label: "Ficha", record: true },
          { label: "Diagnóstico", view: "odontogram" },
          { label: "Odontograma", view: "odontogram" },
          { label: "Tratamiento", view: "treatments" },
          { label: "Evolución", view: "odontogram" },
          { label: "Facturación", view: "billing" }
        ].map((step) => `
          <button class="${disabledClass}" ${step.record ? `data-open-patient-record="${patientId}"` : `data-view-jump="${step.view}" data-patient-context="${patientId}"`} type="button" ${patientId ? "" : "disabled"}>${step.label}</button>
        `).join("")}
      </div>
    </article>
  `;
}

function doctorAlertsTemplate(patients) {
  return `
    <article class="doctor-focus-card">
      <span class="status-pill ${patients.length ? "cancelada" : "confirmada"}">Alertas clínicas</span>
      <div class="doctor-alert-list">
        ${patients.length
          ? patients.slice(0, 4).map((patient) => `
            <button data-open-patient-record="${patient.id}" type="button">
              <strong>${escapeHtml(patient.name)}</strong>
              <small>${escapeHtml([
                ...clinicalAlertBadges(patient),
                patientIsMinor(patient) ? "Menor de edad" : ""
              ].filter(Boolean).join(" · ") || "Revisar expediente")}</small>
            </button>
          `).join("")
          : "<p>Sin alertas críticas en la agenda de hoy.</p>"}
      </div>
    </article>
  `;
}

function doctorProductivityTemplate(stats) {
  return `
    <article class="doctor-focus-card">
      <span class="status-pill confirmada">Productividad</span>
      <div class="doctor-productivity-grid">
        <span><strong>${stats.attendedToday}</strong><small>Atendidos hoy</small></span>
        <span><strong>${stats.activeTreatments}</strong><small>Activos</small></span>
        <span><strong>${stats.pendingOdontograms}</strong><small>Odontogramas</small></span>
        <span><strong>${stats.pendingLab}</strong><small>Laboratorio</small></span>
        <span><strong>${stats.commission.points}</strong><small>Puntos</small></span>
        <span><strong>${currency.format(stats.commission.money)}</strong><small>Comisión</small></span>
      </div>
    </article>
  `;
}

function doctorAppointmentCardTemplate(appointment) {
  const patient = patientById(appointment.patientId);
  const actionLabel = ["Pendiente", "Confirmada"].includes(appointment.status)
    ? "Atender"
    : appointment.status === "Llegó"
      ? "Abrir ficha"
      : "Ver ficha";
  return `
    <article class="doctor-appointment-card ${className(appointment.status)}">
      <div>
        <span class="time-chip">${escapeHtml(appointment.time)}</span>
        <strong>${escapeHtml(patient.name)}</strong>
        <p>${escapeHtml(appointment.type)}</p>
      </div>
      <span class="status-pill ${className(appointment.status)}">${escapeHtml(appointment.status)}</span>
      <div class="doctor-card-actions">
        <button class="ghost-button" data-doctor-attend="${appointment.id}" type="button">${escapeHtml(actionLabel)}</button>
      </div>
    </article>
  `;
}

function doctorLabRequestsForCurrentUser() {
  return (state.selfServiceRequests || []).filter((request) =>
    normalizeText(request.type).includes("laboratorio") &&
    (permissions().scope === "all" || request.createdBy === currentUser?.id)
  );
}

function dashboardMetricTemplate(metric) {
  return `
    <article class="metric-card executive-metric">
      <div>
        <span>${escapeHtml(metric.label)}</span>
        <strong>${escapeHtml(String(metric.value))}</strong>
      </div>
      <p>${escapeHtml(metric.detail)}</p>
      <small class="status-pill ${className(metric.status)}">${escapeHtml(metric.status)}</small>
    </article>
  `;
}

function dashboardAlertTemplate(alert) {
  return `
    <button class="dashboard-alert-card" data-view-jump="${alert.view}" type="button">
      <span class="status-pill ${className(alert.status)}">${escapeHtml(alert.status)}</span>
      <div>
        <strong>${escapeHtml(alert.label)}</strong>
        <p>${escapeHtml(alert.detail)}</p>
      </div>
    </button>
  `;
}

function renderTaskFlow(containerId, flowKey, stats = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const tasks = taskFlowItems(flowKey, stats).filter((task) => canView(task.view));
  container.classList.toggle("is-empty", !tasks.length);
  container.innerHTML = tasks.length
    ? `
      <div class="task-flow-heading">
        <span class="eyebrow">Qué hacer ahora</span>
        <strong>${escapeHtml(taskFlowTitle(flowKey))}</strong>
      </div>
      <div class="task-flow-list">
        ${tasks.map(taskFlowButtonTemplate).join("")}
      </div>
    `
    : "";
}

function taskFlowTitle(flowKey) {
  return {
    reception: "Flujo de recepción",
    doctor: "Flujo clínico del doctor",
    cash: "Flujo de caja",
    laboratory: "Flujo de laboratorio"
  }[flowKey] || "Flujo operativo";
}

function taskFlowItems(flowKey, stats) {
  const flows = {
    reception: [
      { label: "Buscar paciente", detail: "Abrir expedientes y validar datos", view: "patients", status: "Confirmada" },
      { label: "Crear cita", detail: `${stats.todayAppointments || 0} citas hoy`, view: "agenda", status: "Pendiente" },
      { label: "Confirmar llegada", detail: `${stats.pendingAppointments || 0} por confirmar`, view: "agenda", status: stats.pendingAppointments ? "Pendiente" : "Confirmada" }
    ],
    doctor: [
      { label: "Ver citas", detail: `${stats.appointmentCount || 0} citas propias hoy`, view: "agenda", status: stats.appointmentCount ? "Pendiente" : "Confirmada" },
      { label: "Abrir expediente", detail: "Ficha clínica y alertas médicas", view: "patients", status: "Confirmada" },
      { label: "Actualizar odontograma", detail: `${stats.pendingOdontograms || 0} tratamientos activos`, view: "odontogram", status: stats.pendingOdontograms ? "Pendiente" : "Confirmada" }
    ],
    cash: [
      { label: "Abrir caja", detail: stats.cashOpen ? "Caja abierta" : "Requiere apertura", view: "billing", status: stats.cashOpen ? "Confirmada" : "Cancelada" },
      { label: "Facturar", detail: "Servicios, productos o laboratorio", view: "billing", status: "Pendiente" },
      { label: "Cobrar e imprimir", detail: `${stats.pendingInvoices || 0} balances pendientes`, view: "billing", status: stats.pendingInvoices ? "Pendiente" : "Confirmada" }
    ],
    laboratory: [
      { label: "Ver solicitudes", detail: `${stats.activeRequests || 0} trabajos activos`, view: "laboratoryPanel", status: stats.activeRequests ? "Pendiente" : "Confirmada" },
      { label: "Cambiar estado", detail: "Recibido, proceso, terminado o entregado", view: "laboratoryPanel", status: "Pendiente" },
      { label: "Facturar al doctor", detail: `${stats.billableRequests || 0} listos para facturar`, view: "laboratoryPanel", status: stats.billableRequests ? "Pendiente" : "Confirmada" }
    ]
  };
  return flows[flowKey] || [];
}

function taskFlowButtonTemplate(task) {
  return `
    <button class="task-flow-step" data-view-jump="${task.view}" type="button">
      <span class="status-pill ${className(task.status)}">${escapeHtml(task.status)}</span>
      <strong>${escapeHtml(task.label)}</strong>
      <small>${escapeHtml(task.detail)}</small>
    </button>
  `;
}

function renderDashboardQuickActions() {
  const container = document.getElementById("doctorPanelModules");
  if (!container) return;
  const quickViews = roleDashboardConfig(currentUser?.role || "Recepción").modules
    .filter((viewName) => canView(viewName))
    .slice(0, 5);
  container.innerHTML = quickViews.length
    ? quickViews.map(moduleButtonTemplate).join("")
    : emptyState("No hay accesos rápidos habilitados.");
}

function renderReceptionPanel() {
  const todayAppointments = state.appointments
    .filter((appointment) => appointment.date === todayIso)
    .sort(sortByDateTime);
  const pendingAppointments = todayAppointments.filter((appointment) => appointment.status === "Pendiente").length;
  const pendingBalance = activeBillingPayments().reduce((sum, payment) => sum + invoiceBalance(payment), 0);

  document.getElementById("receptionPanelCards").innerHTML = [
    ["Citas de hoy", todayAppointments.length],
    ["Por confirmar", pendingAppointments],
    ["Pacientes registrados", state.patients.length],
    ["Balance abierto", currency.format(pendingBalance)]
  ].map(panelCardTemplate).join("");

  renderTaskFlow("receptionTaskFlow", "reception", {
    pendingAppointments,
    todayAppointments: todayAppointments.length
  });

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
  const monthPrefix = selectedPayrollPeriod();
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

  document.getElementById("hrMonthlySummary").innerHTML = [
    ["Nómina mensual", currency.format(payrollTotal), `${payrollItems.filter((item) => item.status === "Pagado").length} pagados`, "pagado"],
    ["Asistencia", state.hrAttendance.filter((item) => item.date?.startsWith(monthPrefix)).length, "Registros del mes", "confirmada"],
    ["Vacaciones", state.hrVacations.filter((item) => item.start?.startsWith(monthPrefix) || item.status === "Solicitada").length, "Solicitudes y ausencias", "pendiente"],
    ["Turnos", state.hrShifts.length || shiftCount, "Asignaciones activas", "confirmada"],
    ["Evaluaciones", state.hrEvaluations.filter((item) => item.date?.startsWith(monthPrefix)).length, "Evaluaciones del mes", "pendiente"]
  ].map(hrMonthlyCardTemplate).join("");

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
    ["Evaluaciones", `${state.hrEvaluations.length} evaluaciones registradas.`],
    ["Credenciales", `${state.hrEvaluations.filter((item) => ["Vencida"].includes(credentialExpiryStatus(item).label) || credentialExpiryStatus(item).label.startsWith("Vence")).length} por vencer o vencidas.`]
  ].map(([label, detail]) => `
    <article class="alert-item">
      <span class="status-pill pendiente">${label}</span>
      <div><strong>${detail}</strong><p>Módulo activo dentro de RRHH.</p></div>
    </article>
  `).join("");

  renderEmployeeRecordPanel();
  renderHrControls();
  renderPayroll(payrollItems);
  activateHrTab(activeHrTab);
}

function renderEmployeeRecordPanel() {
  const selectedId = value("employeeRecordUser") || users[0]?.id;
  const user = userById(selectedId);
  const payrollItem = normalizedPayroll().map(payrollDisplayItem).find((item) => item.userId === selectedId);
  const attendance = (state.hrAttendance || []).filter((item) => item.userId === selectedId).sort((a, b) => `${b.date}`.localeCompare(`${a.date}`));
  const vacations = (state.hrVacations || []).filter((item) => item.userId === selectedId).sort((a, b) => `${b.start}`.localeCompare(`${a.start}`));
  const evaluations = (state.hrEvaluations || []).filter((item) => item.userId === selectedId).sort((a, b) => `${b.date}`.localeCompare(`${a.date}`));
  const shifts = (state.hrShifts || []).filter((item) => item.userId === selectedId);
  const latestEvaluation = evaluations[0];
  const credential = latestEvaluation ? credentialExpiryStatus(latestEvaluation) : { label: "Sin credencial", className: "pendiente" };

  document.getElementById("employeeRecordSummary").innerHTML = [
    ["Empleado", user.name],
    ["Rol", user.role || "Sin rol"],
    ["Turno", shifts[0] ? `${shifts[0].start}-${shifts[0].end}` : user.shift || "Sin turno"],
    ["Nómina", payrollItem ? currency.format(payrollNet(payrollItem)) : "Sin nómina"],
    ["Asistencia", `${attendance.length} registros`],
    ["Credencial", credential.label]
  ].map(panelCardTemplate).join("");

  const timeline = [
    ...attendance.slice(0, 4).map((item) => ({
      badge: item.status,
      status: hrStatusClass(item.status),
      title: `Asistencia ${formatDate(item.date)}`,
      detail: `${item.timeIn || "Sin entrada"} - ${item.timeOut || "Sin salida"} · ${attendanceHours(item)}`
    })),
    ...vacations.slice(0, 4).map((item) => ({
      badge: item.status,
      status: hrStatusClass(item.status),
      title: `${item.type || "Vacaciones"} ${formatDate(item.start)} - ${formatDate(item.end)}`,
      detail: item.approvedBy ? `Aprobado por ${userById(item.approvedBy).name}` : item.note || "Pendiente de aprobación"
    })),
    ...evaluations.slice(0, 4).map((item) => ({
      badge: item.status,
      status: credentialExpiryStatus(item).className,
      title: `Evaluación ${Number(item.score) || 0}/100`,
      detail: `${item.credential || "Sin credencial"} · ${credentialExpiryStatus(item).label}`
    }))
  ];

  document.getElementById("employeeRecordTimeline").innerHTML = timeline.length
    ? timeline.map((item) => `
      <article class="clinical-item">
        <span class="status-pill ${item.status}">${escapeHtml(item.badge)}</span>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.detail)}</p>
        </div>
      </article>
    `).join("")
    : emptyState("No hay historial para este empleado.");
}

function renderLaboratoryPanel() {
  const labRequests = (state.selfServiceRequests || [])
    .filter((request) => request.type === "Laboratorio - pieza dental");
  const requested = labRequests.filter((request) => request.status === "Solicitado").length;
  const active = labRequests.filter((request) => ["Recibido", "En proceso", "Terminado"].includes(request.status)).length;
  const delivered = labRequests.filter((request) => request.status === "Entregado").length;
  const invoiced = labRequests.filter((request) => request.status === "Facturado").length;
  const dueSoon = labRequests.filter((request) => request.promisedAt && !["Facturado", "Cancelado"].includes(request.status) && request.promisedAt <= todayIso).length;
  const profitability = laboratoryProfitabilityByDoctor(labRequests);

  document.getElementById("laboratoryPanelCards").innerHTML = [
    ["Solicitudes", labRequests.length],
    ["Solicitadas", requested],
    ["En proceso", active],
    ["Entregadas", delivered],
    ["Facturadas", invoiced],
    ["Rentabilidad", currency.format(profitability.reduce((sum, item) => sum + item.profit, 0))],
    ["Por vencer", dueSoon]
  ].map(panelCardTemplate).join("");

  renderTaskFlow("laboratoryTaskFlow", "laboratory", {
    activeRequests: labRequests.filter((request) => !["Entregado", "Facturado"].includes(request.status)).length,
    billableRequests: labRequests.filter((request) => request.status === "Terminado").length
  });

  renderPanelModules("laboratoryPanelModules", "laboratoryPanel");

  document.getElementById("laboratoryStatusList").innerHTML = [
    ["Solicitado", `${requested} trabajos solicitados por doctores.`],
    ["En proceso", `${active} trabajos activos.`],
    ["Entregado", `${delivered} trabajos entregados al doctor.`],
    ["Vencimiento", `${dueSoon} trabajos requieren seguimiento por fecha prometida.`],
    ["Facturado", `${invoiced} trabajos facturados al doctor.`]
  ].map(([label, detail]) => `
    <article class="alert-item">
      <span class="status-pill ${laboratoryStatusClass(label)}">${label}</span>
      <div><strong>${detail}</strong><p>Solicitudes generadas desde Autoservicio.</p></div>
    </article>
  `).join("");

  document.getElementById("laboratoryRequestList").innerHTML = labRequests.length
    ? labRequests.map(laboratoryRequestTemplate).join("")
    : emptyState("No hay trabajos de laboratorio registrados.");

  document.getElementById("laboratoryProfitabilityList").innerHTML = profitability.length
    ? profitability.map((item) => `
      <article class="clinical-item">
        <span class="amount-pill">${currency.format(item.profit)}</span>
        <div>
          <strong>${escapeHtml(item.doctor)}</strong>
          <p>Facturado ${currency.format(item.revenue)} · Costo ${currency.format(item.cost)} · ${item.count} trabajo(s)</p>
        </div>
      </article>
    `).join("")
    : emptyState("No hay trabajos facturados para calcular rentabilidad.");

  document.querySelectorAll("[data-lab-status]").forEach((select) => {
    select.addEventListener("change", () => {
      if (!can("laboratory:manage")) return;
      const request = state.selfServiceRequests.find((item) => item.id === select.dataset.labStatus);
      if (!request) return;
      const previousStatus = request.status;
      request.status = select.value;
      if (select.value === "Entregado" && !request.deliveredAt) request.deliveredAt = todayIso;
      request.updatedAt = new Date().toISOString();
      request.updatedBy = currentUser?.id || "sin-usuario";
      logAudit("laboratory:status", `Cambió laboratorio ${request.piece || "pieza"} de ${previousStatus} a ${request.status}`, request.createdBy);
      persistAndRender();
    });
  });
  document.querySelectorAll("[data-lab-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!can("laboratory:manage")) return;
      await saveLaboratoryRequestDetails(form.dataset.labForm, form);
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
  const attachments = request.attachments || [];
  const canInvoice = ["Terminado", "Entregado"].includes(request.status) && request.patientId && !request.invoiceId;
  const revenue = Number(request.amount || 0);
  const cost = Number(request.labCost || 0);
  const profit = revenue - cost;
  return `
    <article class="ledger-item lab-request-item">
      <span class="status-pill ${laboratoryStatusClass(request.status)}">${escapeHtml(request.status)}</span>
      <div>
        <strong>${escapeHtml(request.piece || "Pieza sin especificar")}</strong>
        <p>${patient ? `Paciente: ${escapeHtml(patient.name)} · ` : ""}${escapeHtml(request.detail || "Sin detalles")}</p>
        <p>Laboratorio: ${escapeHtml(request.labProvider || "Sin laboratorio")} · Costo ${currency.format(cost)} · Precio ${currency.format(revenue)} · Margen ${currency.format(profit)}</p>
        <p>Prometida: ${request.promisedAt ? formatDate(request.promisedAt) : "Sin fecha"} · Entrega: ${request.deliveredAt ? formatDate(request.deliveredAt) : "Pendiente"}</p>
        <small>Solicitado por ${escapeHtml(userById(request.createdBy).name)} · ${formatDateTime(request.createdAt)}</small>
        ${request.labInstructions ? `<p>Instrucciones/diseño: ${escapeHtml(request.labInstructions)}</p>` : ""}
        ${request.labNote ? `<p>Nota laboratorio: ${escapeHtml(request.labNote)}</p>` : ""}
        ${attachments.length ? `<div class="lab-attachments">${attachments.map((file) => `<a class="ghost-link" href="${file.file}" target="_blank" rel="noopener">${escapeHtml(file.fileName || file.type || "Adjunto")}</a>`).join("")}</div>` : ""}
        <form class="inline-form lab-detail-form ${can("laboratory:manage") ? "" : "permission-hidden"}" data-lab-form="${request.id}">
          <input name="promisedAt" type="date" value="${escapeHtml(request.promisedAt || "")}" aria-label="Fecha prometida">
          <input name="deliveredAt" type="date" value="${escapeHtml(request.deliveredAt || "")}" aria-label="Fecha entregada">
          <input name="labProvider" value="${escapeHtml(request.labProvider || "")}" placeholder="Laboratorio/proveedor">
          <input name="labCost" type="number" min="0" step="100" value="${Number(request.labCost || 0)}" placeholder="Costo laboratorio">
          <input name="amount" type="number" min="0" step="100" value="${Number(request.amount || 0)}" placeholder="Precio a facturar">
          <input name="instructions" value="${escapeHtml(request.labInstructions || "")}" placeholder="Diseño o instrucciones de pieza">
          <input name="note" value="${escapeHtml(request.labNote || "")}" placeholder="Nota laboratorio">
          <input name="attachment" type="file" accept="image/*,.pdf,.stl,.obj,.zip,.doc,.docx">
          <button class="ghost-button" type="submit">Guardar trabajo</button>
        </form>
      </div>
      <select data-lab-status="${request.id}" ${can("laboratory:manage") ? "" : "disabled"}>
        ${laboratoryStatuses().map((status) => `<option ${status === request.status ? "selected" : ""}>${status}</option>`).join("")}
      </select>
      <button class="ghost-button ${canInvoice ? "" : "permission-hidden"}" data-lab-invoice="${request.id}" type="button">Facturar al doctor</button>
    </article>
  `;
}

function laboratoryStatuses() {
  return ["Solicitado", "Recibido", "En proceso", "Terminado", "Entregado", "Facturado", "Cancelado"];
}

function normalizeLaboratoryStatus(status) {
  const normalized = normalizeText(status);
  if (normalized === "pendiente") return "Solicitado";
  if (normalized === "recibida") return "Recibido";
  if (normalized === "terminada" || normalized === "completada") return "Terminado";
  if (normalized === "entregada") return "Entregado";
  if (normalized === "facturada") return "Facturado";
  if (normalized === "cancelada") return "Cancelado";
  return laboratoryStatuses().includes(status) ? status : "Solicitado";
}

function laboratoryStatusClass(status) {
  if (["Terminado", "Entregado", "Facturado"].includes(status)) return "confirmada";
  if (status === "Cancelado") return "cancelada";
  return "pendiente";
}

function laboratoryProfitabilityByDoctor(labRequests = []) {
  const summary = {};
  labRequests
    .filter((request) => request.invoiceId || request.status === "Facturado")
    .forEach((request) => {
      const doctorId = request.createdBy || "sin-doctor";
      const payment = state.payments.find((item) => item.id === request.invoiceId);
      const revenue = Number(payment?.amount ?? request.amount ?? 0);
      const cost = Number(payment?.laboratoryCost ?? request.labCost ?? 0);
      summary[doctorId] ||= {
        doctor: userById(doctorId).name,
        revenue: 0,
        cost: 0,
        profit: 0,
        count: 0
      };
      summary[doctorId].revenue += revenue;
      summary[doctorId].cost += cost;
      summary[doctorId].profit += revenue - cost;
      summary[doctorId].count += 1;
    });
  return Object.values(summary).sort((a, b) => b.profit - a.profit);
}

async function saveLaboratoryRequestDetails(requestId, form) {
  const request = state.selfServiceRequests.find((item) => item.id === requestId);
  if (!request) return;
  const formData = new FormData(form);
  request.promisedAt = formData.get("promisedAt") || "";
  request.deliveredAt = formData.get("deliveredAt") || "";
  request.amount = Number(formData.get("amount")) || 0;
  request.labCost = Number(formData.get("labCost")) || 0;
  request.labProvider = String(formData.get("labProvider") || "");
  request.labInstructions = String(formData.get("instructions") || "");
  request.labNote = String(formData.get("note") || "");
  const file = form.querySelector('input[name="attachment"]')?.files?.[0];
  if (file) {
    request.attachments ||= [];
    request.attachments.unshift({
      id: makeId(),
      fileName: file.name,
      file: await readFileAsDataUrl(file),
      type: file.type || "archivo",
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "laboratorio"
    });
  }
  if (request.deliveredAt && ["Terminado"].includes(request.status)) {
    request.status = "Entregado";
  }
  request.updatedAt = new Date().toISOString();
  request.updatedBy = currentUser?.id || "laboratorio";
  persistAndRender();
}

function createLaboratoryInvoice(requestId) {
  const request = state.selfServiceRequests.find((item) => item.id === requestId);
  if (!request || !["Terminado", "Entregado"].includes(request.status) || request.invoiceId) return;
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
  const invoiceType = "Comprobante Fiscal";
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
    amountReceived: 0,
    discount: 0,
    discountReason: "",
    method: "Laboratorio",
    reference: request.id,
    receiptNumber,
    invoiceNumber,
    ncf: nextNcf(invoiceType),
    invoiceType,
    documentKind: "Factura",
    invoiceStatus: "Emitida",
    paymentHistory: [],
    creditNotes: [],
    date: todayIso,
    createdAt: new Date().toISOString(),
    concept: `Laboratorio: ${request.piece || "pieza dental"}`,
    type: "Laboratorio",
    laboratoryRequestId: request.id,
    laboratoryPiece: request.piece || "",
    laboratoryDeliveredAt: request.deliveredAt || "",
    laboratoryPatientName: patient?.name || "",
    laboratoryCost: Number(request.labCost || 0),
    laboratoryProvider: request.labProvider || "",
    laboratoryProfit: amount - Number(request.labCost || 0)
  };
  state.payments.unshift(payment);
  request.invoiceId = payment.id;
  request.invoiceNumber = invoiceNumber;
  request.amount = amount;
  request.status = "Facturado";
  request.profit = amount - Number(request.labCost || 0);
  request.invoicedAt = new Date().toISOString();
  request.invoicedBy = currentUser?.id || "laboratorio";
  request.updatedAt = new Date().toISOString();
  request.updatedBy = currentUser?.id || "laboratorio";
  logAudit("laboratory:invoice", `Facturó laboratorio ${invoiceNumber} al doctor ${userById(doctorId).name}`, doctorId);
  persistAndRender();
}

function renderHrControls() {
  const attendanceMonth = document.getElementById("attendanceMonthFilter")?.value || currentPayrollPeriod();
  const monthlyAttendance = (state.hrAttendance || []).filter((item) => item.date?.startsWith(attendanceMonth));
  document.getElementById("attendanceMonthlySummary").innerHTML = [
    ["Registros", monthlyAttendance.length],
    ["Presentes", monthlyAttendance.filter((item) => item.status === "Presente").length],
    ["Tardanzas", monthlyAttendance.filter((item) => item.status === "Tarde").length],
    ["Ausencias", monthlyAttendance.filter((item) => item.status === "Ausente").length]
  ].map(panelCardTemplate).join("");

  document.getElementById("attendanceTable").innerHTML = monthlyAttendance.length
    ? monthlyAttendance.slice(0, 31).map((item) => `
      <tr>
        <td>${escapeHtml(userById(item.userId).name)}</td>
        <td>${formatDate(item.date)}</td>
        <td><span class="status-pill ${hrStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.timeIn || "Sin entrada")}</td>
        <td>${escapeHtml(item.timeOut || "Sin salida")}</td>
        <td>${escapeHtml(attendanceHours(item))}</td>
        <td>${escapeHtml(item.note || "Sin nota")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7">${emptyState("Sin asistencia registrada.")}</td></tr>`;

  document.getElementById("vacationTable").innerHTML = state.hrVacations.length
    ? state.hrVacations.slice(0, 10).map((item) => `
      <tr>
        <td>${escapeHtml(userById(item.userId).name)}</td>
        <td>${escapeHtml(item.type || "Vacaciones")}</td>
        <td>${formatDate(item.start)}</td>
        <td>${formatDate(item.end)}</td>
        <td><span class="status-pill ${hrStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${item.approvedBy ? `${escapeHtml(userById(item.approvedBy).name)} · ${formatDateTime(item.approvedAt)}` : "Pendiente"}</td>
        <td>${escapeHtml(item.note || "Sin comentario")}</td>
        <td>
          <div class="table-actions">
            <button class="ghost-button" data-approve-vacation="${item.id}" ${item.status === "Aprobada" ? "disabled" : ""} type="button">Aprobar</button>
            <button class="ghost-button danger" data-reject-vacation="${item.id}" ${item.status === "Rechazada" ? "disabled" : ""} type="button">Rechazar</button>
          </div>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="8">${emptyState("Sin solicitudes de vacaciones.")}</td></tr>`;

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
        <td><span class="status-pill ${credentialExpiryStatus(item).className}">${escapeHtml(credentialExpiryStatus(item).label)}</span></td>
        <td>${escapeHtml(item.note || "Sin observación")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7">${emptyState("Sin evaluaciones registradas.")}</td></tr>`;
}

function hrStatusClass(status) {
  return {
    Pendiente: "pendiente",
    Presente: "confirmada",
    Aprobado: "confirmada",
    Aprobada: "confirmada",
    Completada: "confirmada",
    Pagado: "pagado",
    Pagada: "pagado",
    Procesada: "confirmada",
    Procesado: "confirmada",
    Tarde: "pendiente",
    Solicitada: "pendiente",
    "En seguimiento": "pendiente",
    Ausente: "cancelada",
    Rechazado: "cancelada",
    Rechazada: "cancelada",
    "Requiere mejora": "cancelada",
    "Credencial vencida": "cancelada"
  }[status] || "pendiente";
}

function credentialExpiryStatus(item) {
  if (!item?.credentialExpiresAt) return { label: "Sin vencimiento", className: hrStatusClass(item?.status) };
  const days = Math.ceil((new Date(`${item.credentialExpiresAt}T12:00:00`) - new Date(`${todayIso}T12:00:00`)) / 86400000);
  if (days < 0) return { label: "Vencida", className: "cancelada" };
  if (days <= 30) return { label: `Vence en ${days} días`, className: "pendiente" };
  return { label: `Vigente hasta ${formatDate(item.credentialExpiresAt)}`, className: "confirmada" };
}

function updateVacationStatus(vacationId, status) {
  if (!can("payroll:manage")) return;
  const vacation = state.hrVacations.find((item) => item.id === vacationId);
  if (!vacation) return;
  vacation.status = status;
  vacation.approvedBy = currentUser?.id || "sin-usuario";
  vacation.approvedAt = new Date().toISOString();
  vacation.updatedAt = new Date().toISOString();
  persistAndRender();
}

function printPayrollReceipt(userId) {
  const item = normalizedPayroll().map(payrollDisplayItem).find((payroll) => payroll.userId === userId);
  if (!item) return;
  const user = userById(userId);
  const net = payrollNet(item);
  const receipt = `
    <section class="payroll-receipt">
      <h2>Comprobante individual de nómina</h2>
      <p><strong>${escapeHtml(user.name)}</strong> · ${escapeHtml(user.role || "Sin rol")}</p>
      <p>Período: ${escapeHtml(formatPayrollPeriod(item.period))}</p>
      <hr>
      <p>Salario base: ${currency.format(item.base || 0)}</p>
      <p>Bonos/comisiones: ${currency.format(item.bonus || 0)}</p>
      <p>Deducciones: ${currency.format(item.deductions || 0)}</p>
      <p>Novedades: ${item.novelty?.count || 0}</p>
      ${user.role === "Doctor" ? `<p>Puntos: ${item.commission?.points || 0} · Procedimientos: ${item.commission?.procedures || 0}</p>` : ""}
      <h3>Neto a pagar: ${currency.format(net)}</h3>
      <p>Estado: ${escapeHtml(item.status || "Pendiente")}</p>
      <p>Generado por ${escapeHtml(currentUser?.name || userById(currentUser?.id).name)} · ${formatDateTime(new Date().toISOString())}</p>
    </section>
  `;
  const printWindow = window.open("", "_blank", "width=420,height=700");
  if (!printWindow) {
    alert("Permita ventanas emergentes para imprimir el comprobante.");
    return;
  }
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Comprobante de nómina</title>
        <link rel="stylesheet" href="styles.css">
        <style>
          body { margin: 0; padding: 24px; background: #fff; color: #13261f; font-family: Inter, Segoe UI, Arial, sans-serif; }
          .payroll-receipt { max-width: 360px; margin: auto; }
          .payroll-receipt h2 { margin: 0 0 12px; }
          .payroll-receipt p { margin: 6px 0; }
          .payroll-receipt h3 { margin-top: 18px; font-size: 20px; }
        </style>
      </head>
      <body>${receipt}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
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

  const periodNovelties = (state.payrollNovelties || []).filter((novelty) => (novelty.period || period) === period);
  document.getElementById("payrollNoveltyTable").innerHTML = periodNovelties.length
    ? periodNovelties.map((novelty) => `
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
        <td><span class="status-pill ${hrStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td><button class="ghost-button" data-payroll-receipt="${item.userId}" type="button">Comprobante</button></td>
      </tr>
    `;
  }).join("");
}

function renderPayroll(payrollItems) {
  const period = selectedPayrollPeriod();
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
    ["Pagados", `${paidCount}/${payrollItems.length}`],
    ["Período", formatPayrollPeriod(period)]
  ].map(panelCardTemplate).join("");

  document.getElementById("payrollNoveltyTable").innerHTML = (state.payrollNovelties || []).length
    ? state.payrollNovelties.map((novelty) => `
      <tr>
        <td>${escapeHtml(userById(novelty.userId).name)}</td>
        <td><span class="status-pill ${["Ingreso", "Ajuste"].includes(novelty.type) ? "confirmada" : "pendiente"}">${escapeHtml(novelty.type)}</span></td>
        <td>${currency.format(Number(novelty.amount) || 0)}</td>
        <td>${escapeHtml(novelty.note)}</td>
        <td>${escapeHtml(formatPayrollPeriod(novelty.period || period))}</td>
        <td>${formatDate(novelty.date)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="6">${emptyState("No hay novedades aplicadas para este período.")}</td></tr>`;

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
        <td><span class="status-pill ${hrStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
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
        <td><span class="status-pill ${hrStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td><button class="ghost-button" data-payroll-receipt="${item.userId}" type="button">Comprobante</button></td>
      </tr>
    `;
  }).join("");

  renderPayrollRuns();
}

function payrollDisplayItem(item) {
  const user = userById(item.userId);
  const period = selectedPayrollPeriod();
  const novelty = payrollNoveltyImpact(item.userId, period);
  if (user.role !== "Doctor") {
    return {
      ...item,
      period,
      bonus: item.bonus + novelty.income,
      deductions: item.deductions + novelty.deduction,
      novelty
    };
  }

  const commission = doctorCommission(item.userId);
  return {
    ...item,
    period,
    base: 0,
    bonus: commission.amount + novelty.income,
    deductions: novelty.deduction,
    commission,
    novelty
  };
}

function normalizedPayroll() {
  state.payroll ||= [];
  const period = selectedPayrollPeriod();
  users.forEach((user) => {
    if (!state.payroll.some((item) => item.userId === user.id)) {
      state.payroll.push({
        id: makeId(),
        userId: user.id,
        period,
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

function payrollNoveltyImpact(userId, period = selectedPayrollPeriod()) {
  return (state.payrollNovelties || [])
    .filter((novelty) => novelty.userId === userId && (novelty.period || period) === period)
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

function currentPayrollPeriod() {
  return todayIso.slice(0, 7);
}

function selectedPayrollPeriod() {
  return document.getElementById("payrollPeriod")?.value || currentPayrollPeriod();
}

function formatPayrollPeriod(period) {
  if (!period) return formatPayrollPeriod(currentPayrollPeriod());
  const [year, month] = String(period).split("-");
  if (!year || !month) return period;
  return new Intl.DateTimeFormat("es-DO", { month: "long", year: "numeric" }).format(new Date(`${year}-${month}-01T12:00:00`));
}

function payrollRunSummaryForPeriod(period = selectedPayrollPeriod()) {
  const items = normalizedPayroll().map(payrollDisplayItem);
  const adminItems = items.filter((item) => userById(item.userId).role !== "Doctor");
  const doctorItems = items.filter((item) => userById(item.userId).role === "Doctor");
  const noveltyItems = (state.payrollNovelties || []).filter((item) => (item.period || period) === period);
  const noveltyIncome = noveltyItems
    .filter((item) => ["Ingreso", "Ajuste"].includes(item.type))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const noveltyDeductions = noveltyItems
    .filter((item) => !["Ingreso", "Ajuste"].includes(item.type))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const administrativeTotal = adminItems.reduce((sum, item) => sum + payrollNet(item), 0);
  const doctorTotal = doctorItems.reduce((sum, item) => sum + payrollNet(item), 0);
  return {
    id: makeId(),
    period,
    administrativeTotal,
    doctorTotal,
    noveltyIncome,
    noveltyDeductions,
    total: administrativeTotal + doctorTotal,
    employees: items.length,
    doctorPoints: doctorItems.reduce((sum, item) => sum + (item.commission?.points || 0), 0)
  };
}

function renderPayrollRuns() {
  const table = document.getElementById("payrollRunTable");
  if (!table) return;
  const runs = state.payrollRuns || [];
  table.innerHTML = runs.length
    ? runs.map((run) => `
      <tr>
        <td><strong>${escapeHtml(formatPayrollPeriod(run.period))}</strong></td>
        <td>${currency.format(Number(run.administrativeTotal) || 0)}</td>
        <td>${currency.format(Number(run.doctorTotal) || 0)}</td>
        <td>${currency.format((Number(run.noveltyIncome) || 0) - (Number(run.noveltyDeductions) || 0))}</td>
        <td><strong>${currency.format(Number(run.total) || 0)}</strong></td>
        <td><span class="status-pill ${run.status === "Pagada" ? "pagado" : "pendiente"}">${escapeHtml(run.status || "Procesada")}</span></td>
        <td>${escapeHtml(userById(run.processedBy || run.paidBy).name)}${run.processedAt ? ` · ${formatDateTime(run.processedAt)}` : ""}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7">${emptyState("Aún no se ha procesado ninguna nómina mensual.")}</td></tr>`;
}

function attendanceHours(item) {
  if (!item.timeIn || !item.timeOut) return "Sin cálculo";
  const [inHour, inMinute] = item.timeIn.split(":").map(Number);
  const [outHour, outMinute] = item.timeOut.split(":").map(Number);
  const minutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
  if (!Number.isFinite(minutes) || minutes <= 0) return "Revisar";
  return `${(minutes / 60).toFixed(1)} h`;
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
          <span>${escapeHtml(user.specialty)} · ${escapeHtml(user.room)}</span>
        </div>
        <span class="compact-user-meta">
          <small class="status-pill ${user.role === "Doctor" ? "clinico" : "confirmada"}">${escapeHtml(user.role)}</small>
          <small>${permissionsForUser(user.id).views.filter((view) => panelViews.includes(view)).length} paneles</small>
        </span>
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
  const canEditPermissions = can("users:edit");
  const user = users.find((item) => item.id === targetUserId) || users[0];
  const userPermissions = permissionsForUser(user.id);
  const grouped = [...new Set(permissionCatalog.map((item) => item.panel))]
      .map((group) => {
        const items = permissionCatalog.filter((item) => item.panel === group);
        const activeCount = items.filter((item) => userPermissions.views.includes(item.view)).length;
        const status = permissionGroupStatus(activeCount, items.length);
        return `
          <div class="permission-panel-card">
            <div class="permission-card-head">
              <div>
                <strong>${escapeHtml(group)}</strong>
                <small>${activeCount}/${items.length} accesos activos</small>
              </div>
              <span class="permission-chip ${status.className}">${status.label}</span>
            </div>
            <div class="permission-card-body">
              ${items.map((item) => permissionViewToggleTemplate(item, user, userPermissions, canEditPermissions)).join("")}
            </div>
          </div>
        `;
      }).join("");
  const actionsGrouped = [...new Set(actionPermissionCatalog.map((item) => item.group))].map((group) => {
    const items = actionPermissionCatalog.filter((item) => item.group === group);
    const activeCount = items.filter((item) => permissionSetAllows(userPermissions.actions, item.action)).length;
    const status = permissionGroupStatus(activeCount, items.length);
    return `
      <div class="permission-panel-card permission-action-card">
        <div class="permission-card-head">
          <div>
            <strong>${escapeHtml(group)}</strong>
            <small>${activeCount}/${items.length} acciones permitidas</small>
          </div>
          <span class="permission-chip ${status.className}">${status.label}</span>
        </div>
        <div class="permission-card-body">
          ${items.map((item) => permissionActionToggleTemplate(item, user, userPermissions, canEditPermissions)).join("")}
        </div>
      </div>
    `;
  }).join("");
  const accessChip = userPermissions.scope === "all"
    ? `<span class="permission-chip full">Acceso completo</span>`
    : `<span class="permission-chip own">Solo propios</span>`;
  const scopeControl = `
    <div class="permission-scope">
      <label>
        Alcance de datos
        <select id="permissionScope" ${!canEditPermissions || user.id === "admin" ? "disabled" : ""}>
          <option value="all" ${userPermissions.scope === "all" ? "selected" : ""}>Todos los registros</option>
          <option value="own" ${userPermissions.scope === "own" ? "selected" : ""}>Solo registros propios</option>
        </select>
      </label>
      <small>${userPermissions.scope === "all" ? "Puede ver informacion global segun sus modulos." : "Solo ve informacion vinculada a su usuario cuando aplica."}</small>
    </div>
  `;
  const helpText = canEditPermissions
    ? user.id === "admin" ? "El Administrador conserva acceso completo." : "Activa solo los paneles y módulos que correspondan."
    : "Solo el Administrador puede modificar permisos.";

  const profileSelect = document.getElementById("userPermissionProfile");
  if (profileSelect) profileSelect.value = "";

  document.getElementById("permissionMatrix").innerHTML = `
    ${selectedUserSummary(user)}
    <article class="permission-user compact">
      <div>
        <span class="status-pill ${user.role === "Administrador" ? "confirmada" : "pendiente"}">${escapeHtml(user.role)}</span>
        <h2>Accesos</h2>
        <p>${helpText}</p>
        <div class="permission-chip-row">${accessChip}</div>
        ${scopeControl}
      </div>
      <div class="permission-groups">${grouped}</div>
    </article>
    <article class="permission-user compact">
      <div>
        <span class="status-pill pendiente">Acciones</span>
        <h2>Permisos especiales</h2>
        <p>Controla funciones internas aunque el modulo este visible.</p>
      </div>
      <div class="permission-groups">${actionsGrouped}</div>
    </article>
  `;

  document.querySelectorAll("[data-permission-user]").forEach((input) => {
    input.addEventListener("change", () => updateUserPermission(input));
  });
  document.querySelectorAll("[data-permission-action-user]").forEach((input) => {
    input.addEventListener("change", () => updateUserActionPermission(input));
  });
  document.getElementById("permissionScope")?.addEventListener("change", (event) => {
    updateUserPermissionScope(user.id, event.target.value);
  });
}

function permissionGroupStatus(activeCount, totalCount) {
  if (activeCount === 0) return { label: "Sin acceso", className: "none" };
  if (activeCount === totalCount) return { label: "Activo", className: "active" };
  return { label: "Parcial", className: "partial" };
}

function permissionViewToggleTemplate(item, user, userPermissions, canEditPermissions) {
  const enabled = userPermissions.views.includes(item.view);
  return `
    <label class="permission-toggle permission-card-toggle ${enabled ? "is-active" : ""}">
      <input
        type="checkbox"
        data-permission-user="${user.id}"
        data-permission-view="${item.view}"
        ${enabled ? "checked" : ""}
        ${!canEditPermissions || user.id === "admin" ? "disabled" : ""}
      >
      <span>${escapeHtml(item.label)}</span>
      <small class="permission-chip ${enabled ? "active" : "none"}">${enabled ? "Activo" : "Sin acceso"}</small>
    </label>
  `;
}

function permissionActionToggleTemplate(item, user, userPermissions, canEditPermissions) {
  const enabled = permissionSetAllows(userPermissions.actions, item.action);
  const unavailable = item.action.startsWith("selfservice:") && !allowedSelfServiceActionsForRole(user.role).includes(item.action);
  return `
    <label class="permission-toggle permission-card-toggle ${enabled ? "is-active" : ""} ${unavailable ? "permission-disabled" : ""}">
      <input
        type="checkbox"
        data-permission-action-user="${user.id}"
        data-permission-action="${item.action}"
        ${enabled ? "checked" : ""}
        ${!canEditPermissions || user.id === "admin" || unavailable ? "disabled" : ""}
      >
      <span>${escapeHtml(item.label)}</span>
      <small class="permission-chip ${enabled ? "active" : "none"}">${enabled ? "Activo" : "Sin acceso"}</small>
    </label>
  `;
}

function permissionSetAllows(actions, action) {
  return actions.includes(action) || actions.some((owned) => legacyActionAliases[owned]?.includes(action));
}

function updateUserPermission(input) {
  if (!can("users:edit")) return;
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
    actions: nextPermissions.actions,
    scope: nextPermissions.scope
  };
  saveUserPermissionOverrides();
  logAudit("permissions:view", `${input.checked ? "Habilitó" : "Deshabilitó"} módulo ${viewName} para ${userById(userId).name}`, userId);
  renderHrPanel();
  applyPermissions();
  render();
}

function updateUserActionPermission(input) {
  if (!can("users:edit")) return;
  const userId = input.dataset.permissionActionUser;
  if (userId === "admin") return;
  const user = users.find((item) => item.id === userId);
  const action = input.dataset.permissionAction;
  if (!user || !actionPermissionCatalog.some((item) => item.action === action)) return;
  if (action.startsWith("selfservice:") && !allowedSelfServiceActionsForRole(user.role).includes(action)) return;

  const nextPermissions = permissionsForUser(userId);
  nextPermissions.actions = input.checked
    ? [...new Set([...nextPermissions.actions, action])]
    : nextPermissions.actions.filter((item) => item !== action);

  userPermissionOverrides[userId] = {
    views: nextPermissions.views,
    actions: nextPermissions.actions,
    scope: nextPermissions.scope
  };
  saveUserPermissionOverrides();
  logAudit("permissions:action", `${input.checked ? "Habilitó" : "Deshabilitó"} acción ${action} para ${user.name}`, userId);
  applyPermissions();
  render();
}

function updateUserPermissionScope(userId, scope) {
  if (!can("users:edit") || userId === "admin") return;
  const nextPermissions = permissionsForUser(userId);
  userPermissionOverrides[userId] = {
    views: nextPermissions.views,
    actions: nextPermissions.actions,
    scope: scope === "own" ? "own" : "all"
  };
  saveUserPermissionOverrides();
  logAudit("permissions:scope", `Cambió alcance a ${scope} para ${userById(userId).name}`, userId);
  applyPermissions();
  render();
}

function applyPermissionProfile(userId, profileRole) {
  if (!profileRole || userId === "admin") return;
  const defaults = rolePermissions[profileRole];
  if (!defaults) return;
  userPermissionOverrides[userId] = {
    views: [...defaults.views],
    actions: sanitizeSelfServiceActions([...defaults.actions], users.find((item) => item.id === userId)?.role),
    scope: defaults.scope
  };
  saveUserPermissionOverrides();
  logAudit("permissions:profile", `Aplicó perfil ${profileRole} a ${userById(userId).name}`, userId);
  applyPermissions();
  render();
}

function resetPermissionProfile(userId) {
  if (userId === "admin") return;
  delete userPermissionOverrides[userId];
  saveUserPermissionOverrides();
  logAudit("permissions:reset", `Restableció permisos de ${userById(userId).name}`, userId);
  applyPermissions();
  render();
}

function renderAccountingPanel() {
  const billablePayments = activeBillingPayments();
  const collectedToday = paymentCollections(todayIso)
    .reduce((sum, collection) => sum + collection.amount, 0);
  const pendingTotal = billablePayments.reduce((sum, payment) => sum + invoiceBalance(payment), 0);
  const methodTotals = paymentMethodTotals();

  document.getElementById("accountingPanelCards").innerHTML = [
    ["Ingresos hoy", currency.format(collectedToday)],
    ["Cuentas por cobrar", currency.format(pendingTotal)],
    ["Recibos", billablePayments.length],
    ["Método principal", topPaymentMethod(methodTotals)]
  ].map(panelCardTemplate).join("");

  renderTaskFlow("cashTaskFlow", "cash", {
    cashOpen: Boolean(currentCashOpening()),
    pendingInvoices: billablePayments.filter((payment) => invoiceBalance(payment) > 0).length,
    collectedToday
  });

  renderPanelModules("accountingPanelModules", "accountingPanel");

  document.getElementById("accountingLedger").innerHTML = billablePayments.length
    ? billablePayments.slice(0, 5).map((payment) => `
      <article class="ledger-item">
        <span class="amount-pill">${currency.format(payment.amount)}</span>
        <div>
          <strong>${escapeHtml(payment.receiptNumber || "REC-S/N")} · ${escapeHtml(patientById(payment.patientId).name)}</strong>
          <p>${escapeHtml(payment.method)} · ${escapeHtml(payment.concept)} · ${formatDate(payment.date)}</p>
        </div>
      </article>
    `).join("")
    : emptyState("No hay recibos registrados.");

  const balances = billablePayments.filter((payment) => invoiceBalance(payment) > 0);
  document.getElementById("accountingBalances").innerHTML = balances.length
    ? balances.slice(0, 5).map((payment) => `
      <article class="alert-item">
        <span class="amount-pill">${currency.format(invoiceBalance(payment))}</span>
        <div><strong>${escapeHtml(patientById(payment.patientId).name)}</strong><p>${escapeHtml(payment.invoiceNumber || "FAC-S/N")} · ${invoiceAgeBucket(payment)}</p></div>
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

function hrMonthlyCardTemplate([label, valueText, detail, status]) {
  return `
    <article class="hr-month-card ${className(status)}">
      <span class="status-pill ${className(status)}">${label}</span>
      <strong>${valueText}</strong>
      <p>${detail}</p>
    </article>
  `;
}

function activateHrTab(tabName = "payroll") {
  activeHrTab = tabName;
  document.querySelectorAll("[data-hr-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.hrTab === tabName);
  });
  document.querySelectorAll("[data-hr-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.hrPanel === tabName);
  });
}

function cashFlowCardTemplate([label, valueText, detail, status = "neutral"]) {
  return `
    <article class="cash-flow-card ${status}">
      <span>${label}</span>
      <strong>${valueText}</strong>
      <p>${detail}</p>
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
  const term = normalizeText([document.getElementById("globalSearch").value, value("patientLocalSearch")].join(" "));
  const statusFilter = value("patientStatusFilter") || "all";
  const patients = state.patients.filter((patient) => {
    const haystack = patientSearchHaystack(patient);
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "debt" && patient.balance > 0)
      || (statusFilter === "alert" && hasMedicalAlert(patient))
      || (statusFilter === "minor" && patientIsMinor(patient));
    return haystack.includes(term) && matchesStatus;
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
              ${hasMedicalAlert(patient) ? `<span class="medical-alert-mini">Alerta médica</span>` : ""}
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
        <td>
          <span class="status-pill ${hasMedicalAlert(patient) ? "caries" : "sano"}">${escapeHtml(patient.allergies || "Ninguna")}</span>
          ${hasMedicalAlert(patient) ? `<small class="medical-alert-text">${escapeHtml(patientMedicalAlertText(patient))}</small>` : ""}
        </td>
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
            <button class="icon-action" data-record-patient="${patient.id}" type="button" title="Abrir ficha" aria-label="Abrir ficha">▣</button>
            <button class="icon-action" data-edit-patient="${patient.id}" type="button" title="Editar paciente" aria-label="Editar paciente">✎</button>
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
      appointment.status = "Llegó";
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
  const patientAttachments = (state.patientAttachments || [])
    .filter((attachment) => attachment.patientId === patientId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const patientConsents = (state.patientConsents || [])
    .filter((consent) => consent.patientId === patientId)
    .sort((a, b) => String(b.signedAt || b.createdAt).localeCompare(String(a.signedAt || a.createdAt)));
  const patientPlates = (state.patientPlates || [])
    .filter((plate) => plate.patientId === patientId)
    .sort((a, b) => String(b.takenAt).localeCompare(String(a.takenAt)));
  const patientDentalHistory = (state.odontogramHistory || [])
    .filter((item) => item.patientId === patientId)
    .slice(0, 8);
  const paidTotal = patientPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const treatmentTotal = patientTreatments.reduce((sum, treatment) => sum + treatment.cost, 0);
  const emergency = splitEmergencyContact(patient);
  const patientTimeline = patientTimelineItems({
    appointments: patientAppointments,
    treatments: patientTreatments,
    payments: patientPayments,
    plates: patientPlates,
    documents: patientDocuments,
    attachments: patientAttachments,
    consents: patientConsents
  });

  document.getElementById("patientRecordTitle").textContent = `${patient.name} · ${patient.code || ""}`;
  document.getElementById("patientRecordMeta").textContent = `${patient.documentType || "Documento"}: ${patientDocumentLabel(patient)} · ${patientAge(patient.birthdate)} · ${patient.phone}`;
  document.getElementById("patientRecordContent").innerHTML = patientRecordContent({
    patient,
    emergency,
    paidTotal,
    treatmentTotal,
    patientTimeline,
    upcomingAppointments,
    patientAppointments,
    patientTreatments,
    patientPayments,
    patientPlates,
    patientConsents,
    patientAttachments,
    patientDocuments,
    patientDentalHistory
  });
  bindPatientRecordTabs();
  bindPatientPlateForm(patient.id);
  bindPatientConsentForm(patient.id);
  bindPatientAttachmentForm(patient.id);
  document.getElementById("patientRecordDialog").showModal();
}

function closePatientRecord() {
  document.getElementById("patientRecordDialog").close();
}

function patientRecordContent({
  patient,
  emergency,
  paidTotal,
  treatmentTotal,
  patientTimeline,
  upcomingAppointments,
  patientAppointments,
  patientTreatments,
  patientPayments,
  patientPlates,
  patientConsents,
  patientAttachments,
  patientDocuments,
  patientDentalHistory
}) {
  return `
    <section class="patient-record-hero">
      <div class="patient-record-photo">${patientPhotoTemplate(patient)}</div>
      <div class="patient-record-identity">
        <div>
          <span class="status-pill confirmada">${escapeHtml(patient.code || "Paciente")}</span>
          <h2>${escapeHtml(patient.name)}</h2>
          <p>${escapeHtml(patientAge(patient.birthdate))} · ${escapeHtml(patient.gender || "No especificado")} · ${escapeHtml(patient.nationality || "Dominicano")}</p>
        </div>
        <div class="patient-record-badges">${patientRecordBadges(patient).join("")}</div>
      </div>
      <div class="patient-record-balance">
        <span>Balance pendiente</span>
        <strong>${currency.format(patient.balance || 0)}</strong>
        <small>Pagado ${currency.format(paidTotal)} de ${currency.format(treatmentTotal)}</small>
      </div>
    </section>
    <section class="patient-record-alert-strip">
      ${patientRecordAlertCards(patient, upcomingAppointments, patientPayments, patientTreatments).join("")}
    </section>
    <div class="patient-record-tabs" role="tablist">
      <button class="record-tab active" data-record-tab="personal" type="button">Datos personales</button>
      <button class="record-tab" data-record-tab="insurance" type="button">Seguro</button>
      <button class="record-tab" data-record-tab="emergency" type="button">Emergencia</button>
      <button class="record-tab" data-record-tab="alerts" type="button">Alertas médicas</button>
      <button class="record-tab" data-record-tab="history" type="button">Historial</button>
    </div>
    <div class="patient-record-tab-panels">
      <section class="record-tab-panel active" data-record-panel="personal">
        <div class="patient-record-grid">
          <section class="record-block"><h3>Datos personales</h3><p>Documento: <strong>${escapeHtml(patientDocumentLabel(patient))}</strong></p><p>Tipo: ${escapeHtml(patient.documentType || "No registrado")}</p><p>Teléfono: ${escapeHtml(patient.phone || "No registrado")}</p><p>Correo: ${escapeHtml(patient.email || "Sin correo")}</p><p>Dirección: ${escapeHtml(patient.address || "Sin dirección")}</p></section>
          <section class="record-block"><h3>Resumen financiero</h3><p>Tratamientos: <strong>${currency.format(treatmentTotal)}</strong></p><p>Pagado: <strong>${currency.format(paidTotal)}</strong></p><p>Balance: <strong>${currency.format(patient.balance)}</strong></p><p>Última visita: ${formatDate(patient.lastVisit)}</p></section>
        </div>
      </section>
      <section class="record-tab-panel" data-record-panel="insurance">
        <div class="patient-record-grid">
          <section class="record-block"><h3>Seguro del paciente</h3><p>Aseguradora: <strong>${escapeHtml(patient.insurance || "Sin seguro")}</strong></p><p>Tipo de sangre: ${escapeHtml(patient.bloodType || "No registrado")}</p><p>Estado: ${escapeHtml(patient.status || "Activo")}</p></section>
          <section class="record-block"><h3>Identificación</h3><p>${patientIsMinor(patient) ? "Paciente menor de edad: documento no requerido." : `Documento registrado: ${escapeHtml(patient.document || "Sin documento")}`}</p><p>Nacionalidad: ${escapeHtml(patient.nationality || "Dominicano")}</p></section>
        </div>
      </section>
      <section class="record-tab-panel" data-record-panel="emergency">
        <div class="patient-record-grid">
          <section class="record-block"><h3>Contacto de emergencia</h3><p>Nombre: <strong>${escapeHtml(emergency.name || "No registrado")}</strong></p><p>Teléfono: ${escapeHtml(emergency.phone || "Sin teléfono")}</p><p>Parentesco: ${escapeHtml(emergency.relation || "Sin parentesco")}</p></section>
          <section class="record-block"><h3>Contacto del paciente</h3><p>Teléfono principal: ${escapeHtml(patient.phone || "No registrado")}</p><p>Correo: ${escapeHtml(patient.email || "Sin correo")}</p><p>Dirección: ${escapeHtml(patient.address || "Sin dirección")}</p></section>
        </div>
      </section>
      <section class="record-tab-panel" data-record-panel="alerts">
        <div class="patient-record-grid">
          <section class="record-block"><h3>Alertas médicas</h3>${hasMedicalAlert(patient) ? `<div class="medical-alert-banner">${escapeHtml(patientMedicalAlertText(patient))}</div>` : `<p>Sin alertas médicas activas.</p>`}<p>Alergias: <strong>${escapeHtml(patient.allergies || "Ninguna")}</strong></p></section>
          <section class="record-block"><h3>Condiciones y medicamentos</h3><p>Condiciones: ${escapeHtml(patient.conditions || "Sin registro")}</p><p>Medicamentos: ${escapeHtml(patient.medications || "Sin registro")}</p><p>Historial clínico: ${escapeHtml(patient.clinicalHistory || patient.notes || "Sin historial registrado")}</p></section>
        </div>
      </section>
      <section class="record-tab-panel" data-record-panel="history">
        ${patientRecordSection("Histórico completo del paciente", patientTimeline, patientTimelineTemplate)}
        ${upcomingAppointmentsByDoctorSection(upcomingAppointments)}
        ${patientRecordSection("Citas", patientAppointments, appointmentRecordTemplate)}
        ${patientRecordSection("Tratamientos", patientTreatments, treatmentRecordTemplate)}
        ${patientRecordSection("Pagos y facturas", patientPayments, paymentRecordTemplate)}
        ${patientPlatesSection(patient.id, patientPlates)}
        ${patientConsentsSection(patient.id, patientConsents)}
        ${patientAttachmentsSection(patient.id, patientAttachments)}
        ${patientRecordSection("Documentos clínicos", patientDocuments, documentRecordTemplate)}
        ${patientRecordSection("Historial odontograma", patientDentalHistory, dentalHistoryRecordTemplate)}
      </section>
    </div>
  `;
}

function patientRecordAlertCards(patient, upcomingAppointments, patientPayments, patientTreatments) {
  const activeAlerts = clinicalAlertBadges(patient);
  const openBalance = patientPayments.reduce((sum, payment) => sum + invoiceBalance(payment), 0);
  const activeTreatments = patientTreatments.filter((treatment) => Number(treatment.progress || 0) < 100).length;
  return [
    {
      label: "Alertas médicas",
      detail: activeAlerts.length ? activeAlerts.join(" · ") : "Sin alertas activas",
      status: activeAlerts.length ? "Cancelada" : "Confirmada"
    },
    {
      label: "Próxima cita",
      detail: upcomingAppointments[0] ? `${formatDate(upcomingAppointments[0].date)} ${upcomingAppointments[0].time}` : "Sin cita próxima",
      status: upcomingAppointments.length ? "Pendiente" : "Confirmada"
    },
    {
      label: "Balance",
      detail: currency.format(openBalance || patient.balance || 0),
      status: (openBalance || patient.balance) > 0 ? "Pendiente" : "Confirmada"
    },
    {
      label: "Tratamientos",
      detail: `${activeTreatments} activos`,
      status: activeTreatments ? "Pendiente" : "Confirmada"
    }
  ].map((item) => `
    <article class="patient-record-alert-card ${className(item.status)}">
      <span class="status-pill ${className(item.status)}">${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.detail)}</strong>
    </article>
  `);
}

function patientRecordBadges(patient) {
  return [
    `<span class="record-badge ${hasMedicalAlert(patient) ? "alert" : "ok"}">Alergias: ${escapeHtml(patient.allergies || "Ninguna")}</span>`,
    `<span class="record-badge ${patientIsMinor(patient) ? "minor" : "ok"}">${patientIsMinor(patient) ? "Menor de edad" : "Adulto"}</span>`,
    `<span class="record-badge ${normalizeText(patient.insurance) === "sin seguro" || normalizeText(patient.insurance) === "privado" ? "neutral" : "ok"}">${escapeHtml(patient.insurance || "Sin seguro")}</span>`,
    `<span class="record-badge ${Number(patient.balance || 0) > 0 ? "debt" : "ok"}">${Number(patient.balance || 0) > 0 ? "Balance pendiente" : "Sin balance"}</span>`
  ];
}

function bindPatientRecordTabs() {
  document.querySelectorAll("[data-record-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-record-tab]").forEach((tab) => tab.classList.toggle("active", tab === button));
      document.querySelectorAll("[data-record-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.recordPanel === button.dataset.recordTab);
      });
    });
  });
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

function patientTimelineItems({ appointments, treatments, payments, plates, documents, attachments, consents }) {
  return [
    ...appointments.map((item) => ({
      date: `${item.date || todayIso}T${item.time || "12:00"}`,
      type: "Cita",
      title: item.type,
      detail: `${doctorById(item.doctorId).name} · ${item.status}`
    })),
    ...treatments.map((item) => ({
      date: `${item.start || todayIso}T12:00`,
      type: "Tratamiento",
      title: item.name,
      detail: `${item.status} · ${item.progress || 0}% · ${currency.format(item.cost || 0)}`
    })),
    ...payments.map((item) => ({
      date: item.createdAt || `${item.date || todayIso}T12:00`,
      type: "Factura",
      title: item.invoiceNumber || item.receiptNumber || "Movimiento",
      detail: `${item.concept} · ${currency.format(item.amount || 0)} · ${item.invoiceStatus || "Pagada"}`
    })),
    ...plates.map((item) => ({
      date: item.takenAt || item.createdAt,
      type: "Placa",
      title: item.type,
      detail: item.note || "Sin nota"
    })),
    ...documents.map((item) => ({
      date: item.createdAt || `${item.date || todayIso}T12:00`,
      type: item.type || "Documento",
      title: item.title,
      detail: item.note || "Sin nota"
    })),
    ...attachments.map((item) => ({
      date: item.createdAt,
      type: "Adjunto",
      title: item.type,
      detail: item.note || item.fileName || "Archivo"
    })),
    ...consents.map((item) => ({
      date: item.signedAt || item.createdAt,
      type: "Consentimiento",
      title: item.title,
      detail: item.fileName || "Archivo firmado"
    }))
  ]
    .filter((item) => item.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 12);
}

function patientTimelineTemplate(item) {
  return `
    <article class="clinical-item timeline-item">
      <span class="status-pill confirmada">${escapeHtml(item.type)}</span>
      <div>
        <strong>${escapeHtml(item.title || "Registro")}</strong>
        <p>${formatDateTime(item.date)} · ${escapeHtml(item.detail || "")}</p>
      </div>
    </article>
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

function patientConsentsSection(patientId, consents) {
  return `
    <section class="record-block full">
      <h3>Consentimientos firmados</h3>
      <form class="inline-form patient-file-form ${can("clinical-documents:create") ? "" : "permission-hidden"}" id="patientConsentForm" data-patient-id="${patientId}">
        <input id="patientConsentTitle" placeholder="Consentimiento informado" required>
        <input id="patientConsentSignedAt" type="datetime-local" required>
        <input id="patientConsentFile" type="file" accept="image/*,.pdf" required>
        <button class="primary-button" type="submit">Guardar consentimiento</button>
      </form>
      <div class="clinical-list">
        ${consents.length ? consents.map(patientConsentTemplate).join("") : emptyState("Sin consentimientos firmados.")}
      </div>
    </section>
  `;
}

function patientAttachmentsSection(patientId, attachments) {
  return `
    <section class="record-block full">
      <h3>Adjuntos del paciente</h3>
      <form class="inline-form patient-file-form ${can("clinical-documents:create") ? "" : "permission-hidden"}" id="patientAttachmentForm" data-patient-id="${patientId}">
        <select id="patientAttachmentType">
          <option>Cédula</option>
          <option>Seguro</option>
          <option>Receta</option>
          <option>Documento clínico</option>
          <option>Otro</option>
        </select>
        <input id="patientAttachmentNote" placeholder="Descripción del archivo">
        <input id="patientAttachmentFile" type="file" accept="image/*,.pdf,.doc,.docx" required>
        <button class="primary-button" type="submit">Cargar adjunto</button>
      </form>
      <div class="clinical-list">
        ${attachments.length ? attachments.map(patientAttachmentTemplate).join("") : emptyState("Sin adjuntos registrados.")}
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

function patientConsentTemplate(consent) {
  return `
    <article class="clinical-item">
      <span class="time-chip">${formatDateTime(consent.signedAt || consent.createdAt)}</span>
      <div>
        <strong>${escapeHtml(consent.title)}</strong>
        <p>Firmado y cargado por ${escapeHtml(userById(consent.createdBy).name)} · ${escapeHtml(consent.fileName || "Archivo")}</p>
        <a class="ghost-link" href="${consent.file}" target="_blank" rel="noopener">Ver consentimiento</a>
      </div>
    </article>
  `;
}

function patientAttachmentTemplate(attachment) {
  return `
    <article class="clinical-item">
      <span class="time-chip">${formatDateTime(attachment.createdAt)}</span>
      <div>
        <strong>${escapeHtml(attachment.type)}</strong>
        <p>${escapeHtml(attachment.note || "Sin descripción")} · ${escapeHtml(attachment.fileName || "Archivo")}</p>
        <small>Cargado por ${escapeHtml(userById(attachment.createdBy).name)}</small>
        <a class="ghost-link" href="${attachment.file}" target="_blank" rel="noopener">Ver adjunto</a>
      </div>
    </article>
  `;
}

function bindPatientConsentForm(patientId) {
  const form = document.getElementById("patientConsentForm");
  if (!form) return;
  document.getElementById("patientConsentSignedAt").value = localDateTimeValue();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!can("clinical-documents:create")) return;
    const fileInput = document.getElementById("patientConsentFile");
    const file = fileInput.files[0];
    if (!file) return;
    state.patientConsents ||= [];
    state.patientConsents.unshift({
      id: makeId(),
      patientId,
      title: value("patientConsentTitle"),
      signedAt: value("patientConsentSignedAt") || localDateTimeValue(),
      fileName: file.name,
      file: await readFileAsDataUrl(file),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "sin-usuario"
    });
    saveState();
    openPatientRecord(patientId);
  });
}

function bindPatientAttachmentForm(patientId) {
  const form = document.getElementById("patientAttachmentForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!can("clinical-documents:create")) return;
    const fileInput = document.getElementById("patientAttachmentFile");
    const file = fileInput.files[0];
    if (!file) return;
    state.patientAttachments ||= [];
    state.patientAttachments.unshift({
      id: makeId(),
      patientId,
      type: value("patientAttachmentType"),
      note: value("patientAttachmentNote"),
      fileName: file.name,
      file: await readFileAsDataUrl(file),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "sin-usuario"
    });
    saveState();
    openPatientRecord(patientId);
  });
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
      <span class="status-pill ${treatmentPhaseClass(treatment.phase || treatment.status)}">${treatment.progress}%</span>
      <div>
        <strong>${escapeHtml(treatment.name)}</strong>
        <p>${escapeHtml(doctorById(treatment.doctorId).name)} · ${currency.format(treatment.cost)} · ${escapeHtml(treatment.phase || treatment.status)} · ${treatment.consentSigned ? "Consentimiento firmado" : "Consentimiento pendiente"}</p>
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
  const doctorFilter = value("agendaDoctorFilter") || "all";
  const viewMode = value("agendaViewFilter") || "day";
  const statusFilter = value("agendaStatusFilter");
  const range = agendaRange(dateFilter, viewMode);
  const appointments = state.appointments
    .slice()
    .filter((appointment) => appointmentBelongsToCurrentDoctor(appointment))
    .filter((appointment) => doctorFilter === "all" || appointment.doctorId === doctorFilter)
    .filter((appointment) => appointment.date >= range.start && appointment.date <= range.end)
    .filter((appointment) => statusFilter === "Todas" || appointment.status === statusFilter)
    .sort(sortByDateTime)
  document.getElementById("calendarCaption").textContent = agendaCaption(range, viewMode);
  document.getElementById("agendaStatusLegend").innerHTML = agendaStatusLegendTemplate();
  renderDoctorAvailabilityPanel(dateFilter, doctorFilter);
  renderWaitlistSuggestions(dateFilter, doctorFilter);
  document.getElementById("monthCalendar").innerHTML = renderMonthCalendar(dateFilter, doctorFilter);
  document.getElementById("calendarDay").innerHTML = renderAgendaCalendar(appointments, dateFilter, viewMode, range);

  document.getElementById("scheduleBoard").innerHTML = appointments.length
    ? appointments.map((appointment) => `
      <article class="schedule-item">
        <span class="time-chip">${appointment.time} · ${appointment.duration || 30} min</span>
        <div>
          <strong>${escapeHtml(patientById(appointment.patientId).name)}</strong>
          <p>${escapeHtml(appointment.type)} · ${escapeHtml(doctorById(appointment.doctorId).name)}</p>
          <p>Fecha: ${formatDate(appointment.date)} · Recordatorio: ${escapeHtml(appointment.reminder || "Sin recordatorio")}</p>
          ${doctorAvailabilityBlocks(appointment.doctorId, appointment.date, appointment.time).map((block) => `<p class="agenda-warning">${escapeHtml(block)}</p>`).join("")}
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
    const card = select.closest(".schedule-item");
    if (card) card.classList.add("appointment-card", className(select.value));
    select.addEventListener("change", () => {
      if (!can("appointments:confirm")) return;
      const appointment = state.appointments.find((item) => item.id === select.dataset.statusAppointment);
      const previousStatus = appointment.status;
      appointment.status = select.value;
      appointment.updatedAt = new Date().toISOString();
      appointment.updatedBy = currentUser?.id || "sin-usuario";
      logAudit("appointments:status", `Cambió cita de ${patientById(appointment.patientId).name} de ${previousStatus} a ${appointment.status}`, appointment.patientId);
      persistAndRender();
    });
  });

  document.querySelectorAll("[data-edit-appointment]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("appointments:create")) return;
      openAppointmentForm(button.dataset.editAppointment);
    });
  });

  document.querySelectorAll("[data-fill-waitlist]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!can("appointments:create")) return;
      const waitlistAppointment = state.appointments.find((item) => item.id === button.dataset.fillWaitlist);
      const cancelledAppointment = state.appointments.find((item) => item.id === button.dataset.cancelledSlot);
      if (!waitlistAppointment || !cancelledAppointment) return;
      const blocks = doctorAvailabilityBlocks(cancelledAppointment.doctorId, cancelledAppointment.date, cancelledAppointment.time);
      if (blocks.length) {
        alert(`No se puede ocupar ese espacio:\n\n${blocks.join("\n")}`);
        return;
      }
      waitlistAppointment.doctorId = cancelledAppointment.doctorId;
      waitlistAppointment.date = cancelledAppointment.date;
      waitlistAppointment.time = cancelledAppointment.time;
      waitlistAppointment.duration = cancelledAppointment.duration || waitlistAppointment.duration || 30;
      waitlistAppointment.status = "Pendiente";
      waitlistAppointment.updatedAt = new Date().toISOString();
      waitlistAppointment.updatedBy = currentUser?.id || "sin-usuario";
      waitlistAppointment.movedFromWaitlistAt = new Date().toISOString();
      logAudit("appointments:waitlist", `Movió lista de espera a ${cancelledAppointment.date} ${cancelledAppointment.time}`, waitlistAppointment.patientId);
      persistAndRender();
    });
  });
}

function renderDoctorAvailabilityPanel(dateFilter, doctorFilter) {
  const container = document.getElementById("doctorAvailabilityPanel");
  if (!container) return;
  const visibleDoctors = doctorsForAgendaFilter(doctorFilter);
  if (!visibleDoctors.length) {
    container.innerHTML = emptyState("No hay doctores disponibles para este filtro.");
    return;
  }
  container.innerHTML = `
    <div class="availability-list">
      ${visibleDoctors.map((doctor) => {
        const blocks = doctorAvailabilityBlocks(doctor.id, dateFilter);
        const shifts = doctorShiftsForDate(doctor.id, dateFilter);
        const slots = availableDoctorSlots(doctor.id, dateFilter);
        const dayAppointments = state.appointments.filter((appointment) =>
          appointment.doctorId === doctor.id &&
          appointment.date === dateFilter &&
          appointment.status !== "Lista de espera" &&
          !appointmentIsCancelledSlot(appointment)
        );
        return `
          <article class="availability-card ${blocks.length ? "blocked" : "open"}">
            <div>
              <strong>${escapeHtml(doctor.name)}</strong>
              <p>${shifts.length ? shifts.map((shift) => `${escapeHtml(shift.name || "Turno")} ${shift.start}-${shift.end}`).join(" · ") : "Horario base 08:00-18:00"}</p>
              ${blocks.length ? blocks.map((block) => `<small class="agenda-warning">${escapeHtml(block)}</small>`).join("") : `<small>${dayAppointments.length} cita(s) programada(s)</small>`}
            </div>
            <div class="slot-chip-row">
              ${slots.length ? slots.slice(0, 5).map((slot) => `<span class="slot-chip">${slot}</span>`).join("") : `<span class="slot-chip muted">Sin espacios</span>`}
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function appointmentIsCancelledSlot(appointment) {
  const status = normalizeText(appointment.status);
  return status === "cancelada" || status === "no asistio";
}

function renderWaitlistSuggestions(dateFilter, doctorFilter) {
  const container = document.getElementById("waitlistSuggestions");
  if (!container) return;
  const cancelledSlots = state.appointments
    .filter((appointment) =>
      appointmentBelongsToCurrentDoctor(appointment) &&
      (doctorFilter === "all" || appointment.doctorId === doctorFilter) &&
      appointment.date === dateFilter &&
      appointmentIsCancelledSlot(appointment)
    )
    .sort(sortByDateTime);
  const waitlist = state.appointments
    .filter((appointment) =>
      appointmentBelongsToCurrentDoctor(appointment) &&
      appointment.status === "Lista de espera" &&
      (doctorFilter === "all" || appointment.doctorId === doctorFilter || !appointment.doctorId)
    )
    .sort(sortByDateTime);

  if (!cancelledSlots.length || !waitlist.length) {
    container.innerHTML = emptyState("No hay espacios cancelados o pacientes en espera para sugerir.");
    return;
  }

  container.innerHTML = `
    <div class="waitlist-suggestion-list">
      ${cancelledSlots.slice(0, 6).map((slot) => {
        const suggested = waitlist.find((appointment) => appointment.doctorId === slot.doctorId) || waitlist[0];
        const blocks = doctorAvailabilityBlocks(slot.doctorId, slot.date, slot.time);
        return `
          <article class="waitlist-suggestion">
            <div>
              <span class="time-chip">${slot.time} · ${doctorById(slot.doctorId).name}</span>
              <strong>${escapeHtml(patientById(suggested.patientId).name)}</strong>
              <p>Motivo: ${escapeHtml(suggested.type || "Cita")} · Espacio liberado por ${escapeHtml(patientById(slot.patientId).name)}</p>
              ${blocks.length ? blocks.map((block) => `<small class="agenda-warning">${escapeHtml(block)}</small>`).join("") : ""}
            </div>
            <button class="primary-button" data-fill-waitlist="${suggested.id}" data-cancelled-slot="${slot.id}" type="button" ${blocks.length ? "disabled" : ""}>Ocupar espacio</button>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function agendaRange(dateText, viewMode) {
  const selected = new Date(`${dateText}T12:00:00`);
  if (viewMode === "month") {
    const start = new Date(selected.getFullYear(), selected.getMonth(), 1);
    const end = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
    return { start: toDateInputValue(start), end: toDateInputValue(end) };
  }
  if (viewMode === "week") {
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: toDateInputValue(start), end: toDateInputValue(end) };
  }
  return { start: dateText, end: dateText };
}

function agendaCaption(range, viewMode) {
  if (viewMode === "day") return formatDate(range.start);
  if (viewMode === "week") return `Semana: ${formatDate(range.start)} - ${formatDate(range.end)}`;
  return `Mes: ${formatDate(range.start)} - ${formatDate(range.end)}`;
}

function renderAgendaCalendar(appointments, dateFilter, viewMode, range) {
  if (viewMode === "week") return renderWeekCalendar(appointments, range);
  if (viewMode === "month") return renderMonthAgendaSummary(appointments, range);
  return renderCalendarDay(appointments, dateFilter);
}

function agendaStatusLegendTemplate() {
  return ["Confirmada", "Pendiente", "Llegó", "Cancelada", "No asistió", "Atendida", "Lista de espera"]
    .map((status) => `<span class="agenda-legend-item ${className(status)}"><i></i>${escapeHtml(status)}</span>`)
    .join("");
}

function renderWeekCalendar(appointments, range) {
  const start = new Date(`${range.start}T12:00:00`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = toDateInputValue(date);
    const items = appointments.filter((appointment) => appointment.date === iso);
    const absences = doctors.filter((doctor) => appointmentBelongsToCurrentDoctor({ doctorId: doctor.id }) && doctorAbsenceForDate(doctor.id, iso));
    return `
      <article class="agenda-week-day ${iso === todayIso ? "today" : ""}">
        <strong>${formatDate(iso)}</strong>
        ${absences.length ? `<small class="agenda-warning">${absences.length} ausencia(s) de doctor</small>` : ""}
        <div class="clinical-list">
          ${items.length ? items.map(calendarAppointmentTemplate).join("") : `<small>Sin citas.</small>`}
        </div>
      </article>
    `;
  }).join("");
  return `<div class="agenda-week-grid">${days}</div>`;
}

function renderMonthAgendaSummary(appointments, range) {
  const start = new Date(`${range.start}T12:00:00`);
  const days = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const items = Array.from({ length: days }, (_, index) => {
    const iso = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
    const dayAppointments = appointments.filter((appointment) => appointment.date === iso);
    const waitlist = dayAppointments.filter((appointment) => appointment.status === "Lista de espera").length;
    const confirmed = dayAppointments.filter((appointment) => appointment.status === "Confirmada").length;
    const arrived = dayAppointments.filter((appointment) => appointment.status === "Llegó").length;
    const pending = dayAppointments.filter((appointment) => appointment.status === "Pendiente").length;
    const cancelled = dayAppointments.filter(appointmentIsCancelledSlot).length;
    return `
      <article class="agenda-month-summary ${dayAppointments.length ? "has-items" : ""}">
        <strong>${index + 1}</strong>
        <span>${dayAppointments.length} cita(s)</span>
        ${dayAppointments.length ? `<div class="agenda-month-dots"><i class="confirmada">${confirmed}</i><i class="llego">${arrived}</i><i class="pendiente">${pending}</i><i class="cancelada">${cancelled}</i></div>` : ""}
        ${waitlist ? `<small>${waitlist} en espera</small>` : ""}
      </article>
    `;
  }).join("");
  return `<div class="agenda-month-summary-grid">${items}</div>`;
}

function renderMonthCalendar(dateFilter, doctorFilter = "all") {
  const selected = new Date(`${dateFilter}T12:00:00`);
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDay }, () => `<span class="month-day muted"></span>`).join("");
  const dayCells = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const count = state.appointments.filter((appointment) =>
      appointment.date === iso &&
      !appointmentIsCancelledSlot(appointment) &&
      appointmentBelongsToCurrentDoctor(appointment) &&
      (doctorFilter === "all" || appointment.doctorId === doctorFilter)
    ).length;
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
      <div class="calendar-chip-time">
        <strong>${appointment.time}</strong>
        <small>${appointment.duration || 30} min</small>
      </div>
      <div>
        <span>${escapeHtml(patientById(appointment.patientId).name)}</span>
        <small>${escapeHtml(doctorById(appointment.doctorId).name)} · ${escapeHtml(appointment.type || "Cita")}</small>
      </div>
    </article>
  `;
}

function appointmentStatusOptions(currentStatus) {
  return ["Pendiente", "Confirmada", "Llegó", "Atendida", "No asistió", "Lista de espera", "Cancelada"]
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

  document.getElementById("toothSummary").innerHTML = odontogramStatuses()
    .map((status) => `
      <div class="summary-row">
        <span class="status-pill ${className(status)}">${labelStatus(status)}</span>
        <strong>${counts[status] || 0}</strong>
      </div>
    `)
    .join("");

  document.getElementById("odontogramLegend").innerHTML = odontogramLegendTemplate();
  renderSelectedToothPanel(patientId, chart);
  renderOdontogramHistory(patientId);
  renderOdontogramComparison(patientId, teeth);
  renderClinicalRecord(patientId);
  refreshSelectedToothHint();
}

function odontogramLegendTemplate() {
  return [
    ["sano", "Sano"],
    ["caries", "Caries"],
    ["restaurado", "Restaurado"],
    ["corona", "Corona"],
    ["implante", "Implante"],
    ["ausente", "Extraccion"]
  ]
    .map(([status, label]) => `
      <span class="odontogram-legend-item ${className(status)}">
        <i aria-hidden="true"></i>
        ${label}
      </span>
    `)
    .join("");
}

function renderSelectedToothPanel(patientId, chart) {
  const panel = document.getElementById("selectedToothPanel");
  if (!panel) return;

  if (!selectedTooth) {
    panel.innerHTML = emptyState("Selecciona un diente para ver su historial.");
    return;
  }

  const entry = chart[selectedTooth];
  const status = toothDisplayStatus(entry);
  const surfaces = entry && typeof entry === "object"
    ? Object.entries(entry.surfaces || {})
        .filter(([, surfaceStatus]) => surfaceStatus)
        .map(([surface, surfaceStatus]) => `
          <span>
            ${escapeHtml(surface)}
            <strong>${labelStatus(surfaceStatus)}</strong>
          </span>
        `)
        .join("")
    : "";
  const history = (state.odontogramHistory || [])
    .filter((item) => item.patientId === patientId && item.tooth === selectedTooth)
    .slice(0, 6);

  panel.innerHTML = `
    <div class="selected-tooth-panel-header">
      <div>
        <span>Pieza seleccionada</span>
        <strong>${escapeHtml(selectedTooth)}</strong>
      </div>
      <span class="status-pill ${className(status)}">${labelStatus(status)}</span>
    </div>
    <div class="selected-tooth-surfaces">
      ${surfaces || "<span>Pieza completa <strong>Sin superficies marcadas</strong></span>"}
    </div>
    <div class="selected-tooth-timeline">
      <strong>Historial de la pieza</strong>
      ${history.length ? history.map((item) => `
        <article>
          <span>${formatDate(item.date)}</span>
          <p>${escapeHtml(item.surface)} - ${labelStatus(item.status)} - ${escapeHtml(userById(item.userId).name)}</p>
        </article>
      `).join("") : "<p>Sin cambios registrados para esta pieza.</p>"}
    </div>
  `;
}

function renderOdontogramHistory(patientId) {
  const history = (state.odontogramHistory || [])
    .filter((item) => item.patientId === patientId)
    .slice(0, 6);
  const toothHistory = selectedTooth
    ? (state.odontogramHistory || [])
        .filter((item) => item.patientId === patientId && item.tooth === selectedTooth)
        .slice(0, 5)
    : [];
  document.getElementById("odontogramHistory").innerHTML = `
    <h3>Historial odontograma</h3>
    ${selectedTooth ? `
      <article class="clinical-item selected-tooth-history">
        <span class="time-chip">${escapeHtml(selectedTooth)}</span>
        <div>
          <strong>Historial de la pieza seleccionada</strong>
          ${toothHistory.length ? toothHistory.map((item) => `<p>${formatDate(item.date)} · ${escapeHtml(item.surface)} · ${labelStatus(item.status)}</p>`).join("") : `<p>Sin cambios para esta pieza.</p>`}
        </div>
      </article>
    ` : ""}
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

function renderOdontogramComparison(patientId, teeth) {
  const initial = state.initialOdontograms?.[patientId] || {};
  const current = state.odontograms?.[patientId] || {};
  const changesByDate = odontogramChangesByDate(patientId);
  const hasInitial = Object.keys(initial).length > 0;
  const changed = teeth.filter((tooth) => toothDisplayStatus(initial[tooth]) !== toothDisplayStatus(current[tooth]));
  const currentCounts = teeth.reduce((summary, tooth) => {
    const status = toothDisplayStatus(current[tooth]);
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});

  document.getElementById("odontogramComparison").innerHTML = `
    <div class="summary-row">
      <span class="status-pill ${hasInitial ? "confirmada" : "pendiente"}">Inicial</span>
      <strong>${hasInitial ? "Guardado" : "Pendiente"}</strong>
    </div>
    <div class="summary-row">
      <span class="status-pill restaurado">Cambios</span>
      <strong>${hasInitial ? changed.length : 0}</strong>
    </div>
    <div class="summary-row">
      <span class="status-pill caries">Caries actual</span>
      <strong>${currentCounts.caries || 0}</strong>
    </div>
    ${hasInitial && changed.length ? `
      <div class="odontogram-diff-list">
        ${changed.slice(0, 8).map((tooth) => `<small>Pieza ${tooth}: ${labelStatus(toothDisplayStatus(initial[tooth]))} -> ${labelStatus(toothDisplayStatus(current[tooth]))}</small>`).join("")}
      </div>
    ` : ""}
    ${changesByDate.length ? `
      <div class="odontogram-diff-list">
        <strong>Comparación por fecha</strong>
        ${changesByDate.slice(0, 5).map((item) => `<small>${formatDate(item.date)}: ${item.count} cambio(s) - piezas ${escapeHtml(item.teeth.join(", "))}</small>`).join("")}
      </div>
    ` : ""}
  `;
}

function odontogramChangesByDate(patientId) {
  const grouped = (state.odontogramHistory || [])
    .filter((item) => item.patientId === patientId)
    .reduce((summary, item) => {
      summary[item.date] ||= { date: item.date, count: 0, teeth: new Set() };
      summary[item.date].count += 1;
      summary[item.date].teeth.add(item.tooth);
      return summary;
    }, {});
  return Object.values(grouped)
    .map((item) => ({ ...item, teeth: [...item.teeth] }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function saveInitialOdontogram() {
  if (!can("odontogram:edit")) return;
  const patientId = value("odontogramPatient");
  if (!patientId) return;
  const current = state.odontograms?.[patientId] || {};
  if (state.initialOdontograms?.[patientId] && !confirm("Ya existe un odontograma inicial para este paciente. ¿Desea reemplazarlo?")) {
    return;
  }
  state.initialOdontograms ||= {};
  state.initialOdontograms[patientId] = {
    ...JSON.parse(JSON.stringify(current)),
    __savedAt: new Date().toISOString(),
    __savedBy: currentUser?.id || "sin-usuario"
  };
  state.odontogramHistory ||= [];
  state.odontogramHistory.unshift({
    id: makeId(),
    patientId,
    tooth: "Inicial",
    surface: "Odontograma completo",
    status: "registrado",
    date: todayIso,
    userId: currentUser?.id || "sin-usuario"
  });
  persistAndRender();
}

function printOdontogramSummary() {
  const section = document.getElementById("odontogram").cloneNode(true);
  section.querySelectorAll("form, button").forEach((item) => item.remove());
  const printWindow = window.open("", "_blank", "width=1100,height=800");
  if (!printWindow) {
    alert("Permita ventanas emergentes para imprimir el resumen del odontograma.");
    return;
  }
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Resumen odontograma</title>
        <link rel="stylesheet" href="styles.css">
        <style>
          @page { size: letter; margin: 14mm; }
          body { background: #fff; color: #10231d; font-family: Inter, Segoe UI, Arial, sans-serif; }
          .sidebar, .topbar, .toolbar-controls button, form { display: none !important; }
          .view { display: block !important; }
          .record-grid, .odontogram-layout { grid-template-columns: 1fr !important; }
          .dental-arch { min-width: 0 !important; }
        </style>
      </head>
      <body>${section.outerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

function selectTooth(tooth) {
  selectedTooth = String(tooth);
  syncToothControlsFromSelection();
  renderOdontogram();
}

function toothTemplate(tooth, status, arch, rawStatus) {
  const selected = selectedTooth === String(tooth) ? " selected" : "";
  const surfaceMarkers = typeof rawStatus === "object" && rawStatus?.surfaces
    ? Object.entries(rawStatus.surfaces).map(([surface, surfaceStatus]) => `<span class="surface-dot ${surface} ${className(surfaceStatus)}" title="${surface}: ${labelStatus(surfaceStatus)}"></span>`).join("")
    : "";
  return `
    <button class="tooth ${className(status)}${selected}" data-tooth="${tooth}" data-status="${className(status)}" title="Pieza ${tooth}: ${labelStatus(status)}" aria-label="Pieza ${tooth}, estado ${labelStatus(status)}">
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

function odontogramStatuses() {
  return ["sano", "caries", "restaurado", "ausente", "endodoncia", "implante", "corona"];
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
  const initialButton = document.getElementById("saveInitialOdontogram");
  if (!hint || !updateButton) return;

  const canUpdate = Boolean(selectedTooth && can("odontogram:edit"));
  updateButton.disabled = !canUpdate;
  if (initialButton) initialButton.disabled = !can("odontogram:edit");
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
  const patient = patientById(patientId);
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

  document.getElementById("diagnosisList").innerHTML = clinicalAlertPanelTemplate(patient) + (diagnoses.length
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
    : emptyState("Sin diagnósticos registrados."));

  document.getElementById("evolutionList").innerHTML = evolutions.length
    ? evolutions.map((evolution) => `
      <article class="clinical-item">
        <span class="time-chip">${formatDate(evolution.date)}</span>
        <div>
          <strong>${escapeHtml(userById(evolution.doctorId).name)}</strong>
          <p>${escapeHtml(evolution.note)}</p>
          <small>Firma: ${escapeHtml(evolution.signature || userById(evolution.doctorId).name)}</small>
        </div>
      </article>
    `).join("")
    : emptyState("Sin evolución registrada.");

  document.getElementById("recordTreatmentList").innerHTML = treatments.length
    ? treatments.map((treatment) => `
      <article class="clinical-treatment">
        <div>
          <strong>${escapeHtml(treatment.name)}</strong>
          <small>${escapeHtml(doctorById(treatment.doctorId).name)} · ${currency.format(treatment.cost)} · ${treatment.consentSigned ? "Consentimiento firmado" : "Consentimiento pendiente"}</small>
        </div>
        <div class="progress-track"><div class="progress-bar" style="width:${treatment.progress}%"></div></div>
        <span>${treatment.progress}% · ${escapeHtml(treatment.phase || treatment.status)}</span>
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

function treatmentPhases() {
  return ["Diagnóstico", "Pendiente de aprobación", "Aprobado", "En proceso", "Terminado", "Facturado"];
}

function treatmentProgressForPhase(phase) {
  return {
    "Diagnostico": 10,
    "Diagnóstico": 10,
    "Pendiente de aprobación": 20,
    Aprobado: 35,
    "En proceso": 70,
    Terminado: 100,
    Facturado: 100
  }[phase] ?? 0;
}

function treatmentStatusForPhase(phase) {
  if (phase === "Facturado") return "Facturado";
  return phase === "Terminado" ? "Completado" : phase;
}

function treatmentPhaseClass(phase) {
  return {
    "Diagnostico": "pendiente",
    "Diagnóstico": "pendiente",
    "Pendiente de aprobación": "pendiente",
    Aprobado: "confirmada",
    "En proceso": "restaurado",
    Terminado: "pagado",
    Facturado: "confirmada"
  }[phase] || "pendiente";
}

function createTreatmentConsentDocument(treatment) {
  state.clinicalDocuments ||= [];
  state.clinicalDocuments.unshift({
    id: makeId(),
    patientId: treatment.patientId,
    treatmentId: treatment.id,
    type: "Consentimiento informado",
    title: `Consentimiento - ${treatment.name}`,
    note: `Consentimiento digital firmado para el procedimiento ${treatment.name}. Doctor: ${doctorById(treatment.doctorId).name}.`,
    date: todayIso,
    createdAt: new Date().toISOString(),
    createdBy: currentUser?.id || "sin-usuario",
    signedAt: treatment.consentSignedAt,
    signedBy: treatment.consentSignedBy
  });
}

function renderTreatments() {
  document.getElementById("treatmentCards").innerHTML = state.treatments
    .filter((treatment) => treatmentBelongsToCurrentDoctor(treatment))
    .map((treatment) => `
      <article class="treatment-card">
        <div>
          <span class="status-pill ${treatmentPhaseClass(treatment.phase || treatment.status)}">${escapeHtml(treatment.phase || treatment.status)}</span>
          <h2>${escapeHtml(treatment.name)}</h2>
          <p>${escapeHtml(patientById(treatment.patientId).name)} · ${escapeHtml(doctorById(treatment.doctorId).name)} · ${currency.format(treatment.cost)}</p>
          <small>${treatment.consentSigned ? "Consentimiento firmado" : "Consentimiento pendiente"}</small>
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
      const phases = treatmentPhases();
      const currentIndex = Math.max(0, phases.indexOf(treatment.phase || "Diagnóstico"));
      const nextPhase = phases[Math.min(phases.length - 1, currentIndex + 1)];
      treatment.phase = nextPhase;
      treatment.progress = treatmentProgressForPhase(nextPhase);
      treatment.status = treatmentStatusForPhase(nextPhase);
      persistAndRender();
    });
  });
}

function billingTableRowTemplate(payment) {
  const balance = invoiceBalance(payment);
  const statusClass = payment.invoiceStatus === "Anulada"
    ? "cancelada"
    : payment.documentKind === "Cotización" || balance > 0
      ? "pendiente"
      : "confirmada";
  return `
    <tr>
      <td>
        <strong>${escapeHtml(payment.invoiceNumber || payment.receiptNumber || "FAC-S/N")}</strong>
        <small>${escapeHtml(payment.ncf || payment.receiptNumber || "Sin NCF")} · ${formatDate(payment.date)}</small>
      </td>
      <td>
        <strong>${escapeHtml(patientById(payment.patientId).name)}</strong>
        <small>${escapeHtml(paymentBillToLabel(payment))}</small>
      </td>
      <td>
        <span>${escapeHtml(payment.concept)}</span>
        <small>${escapeHtml(payment.type || "Servicio")}${payment.type === "Producto" ? ` · Cant. ${payment.quantity || 1}` : ""} · Dr. ${escapeHtml(paymentDoctorLabel(payment))}</small>
      </td>
      <td>${escapeHtml(payment.method || "Sin método")}</td>
      <td>${currency.format(invoiceNetAmount(payment))}</td>
      <td><strong>${currency.format(balance)}</strong></td>
      <td><span class="status-pill ${statusClass}">${escapeHtml(payment.documentKind || payment.invoiceStatus || "Pagada")}</span></td>
      <td>
        <div class="table-actions icon-actions">
          <button class="icon-action ${can("payments:print") ? "" : "permission-hidden"}" data-receipt="${payment.id}" type="button" title="Imprimir" aria-label="Imprimir">⎙</button>
          <button class="icon-action ${can("payments:print") ? "" : "permission-hidden"}" data-reprint="${payment.id}" type="button" title="Reimprimir" aria-label="Reimprimir">↻</button>
          <button class="icon-action ${can("payments:edit") ? "" : "permission-hidden"}" data-convert-quote="${payment.id}" type="button" title="Convertir cotización" aria-label="Convertir cotización" ${payment.documentKind === "Cotización" ? "" : "disabled"}>⇄</button>
          <button class="icon-action ${can("payments:edit") ? "" : "permission-hidden"}" data-add-payment="${payment.id}" type="button" title="Registrar abono" aria-label="Registrar abono" ${balance > 0 ? "" : "disabled"}>＋</button>
          <button class="icon-action ${can("payments:void") ? "" : "permission-hidden"}" data-credit-note="${payment.id}" type="button" title="Nota de crédito" aria-label="Nota de crédito" ${payment.documentKind === "Cotización" || payment.invoiceStatus === "Anulada" ? "disabled" : ""}>−</button>
          <button class="icon-action danger ${can("payments:void") ? "" : "permission-hidden"}" data-annul="${payment.id}" type="button" title="Anular" aria-label="Anular" ${payment.invoiceStatus === "Anulada" ? "disabled" : ""}>×</button>
        </div>
      </td>
    </tr>
  `;
}

function renderBilling() {
  const billablePayments = activeBillingPayments();
  const collectedToday = paymentCollections(todayIso)
    .reduce((sum, collection) => sum + collection.amount, 0);
  const discountsToday = billablePayments
    .filter((payment) => payment.date === todayIso)
    .reduce((sum, payment) => sum + (Number(payment.discount) || 0), 0);
  const productsToday = billablePayments
    .filter((payment) => payment.date === todayIso && payment.type === "Producto")
    .reduce((sum, payment) => sum + (Number(payment.quantity) || 1), 0);
  const pendingTotal = billablePayments.reduce((sum, payment) => sum + invoiceBalance(payment), 0);
  const methodTotals = paymentMethodTotals();

  document.getElementById("billingSummary").innerHTML = [
    ["Cobrado hoy", currency.format(collectedToday)],
    ["Descuentos hoy", currency.format(discountsToday)],
    ["Productos facturados", productsToday],
    ["Balance pendiente", currency.format(pendingTotal)],
    ["Facturas/recibos", billablePayments.length],
    ["Método principal", topPaymentMethod(methodTotals)]
  ].map(([label, valueText]) => `
    <article class="billing-card">
      <span>${label}</span>
      <strong>${valueText}</strong>
    </article>
  `).join("");

  renderReceivablesAgingReport();

  const billingTerm = normalizeText(value("billingSearch"));
  const billingStatus = value("billingStatusFilter") || "all";
  const visiblePayments = state.payments.filter((payment) => {
    const balance = invoiceBalance(payment);
    const haystack = normalizeText([
      payment.invoiceNumber,
      payment.receiptNumber,
      payment.ncf,
      payment.concept,
      payment.method,
      payment.invoiceStatus,
      payment.invoiceType,
      payment.documentKind,
      patientById(payment.patientId).name,
      paymentBillToLabel(payment),
      paymentDoctorLabel(payment),
      paymentCashierLabel(payment)
    ].join(" "));
    const matchesStatus = billingStatus === "all"
      || (billingStatus === "open" && balance > 0)
      || (billingStatus === "paid" && balance <= 0 && payment.invoiceStatus !== "Anulada" && payment.documentKind !== "Cotización")
      || (billingStatus === "void" && payment.invoiceStatus === "Anulada")
      || (billingStatus === "quote" && payment.documentKind === "Cotización");
    return haystack.includes(billingTerm) && matchesStatus;
  });

  document.getElementById("ledgerList").innerHTML = visiblePayments.length
    ? `
      <div class="table-panel compact-table-panel embedded-table">
        <table class="compact-data-table billing-table">
          <thead>
            <tr>
              <th>Factura</th>
              <th>Paciente / Facturado a</th>
              <th>Concepto</th>
              <th>Método</th>
              <th>Total</th>
              <th>Balance</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${visiblePayments.map(billingTableRowTemplate).join("")}
          </tbody>
        </table>
      </div>
    `
    : emptyState("No hay pagos registrados con esos filtros.");

  document.querySelectorAll("[data-receipt]").forEach((button) => {
    button.addEventListener("click", () => openReceipt(button.dataset.receipt));
  });
  document.querySelectorAll("[data-reprint]").forEach((button) => {
    button.addEventListener("click", () => reprintInvoice(button.dataset.reprint));
  });
  document.querySelectorAll("[data-annul]").forEach((button) => {
    button.addEventListener("click", () => annulInvoice(button.dataset.annul));
  });
  document.querySelectorAll("[data-convert-quote]").forEach((button) => {
    button.addEventListener("click", () => convertQuoteToInvoice(button.dataset.convertQuote));
  });
  document.querySelectorAll("[data-add-payment]").forEach((button) => {
    button.addEventListener("click", () => addInvoicePayment(button.dataset.addPayment));
  });
  document.querySelectorAll("[data-credit-note]").forEach((button) => {
    button.addEventListener("click", () => createCreditNote(button.dataset.creditNote));
  });

  const balances = billablePayments.filter((payment) => invoiceBalance(payment) > 0);
  document.getElementById("balanceList").innerHTML = balances.length
    ? balances
        .map((payment) => `
          <article class="alert-item">
            <span class="amount-pill">${currency.format(invoiceBalance(payment))}</span>
            <div>
              <strong>${escapeHtml(patientById(payment.patientId).name)}</strong>
              <p>${escapeHtml(payment.invoiceNumber || "FAC-S/N")} · ${invoiceAgeBucket(payment)} · Fecha: ${formatDate(payment.date)}</p>
            </div>
          </article>
        `)
        .join("")
    : emptyState("No hay balances pendientes.");

  const previewPayment = billablePayments[0];
  const posPreview = document.getElementById("posReceiptPreview");
  if (posPreview) {
    posPreview.innerHTML = previewPayment
      ? posInvoiceTicketTemplate(previewPayment, "RECIBO DE PAGO")
      : emptyState("No hay recibos para mostrar.");
  }

  renderCashClose();
}

function renderCashClose() {
  const totals = paymentMethodTotals(todayIso);
  const total = Object.values(totals).reduce((sum, amountValue) => sum + amountValue, 0);
  const opening = currentCashOpening();
  const lastClosing = (state.cashClosings || []).find((closing) => closing.date === todayIso);
  const openingAmount = opening?.openingAmount || lastClosing?.openingAmount || 0;
  const expectedTotal = openingAmount + total;
  const expectedCash = openingAmount + (totals.Efectivo || 0);
  const changeTotal = cashChangeTotal(todayIso);
  document.getElementById("cashCloseSummary").innerHTML = [
    ["Caja", opening ? "Abierta" : lastClosing ? "Cerrada" : "Sin abrir", opening ? "Lista para facturar y cobrar" : lastClosing ? "Cierre registrado hoy" : "Abra caja para iniciar cobros", opening ? "open" : lastClosing ? "closed" : "warning"],
    ["Total esperado", currency.format(expectedTotal), "Monto inicial + ventas del dia", "primary"],
    ["Efectivo esperado", currency.format(lastClosing?.expectedCash ?? expectedCash), "Apertura + cobros en efectivo", "primary"],
    ["Efectivo contado", lastClosing?.countedAmount !== undefined ? currency.format(lastClosing.countedAmount) : "Pendiente", lastClosing?.countedAmount !== undefined ? "Arqueo registrado" : "Digite el conteo antes de cerrar", lastClosing?.countedAmount !== undefined ? "open" : "warning"],
    ["Diferencia", lastClosing?.difference !== undefined ? currency.format(lastClosing.difference) : "Pendiente", lastClosing?.difference !== undefined ? "Contado - esperado" : "Se calcula al cerrar caja", lastClosing?.difference === 0 ? "open" : lastClosing?.difference !== undefined ? "danger" : "warning"],
    ["Devuelto", currency.format(changeTotal), "Cambio entregado en efectivo", "neutral"],
    ["Tarjeta", currency.format(totals.Tarjeta || 0), "Cobros por POS/POST", "neutral"],
    ["Transferencia", currency.format(totals.Transferencia || 0), "Cobros bancarios", "neutral"]
  ].map(cashFlowCardTemplate).join("");

  const closeButton = document.getElementById("closeCashRegister");
  const reopenButton = document.getElementById("reopenCashRegister");
  if (closeButton) closeButton.disabled = !opening;
  if (reopenButton) reopenButton.disabled = Boolean(opening) || !lastClosing;

  const detailContainer = document.getElementById("cashierMethodDetail");
  if (detailContainer) {
    detailContainer.innerHTML = `
      <div class="panel-header compact-header">
        <div>
          <h2>Detalle por cajero y método</h2>
          <p>Cobros aplicados al cierre del día.</p>
        </div>
      </div>
      <div class="cashier-method-grid">${cashCloseDetailTemplate(todayIso)}</div>
    `;
  }

  document.getElementById("cashCloseHistory").innerHTML = (state.cashClosings || []).length
    ? state.cashClosings.slice(0, 5).map((closing) => `
      <article class="ledger-item">
        <span class="amount-pill">${currency.format(closing.expectedTotal || closing.total)}</span>
        <div>
          <strong>Cierre ${formatDate(closing.date)}</strong>
          <p>Contado ${currency.format(closing.countedAmount ?? closing.expectedTotal ?? closing.total)} · Diferencia ${currency.format(closing.difference || 0)} · Estado: ${escapeHtml(closing.status || "Cerrada")}</p>
          <p>Abierta por ${escapeHtml(userById(closing.openedBy).name)} · Cerrada por ${escapeHtml(userById(closing.closedBy).name)}</p>
          ${closing.note ? `<p>Nota: ${escapeHtml(closing.note)}</p>` : ""}
          ${closing.reopenedAt ? `<p>Reabierta por ${escapeHtml(userById(closing.reopenedBy).name)} · ${formatDateTime(closing.reopenedAt)}</p>` : ""}
          <p>Apertura ${currency.format(closing.openingAmount || 0)} · Ventas ${currency.format(closing.total)} · Usuario: ${escapeHtml(userById(closing.closedBy).name)} · Efectivo ${currency.format(closing.totals.Efectivo || 0)} · Tarjeta ${currency.format(closing.totals.Tarjeta || 0)} · Transferencia ${currency.format(closing.totals.Transferencia || 0)}</p>
          ${closing.cashierMethodTotals ? `<p>${cashierMethodSummaryText(closing.cashierMethodTotals)}</p>` : ""}
        </div>
      </article>
    `).join("")
    : emptyState("No hay cierres de caja registrados.");
}

function renderReceivablesAgingReport() {
  const container = document.getElementById("receivablesAgingReport");
  if (!container) return;
  const buckets = {
    "0-30 días": 0,
    "31-60 días": 0,
    "61-90 días": 0,
    "Más de 90 días": 0
  };
  activeBillingPayments()
    .filter((payment) => invoiceBalance(payment) > 0)
    .forEach((payment) => {
      const bucket = invoiceAgeBucket(payment);
      buckets[bucket] = (buckets[bucket] || 0) + invoiceBalance(payment);
    });
  container.innerHTML = Object.entries(buckets).map(([label, amount]) => `
    <article class="billing-card">
      <span>${label}</span>
      <strong>${currency.format(amount)}</strong>
    </article>
  `).join("");
}

function cashCloseDetailTemplate(date = todayIso) {
  const grouped = cashierMethodTotals(date);
  const rows = Object.entries(grouped).flatMap(([cashier, methods]) =>
    Object.entries(methods).map(([method, amount]) => `
      <article class="cashier-method-row">
        <strong>${escapeHtml(cashier)}</strong>
        <span>${escapeHtml(method)}</span>
        <b>${currency.format(amount)}</b>
      </article>
    `)
  );
  return rows.length ? rows.join("") : emptyState("No hay cobros para detallar por cajero.");
}

function cashierMethodSummaryText(grouped) {
  return Object.entries(grouped)
    .flatMap(([cashier, methods]) => Object.entries(methods).map(([method, amount]) => `${cashier} / ${method}: ${currency.format(amount)}`))
    .join(" · ");
}

function ensureSupplier(name) {
  state.suppliers ||= [];
  const supplierName = name || "Sin proveedor";
  if (!state.suppliers.some((supplier) => normalizeText(supplier.name) === normalizeText(supplierName))) {
    state.suppliers.push({ id: makeId(), name: supplierName, phone: "", contact: "" });
  }
}

function registerInventoryMovement({ productId, type, quantity, reason, reference = "", provider = "", unitCost = 0, expiry = "", previousStock = 0, newStock = 0 }) {
  state.inventoryMovements ||= [];
  const product = state.inventory.find((item) => item.id === productId);
  if (!product || !quantity) return null;
  const movement = {
    id: makeId(),
    productId,
    productName: product.name,
    type,
    quantity: Number(quantity) || 0,
    previousStock,
    newStock,
    reason,
    reference,
    provider: provider || product.provider || "",
    unitCost: Number(unitCost) || 0,
    expiry: expiry || product.expiry || "",
    date: todayIso,
    createdAt: new Date().toISOString(),
    createdBy: currentUser?.id || "sin-usuario"
  };
  state.inventoryMovements.unshift(movement);
  return movement;
}

function applyInventoryMovement({ productId, type, quantity, reason, reference = "", provider = "", unitCost = 0, expiry = "" }) {
  const product = state.inventory.find((item) => item.id === productId);
  const movementQuantity = Number(quantity) || 0;
  if (!product || movementQuantity <= 0) return false;
  const previousStock = Number(product.stock) || 0;
  const normalizedType = normalizeText(type);
  const sign = normalizedType === "entrada" ? 1 : -1;
  const newStock = previousStock + (movementQuantity * sign);
  if (newStock < 0) {
    alert(`Stock insuficiente para ${product.name}. Disponible: ${previousStock}.`);
    return false;
  }
  product.stock = newStock;
  if (expiry) product.expiry = expiry;
  if (provider) {
    product.provider = provider;
    ensureSupplier(provider);
  }
  registerInventoryMovement({ productId, type, quantity: movementQuantity, reason, reference, provider, unitCost, expiry, previousStock, newStock });
  return true;
}

function inventoryItemByKeyword(keyword) {
  return state.inventory.find((item) => normalizeText(item.name).includes(normalizeText(keyword)));
}

function procedureSuppliesForTreatment(procedureName) {
  const normalized = normalizeText(procedureName);
  const rules = [];
  if (normalized.includes("evaluacion") || normalized.includes("control placa")) {
    rules.push(["guantes", 1]);
  }
  if (normalized.includes("exodoncia") || normalized.includes("colgajo")) {
    rules.push(["anestesia", 1], ["guantes", 1]);
  }
  if (normalized.includes("denticion") || normalized.includes("restaur") || normalized.includes("superior") || normalized.includes("subior")) {
    rules.push(["resina", 1], ["guantes", 1]);
  }
  return rules
    .map(([keyword, quantity]) => ({ product: inventoryItemByKeyword(keyword), quantity }))
    .filter((usage) => usage.product);
}

function inventoryExpiryStatus(item) {
  if (!item.expiry) return { label: "Sin vencimiento", className: "pendiente" };
  const days = Math.ceil((new Date(`${item.expiry}T12:00:00`) - new Date(`${todayIso}T12:00:00`)) / 86400000);
  if (days < 0) return { label: "Vencido", className: "cancelada" };
  if (days <= 60) return { label: "Por vencer", className: "pendiente" };
  return { label: "Vigente", className: "confirmada" };
}

function inventoryName(productId) {
  return state.inventory.find((item) => item.id === productId)?.name || "Producto no encontrado";
}

function inventoryAlertItems() {
  return state.inventory.flatMap((item) => {
    const alerts = [];
    const expiry = inventoryExpiryStatus(item);
    if (item.stock <= item.min) {
      alerts.push({
        label: "Stock bajo",
        title: item.name,
        detail: `Stock ${item.stock}. Minimo requerido ${item.min}.`,
        status: "cancelada"
      });
    }
    if (["Vencido", "Por vencer"].includes(expiry.label)) {
      alerts.push({
        label: expiry.label,
        title: item.name,
        detail: item.expiry ? `Fecha de vencimiento: ${formatDate(item.expiry)}.` : "Sin fecha registrada.",
        status: expiry.className
      });
    }
    return alerts;
  }).slice(0, 8);
}

function renderInventory() {
  state.inventory ||= [];
  const lowStock = state.inventory.filter((item) => item.stock <= item.min).length;
  const expiring = state.inventory.filter((item) => ["Vencido", "Por vencer"].includes(inventoryExpiryStatus(item).label)).length;
  const totalUnits = state.inventory.reduce((sum, item) => sum + item.stock, 0);
  const supplierCount = new Set(state.inventory.map((item) => item.provider || "Sin proveedor")).size;

  document.getElementById("inventorySummary").innerHTML = [
    ["Materiales", state.inventory.length],
    ["Unidades", totalUnits],
    ["Stock bajo", lowStock],
    ["Vencen pronto", expiring],
    ["Proveedores", supplierCount],
    ["Movimientos", (state.inventoryMovements || []).length]
  ].map(panelCardTemplate).join("");

  document.getElementById("inventoryAlerts").innerHTML = inventoryAlertItems().length
    ? inventoryAlertItems().map((item) => `
      <article class="alert-item">
        <span class="status-pill ${item.status}">${escapeHtml(item.label)}</span>
        <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></div>
      </article>
    `).join("")
    : emptyState("No hay alertas de stock o vencimiento.");

  document.getElementById("inventoryTable").innerHTML = state.inventory.map((item) => {
    const isLow = item.stock <= item.min;
    const expiryStatus = inventoryExpiryStatus(item);
    const status = isLow ? "Stock bajo" : expiryStatus.label === "Vencido" ? "Vencido" : "Disponible";
    return `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${item.stock}</td>
        <td>${item.min}</td>
        <td>${currency.format(item.price || 0)}</td>
        <td>${item.expiry ? formatDate(item.expiry) : "Sin fecha"} <span class="status-pill ${expiryStatus.className}">${expiryStatus.label}</span></td>
        <td>${escapeHtml(item.provider || "Sin proveedor")}</td>
        <td><span class="status-pill ${isLow || status === "Vencido" ? "cancelada" : "confirmada"}">${status}</span></td>
      </tr>
    `;
  }).join("");

  document.getElementById("kardexList").innerHTML = (state.inventoryMovements || []).length
    ? state.inventoryMovements.slice(0, 12).map((movement) => `
      <article class="ledger-item">
        <span class="amount-pill">${movement.type}</span>
        <div>
          <strong>${escapeHtml(movement.productName)} · ${movement.quantity} unidad(es)</strong>
          <p>${escapeHtml(movement.reason)} · ${formatDate(movement.date)} · Stock ${movement.previousStock} -> ${movement.newStock}</p>
          <p>${movement.reference ? `Ref. ${escapeHtml(movement.reference)} · ` : ""}${escapeHtml(movement.provider || "Sin proveedor")}${movement.expiry ? ` · Vence ${formatDate(movement.expiry)}` : ""}</p>
        </div>
      </article>
    `).join("")
    : emptyState("No hay movimientos kardex registrados.");

  document.getElementById("purchaseList").innerHTML = (state.inventoryPurchases || []).length
    ? state.inventoryPurchases.slice(0, 8).map((purchase) => `
      <article class="ledger-item">
        <span class="amount-pill">${purchase.quantity}</span>
        <div>
          <strong>${escapeHtml(inventoryName(purchase.productId))}</strong>
          <p>${escapeHtml(purchase.supplier)} · ${currency.format(purchase.unitCost || 0)} unidad · ${formatDate(purchase.date)}</p>
          ${purchase.expiry ? `<p>Vencimiento: ${formatDate(purchase.expiry)}</p>` : ""}
        </div>
      </article>
    `).join("")
    : emptyState("No hay compras registradas.");
}

function renderReports() {
  const filters = reportFilters();
  let billablePayments = activeBillingPayments().filter((payment) => inReportRange(payment.date, filters));
  let appointmentsInRange = state.appointments.filter((appointment) => inReportRange(appointment.date, filters));
  const cashClosingsInRange = (state.cashClosings || []).filter((closing) => inReportRange(closing.date, filters));
  if (filters.type === "laboratorio") {
    billablePayments = billablePayments.filter((payment) => payment.type === "Laboratorio" || payment.laboratoryRequestId);
  }
  if (filters.type === "doctores") {
    billablePayments = billablePayments.filter((payment) => payment.attendedDoctorId || payment.doctorId);
  }
  if (filters.type === "caja") {
    appointmentsInRange = [];
  }
  if (filters.doctor !== "all") {
    billablePayments = billablePayments.filter((payment) => (payment.attendedDoctorId || payment.doctorId) === filters.doctor);
    appointmentsInRange = appointmentsInRange.filter((appointment) => appointment.doctorId === filters.doctor);
  }
  if (filters.cashier !== "all") {
    billablePayments = billablePayments.filter((payment) => (payment.cashierId || payment.createdBy) === filters.cashier);
  }
  if (filters.invoiceType !== "all") {
    billablePayments = billablePayments.filter((payment) => normalizeText(payment.invoiceType || "Consumidor Final") === normalizeText(filters.invoiceType));
  }
  const income = billablePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const discounts = billablePayments.reduce((sum, payment) => sum + Number(payment.discount || 0), 0);
  const cancelled = appointmentsInRange.filter((appointment) => appointment.status === "Cancelada").length;
  const completedTreatments = state.treatments.filter((treatment) => treatment.progress >= 100).length;
  const receivable = activeBillingPayments().reduce((sum, payment) => sum + invoiceBalance(payment), 0);
  const averageTicket = billablePayments.length ? income / billablePayments.length : 0;
  const productIncome = billablePayments.filter((payment) => payment.type === "Producto").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const labIncome = billablePayments.filter((payment) => payment.type === "Laboratorio").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const expectedCash = cashClosingsInRange.reduce((sum, closing) => sum + Number(closing.expectedCash || closing.expectedTotal || closing.total || 0), 0);
  const countedCash = cashClosingsInRange.reduce((sum, closing) => sum + Number(closing.countedAmount || 0), 0);
  const cashDifference = cashClosingsInRange.reduce((sum, closing) => sum + Number(closing.difference || 0), 0);

  document.getElementById("reportCards").innerHTML = [
    ["Ingresos del período", currency.format(income), `${billablePayments.length} documentos facturados`, "confirmada"],
    ["Ticket promedio", currency.format(averageTicket), "Promedio por factura o recibo", averageTicket ? "confirmada" : "pendiente"],
    ["Cuentas por cobrar", currency.format(receivable), "Balance pendiente de pacientes", receivable > 0 ? "pendiente" : "confirmada"],
    ["Citas canceladas", cancelled, "Impacto operativo de agenda", cancelled ? "cancelada" : "confirmada"]
  ].map(reportMetricTemplate).join("");

  document.getElementById("reportSecondaryCards").innerHTML = [
    ["Descuentos", currency.format(discounts), "Ajustes aplicados en facturación", discounts ? "pendiente" : "confirmada"],
    ["Productos", currency.format(productIncome), "Ventas desde almacén", productIncome ? "confirmada" : "pendiente"],
    ["Laboratorio", currency.format(labIncome), "Trabajos facturados a doctores", labIncome ? "confirmada" : "pendiente"],
    ["Diferencia caja", currency.format(cashDifference), `${cashClosingsInRange.length} cierres revisados`, Math.abs(cashDifference) > 0 ? "pendiente" : "confirmada"]
  ].map(reportMetricTemplate).join("");

  renderReportCharts(billablePayments, appointmentsInRange);

  document.getElementById("doctorProductivity").innerHTML = doctors.map((doctor) => {
    const appointments = appointmentsInRange.filter((appointment) => appointment.doctorId === doctor.id).length;
    const attended = appointmentsInRange.filter((appointment) => appointment.doctorId === doctor.id && ["Atendida", "Confirmada"].includes(appointment.status)).length;
    const doctorPayments = billablePayments.filter((payment) => payment.attendedDoctorId === doctor.id || payment.doctorId === doctor.id);
    const doctorIncome = doctorPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const treatments = state.treatments.filter((treatment) => treatment.doctorId === doctor.id && treatment.progress < 100).length;
    const commission = doctorCommission(doctor.id);
    return `
      <article class="clinical-item report-list-item">
        <span class="report-rank">${appointments}</span>
        <div>
          <strong>${escapeHtml(doctor.name)}</strong>
          <p>${attended} atendidas · ${treatments} tratamientos activos · ${currency.format(doctorIncome)}</p>
          <small>${commission.points} puntos · ${commission.procedures} procedimientos completados · ${escapeHtml(doctor.specialty)}</small>
        </div>
      </article>
    `;
  }).join("");

  renderBillingReportList(billablePayments, cashClosingsInRange, expectedCash, countedCash);
  renderOperationsReportList(billablePayments, filters);

  document.getElementById("reportAlerts").innerHTML = [
    ["Stock bajo", `${state.inventory.filter((item) => item.stock <= item.min).length} materiales requieren compra.`],
    ["Balances", `${activeBillingPayments().filter((payment) => invoiceBalance(payment) > 0).length} facturas con balance.`],
    ["Seguimiento", `${state.treatments.filter((treatment) => treatment.progress > 0 && treatment.progress < 100).length} tratamientos en curso.`],
    ["Tratamientos", `${completedTreatments} tratamientos completados.`],
    ["Caja", `${cashClosingsInRange.filter((closing) => Number(closing.difference || 0) !== 0).length} cierres con diferencia.`],
    ["POST/POS", `${billablePayments.filter(isPosInvoice).length} transacciones con referencia POS/POST.`]
  ].map(([label, detail]) => `
    <article class="alert-item report-alert">
      <span class="status-pill pendiente">${label}</span>
      <div><strong>${detail}</strong><p>Revise el módulo correspondiente.</p></div>
    </article>
  `).join("");

  renderPosInvoiceReport(billablePayments);
}

function renderReportCharts(payments, appointments) {
  const incomeByDay = groupPaymentTotals(payments, (payment) => payment.date || "Sin fecha");
  const byMethod = groupPaymentTotals(payments, (payment) => payment.method || "Sin metodo");
  const byDoctor = doctors.reduce((summary, doctor) => {
    const doctorPayments = payments.filter((payment) => (payment.attendedDoctorId || payment.doctorId) === doctor.id);
    const doctorAppointments = appointments.filter((appointment) => appointment.doctorId === doctor.id);
    summary[doctor.name] = {
      label: doctor.name,
      total: doctorPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      count: doctorAppointments.length
    };
    return summary;
  }, {});

  renderSimpleBarChart("incomeByDayChart", Object.values(incomeByDay)
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-10)
    .map((item) => ({ label: item.label === "Sin fecha" ? item.label : formatDate(item.label), value: item.total, detail: `${item.count} docs`, money: true })));

  renderSimpleBarChart("paymentMethodChart", Object.values(byMethod)
    .sort((a, b) => b.total - a.total)
    .map((item) => ({ label: item.label, value: item.total, detail: `${item.count} docs`, money: true })));

  renderSimpleBarChart("doctorProductivityChart", Object.values(byDoctor)
    .sort((a, b) => (b.total + b.count) - (a.total + a.count))
    .map((item) => ({ label: item.label, value: item.total || item.count, detail: `${item.count} citas - ${currency.format(item.total)}`, money: Boolean(item.total) })));
}

function renderSimpleBarChart(containerId, rows) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const max = Math.max(...rows.map((row) => Number(row.value) || 0), 1);
  container.innerHTML = rows.length
    ? rows.map((row) => {
        const percent = Math.max(4, Math.round(((Number(row.value) || 0) / max) * 100));
        return `
          <article class="simple-chart-row">
            <div>
              <strong>${escapeHtml(row.label)}</strong>
              <span>${escapeHtml(row.detail || "")}</span>
            </div>
            <div class="simple-chart-track">
              <i style="width:${percent}%"></i>
            </div>
            <b>${row.money ? currency.format(row.value || 0) : row.value || 0}</b>
          </article>
        `;
      }).join("")
    : emptyState("No hay datos para graficar.");
}

function exportReportsCsv() {
  const filters = reportFilters();
  const payments = activeBillingPayments()
    .filter((payment) => inReportRange(payment.date, filters))
    .filter((payment) => filters.type !== "laboratorio" || payment.type === "Laboratorio" || payment.laboratoryRequestId)
    .filter((payment) => filters.type !== "doctores" || payment.attendedDoctorId || payment.doctorId)
    .filter((payment) => filters.doctor === "all" || (payment.attendedDoctorId || payment.doctorId) === filters.doctor)
    .filter((payment) => filters.cashier === "all" || (payment.cashierId || payment.createdBy) === filters.cashier)
    .filter((payment) => filters.invoiceType === "all" || normalizeText(payment.invoiceType || "Consumidor Final") === normalizeText(filters.invoiceType));
  const rows = [
    ["Fecha", "Factura", "Tipo factura", "Paciente", "Doctor", "Cajero", "Metodo", "Concepto", "Monto", "Pagado", "Balance", "Antiguedad", "Estado"],
    ...payments.map((payment) => [
      payment.date,
      payment.invoiceNumber || payment.receiptNumber || "",
      payment.invoiceType || "Consumidor Final",
      patientById(payment.patientId).name,
      paymentDoctorLabel(payment),
      paymentCashierLabel(payment),
      payment.method || "",
      payment.concept || "",
      invoiceNetAmount(payment),
      invoicePaidAmount(payment),
      invoiceBalance(payment),
      invoiceBalance(payment) > 0 ? invoiceAgeBucket(payment) : "",
      payment.invoiceStatus || "Pagada"
    ])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `novaclinic-reporte-${filters.start}-${filters.end}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function printReports() {
  const filters = reportFilters();
  const report = document.getElementById("reports").cloneNode(true);
  report.querySelectorAll("form, .report-actions, button").forEach((item) => item.remove());
  const printWindow = window.open("", "_blank", "width=1200,height=900");
  if (!printWindow) {
    alert("Permita ventanas emergentes para imprimir el reporte.");
    return;
  }
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Reporte gerencial NovaClinic</title>
        <link rel="stylesheet" href="styles.css">
        <style>
          @page { size: letter; margin: 12mm; }
          body { width: auto; min-width: 0; margin: 0; background: #fff; color: #18221d; font-family: Inter, Segoe UI, Arial, sans-serif; }
          .view { display: block !important; }
          .report-hero { box-shadow: none; margin-bottom: 14px; }
          .report-hero::after { content: "Periodo: ${escapeHtml(filters.start)} a ${escapeHtml(filters.end)}"; display: block; margin-top: 8px; color: #66746b; font-weight: 800; }
          .report-command-grid, .pos-report-summary { grid-template-columns: repeat(4, 1fr); }
          .report-chart-grid, .report-layout { grid-template-columns: 1fr; }
          .pos-ticket-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .panel, .report-metric-card, .pos-summary-card, .report-chart-card { box-shadow: none; break-inside: avoid; }
        </style>
      </head>
      <body>${report.outerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

function csvCell(valueText) {
  return `"${String(valueText ?? "").replaceAll('"', '""')}"`;
}

function renderPosInvoiceReport(payments = activeBillingPayments()) {
  const posInvoices = payments.filter(isPosInvoice);
  const total = posInvoices.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const discounts = posInvoices.reduce((sum, payment) => sum + Number(payment.discount || 0), 0);
  const emitted = posInvoices.filter((payment) => payment.invoiceStatus === "Emitida").length;

  document.getElementById("posInvoiceSummary").innerHTML = [
    ["Facturas", posInvoices.length, "Transacciones detectadas"],
    ["Total cobrado", currency.format(total), "Monto procesado por POS/POST"],
    ["Descuentos", currency.format(discounts), "Ajustes aplicados"],
    ["Emitidas", emitted, "Pendientes de cierre o cobro"]
  ].map(posSummaryTemplate).join("");

  document.getElementById("posInvoiceTickets").innerHTML = posInvoices.length
    ? posInvoices.map((payment) => posInvoiceTicketTemplate(payment, "FACTURA POS")).join("")
    : emptyState("No hay facturas POS/POST registradas.");
}

function renderBillingReportList(payments, cashClosings, expectedCash, countedCash) {
  const byMethod = groupPaymentTotals(payments, (payment) => payment.method || "Sin método");
  const byCashier = groupPaymentTotals(payments, (payment) => paymentCashierLabel(payment));
  const agingRows = receivablesAgingRows(payments);
  const methodRows = reportRankingRows(byMethod, "Métodos de pago");
  const cashierRows = reportRankingRows(byCashier, "Cajeros");
  const cashStatus = `
    <article class="clinical-item report-list-item">
      <span class="report-rank">${cashClosings.length}</span>
      <div>
        <strong>Cierres de caja</strong>
        <p>Esperado ${currency.format(expectedCash)} · Contado ${currency.format(countedCash)}</p>
        <small>Diferencia acumulada ${currency.format(countedCash - expectedCash)}</small>
      </div>
    </article>
  `;
  document.getElementById("billingReportList").innerHTML = [
    cashStatus,
    ...agingRows,
    ...methodRows,
    ...cashierRows
  ].join("") || emptyState("No hay facturación en el período seleccionado.");
}

function receivablesAgingRows(payments) {
  const buckets = payments
    .filter((payment) => invoiceBalance(payment) > 0)
    .reduce((summary, payment) => {
      const bucket = invoiceAgeBucket(payment);
      summary[bucket] ||= { label: bucket, total: 0, count: 0 };
      summary[bucket].total += invoiceBalance(payment);
      summary[bucket].count += 1;
      return summary;
    }, {});
  return Object.values(buckets).map((item) => `
    <article class="clinical-item report-list-item">
      <span class="report-rank">${item.count}</span>
      <div>
        <strong>Cuentas por cobrar · ${escapeHtml(item.label)}</strong>
        <p>${item.count} factura(s) · ${currency.format(item.total)}</p>
      </div>
    </article>
  `);
}

function renderOperationsReportList(payments, filters) {
  const productSales = payments.filter((payment) => payment.type === "Producto").length;
  const labRequests = (state.selfServiceRequests || []).filter((request) => request.type === "Laboratorio - pieza dental");
  const labCompleted = labRequests.filter((request) => ["Terminado", "Entregado", "Facturado"].includes(request.status)).length;
  const labPending = labRequests.filter((request) => !["Terminado", "Entregado", "Facturado", "Cancelado"].includes(request.status)).length;
  const lowStock = state.inventory.filter((item) => item.stock <= item.min);
  const reportType = filters.type;
  document.getElementById("operationsReportList").innerHTML = [
    ["Productos facturados", `${productSales} ventas`, reportType === "facturacion" ? "Incluido en el filtro de facturación." : "Incluye ventas desde almacén."],
    ["Laboratorio pendiente", `${labPending} trabajos`, `${labCompleted} completados o facturados.`],
    ["Stock crítico", `${lowStock.length} productos`, lowStock.slice(0, 3).map((item) => item.name).join(", ") || "Sin alertas críticas."],
    ["Facturas con balance", `${activeBillingPayments().filter((payment) => invoiceBalance(payment) > 0).length} facturas`, currency.format(activeBillingPayments().reduce((sum, payment) => sum + invoiceBalance(payment), 0))]
  ].map(([label, valueText, detail]) => `
    <article class="alert-item report-alert">
      <span class="status-pill pendiente">${label}</span>
      <div><strong>${escapeHtml(valueText)}</strong><p>${escapeHtml(detail)}</p></div>
    </article>
  `).join("");
}

function groupPaymentTotals(payments, labelFactory) {
  return payments.reduce((summary, payment) => {
    const label = labelFactory(payment);
    if (!summary[label]) summary[label] = { label, total: 0, count: 0 };
    summary[label].total += Number(payment.amount || 0);
    summary[label].count += 1;
    return summary;
  }, {});
}

function reportRankingRows(grouped, title) {
  return Object.values(grouped)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((item, index) => `
      <article class="clinical-item report-list-item">
        <span class="report-rank">${index + 1}</span>
        <div>
          <strong>${escapeHtml(title)} · ${escapeHtml(item.label)}</strong>
          <p>${item.count} documentos · ${currency.format(item.total)}</p>
        </div>
      </article>
    `);
}

function reportFilters() {
  return {
    start: document.getElementById("reportStartDate")?.value || `${todayIso.slice(0, 8)}01`,
    end: document.getElementById("reportEndDate")?.value || todayIso,
    type: document.getElementById("reportTypeFilter")?.value || "general",
    doctor: document.getElementById("reportDoctorFilter")?.value || "all",
    cashier: document.getElementById("reportCashierFilter")?.value || "all",
    invoiceType: document.getElementById("reportInvoiceTypeFilter")?.value || "all"
  };
}

function inReportRange(dateText, filters = reportFilters()) {
  if (!dateText) return true;
  return dateText >= filters.start && dateText <= filters.end;
}

function renderSecurityPanel() {
  const summary = document.getElementById("securitySummary");
  const list = document.getElementById("securityAuditList");
  if (!summary || !list) return;
  const lockedUsers = Object.values(state.securityLocks || {}).filter((lock) => Number(lock.lockedUntil || 0) > Date.now()).length;
  const failedLogins = (state.auditLog || []).filter((item) => item.action === "login:failed").length;
  const permissionChanges = (state.auditLog || []).filter((item) => item.action.startsWith("permissions:")).length;
  const expiresAt = Number(localStorage.getItem("novaclinic-session-expires") || 0);
  const minutesLeft = currentUser && expiresAt ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 60000)) : 0;
  summary.innerHTML = [
    ["Sesión", currentUser ? `${minutesLeft} min` : "Cerrada"],
    ["Bloqueos", lockedUsers],
    ["Intentos fallidos", failedLogins],
    ["Cambios permisos", permissionChanges]
  ].map(panelCardTemplate).join("");

  if (!can("security:audit")) {
    list.innerHTML = emptyState("No tiene permiso para ver la bitácora de seguridad.");
    return;
  }

  list.innerHTML = (state.auditLog || []).slice(0, 20).map((item) => `
    <article class="ledger-item security-audit-item">
      <span class="status-pill ${item.action.includes("failed") || item.action.includes("blocked") ? "cancelada" : "confirmada"}">${escapeHtml(item.action)}</span>
      <div>
        <strong>${escapeHtml(item.detail)}</strong>
        <p>${formatDateTime(item.at)} · Usuario: ${escapeHtml(userById(item.by).name)}${item.targetUserId ? ` · Afectado: ${escapeHtml(userById(item.targetUserId).name)}` : ""}</p>
      </div>
    </article>
  `).join("") || emptyState("Sin eventos de seguridad registrados.");
}

function posInvoiceTicketTemplate(payment, documentTitle = "RECIBO DE PAGO") {
  const patient = patientById(payment.patientId);
  const total = Number(payment.amount || 0);
  const discount = Number(payment.discount || 0);
  const invoiceGross = total + discount;
  const taxRate = 0.18;
  const subtotal = invoiceGross / (1 + taxRate);
  const tax = invoiceGross - subtotal;
  const quantity = Number(payment.quantity || 1) || 1;
  const unit = invoiceGross / quantity;
  const received = Number(payment.amountReceived || payment.received || total);
  const change = Math.max(0, received - total);
  const seller = paymentCashierLabel(payment);
  const doctor = paymentDoctorLabel(payment);
  const isReceipt = normalizeText(documentTitle).includes("recibo");
  const settings = state.settings || {};
  return `
    <article class="pos-ticket">
      <div class="pos-ticket-brand">
        <img class="ticket-logo" src="NOVACLINIC LOGO.png" alt="NovaClinic">
        <h3>${escapeHtml(settings.clinicName || "NovaClinic")}</h3>
        <p>${escapeHtml(settings.clinicTaxId || "RNC-000000")}</p>
        <p>${escapeHtml(settings.clinicAddress || "Santo Domingo, República Dominicana")}</p>
        <p>Teléfono: ${escapeHtml(settings.clinicPhone || "809-555-0100")}</p>
      </div>
      <div class="ticket-separator"></div>
      <div class="ticket-client">
        <strong>${escapeHtml(documentTitle)}</strong>
        <p>Código cliente: ${escapeHtml(patient.code || patient.id || "Sin código")}</p>
        <p>Cliente: ${escapeHtml(patient.name)}</p>
        <p>Seguro: ${escapeHtml(patient.insurance || "Sin seguro")}</p>
        <p>${escapeHtml(patient.address || "Dirección no registrada")}</p>
        <p>Teléfono: ${escapeHtml(patient.phone || "No registrado")}</p>
        <p>Identificación: ${escapeHtml(patientDocumentLabel(patient))}</p>
      </div>
      <div class="ticket-separator"></div>
      <div class="ticket-invoice-meta">
        <strong>No. Factura</strong>
        <span>${escapeHtml(payment.invoiceNumber || "FAC-S/N")}</span>
        ${payment.ncf ? `<p>NCF: ${escapeHtml(payment.ncf)}</p>` : ""}
        <p>Tipo de factura: ${escapeHtml(payment.invoiceType || "Consumidor Final")}</p>
        <p>Estado: ${escapeHtml(payment.invoiceStatus || "Pagada")}</p>
        <p>Fecha: ${paymentIssuedAtLabel(payment)}</p>
        <p>Referencia: ${escapeHtml(payment.reference || "Sin referencia")}</p>
        <p>Doctor que atendió: ${escapeHtml(doctor)}</p>
        <p>Método de pago: ${escapeHtml(payment.method || "Tarjeta")}</p>
        <p>Vendedor: ${escapeHtml(seller)}</p>
      </div>
      <div class="ticket-items">
        <div class="ticket-items-head">
          <span>Producto/Proc.</span><span>Cant.</span><span>Precio</span><span>Total</span>
        </div>
        <div class="ticket-item-row">
          <span>${escapeHtml(payment.concept || "Servicio odontológico")}</span>
          <span>${quantity}</span>
          <span>${currency.format(unit)}</span>
          <span>${currency.format(invoiceGross)}</span>
        </div>
      </div>
      <div class="ticket-totals">
        <div><span>Subtotal:</span><strong>${currency.format(subtotal)}</strong></div>
        <div><span>ITBIS (18.00%):</span><strong>${currency.format(tax)}</strong></div>
        <div><span>Descuento:</span><strong>${currency.format(discount)}</strong></div>
        <div class="ticket-grand-total"><span>Total general:</span><strong>${currency.format(total)}</strong></div>
      </div>
      ${isReceipt ? `<div class="ticket-payments">
        <p>Total recibido: ${currency.format(received)}</p>
        <p>Devolver: ${currency.format(change)}</p>
      </div>` : ""}
      <div class="ticket-signature">
        <span>Elaborado por:</span>
        <strong>${escapeHtml(seller)}</strong>
      </div>
      <div class="ticket-footer">
        <p>Todos nuestros servicios cuentan con garantía según la política de la clínica.</p>
        <p>Gracias por su compra.</p>
        <small>Generado en NovaClinic POS</small>
      </div>
    </article>
  `;
}

function reportMetricTemplate([label, valueText, detail, status]) {
  return `
    <article class="report-metric-card">
      <span class="status-pill ${status}">${label}</span>
      <strong>${valueText}</strong>
      <p>${detail}</p>
    </article>
  `;
}

function posSummaryTemplate([label, valueText, detail]) {
  return `
    <article class="pos-summary-card">
      <span>${label}</span>
      <strong>${valueText}</strong>
      <p>${detail}</p>
    </article>
  `;
}

function isPosInvoice(payment) {
  const method = normalizeText(payment.method || "");
  const reference = normalizeText(payment.reference || "");
  return method.includes("tarjeta") || reference.includes("pos") || reference.includes("post");
}

function paymentIssuedAtLabel(payment) {
  if (payment.createdAt) return formatDateTime(payment.createdAt);
  if (payment.date) return formatDate(payment.date);
  return "Sin fecha";
}

function renderAdmin() {
  state.settings = normalizeSettings(state.settings);
  document.getElementById("clinicName").value = state.settings.clinicName || "NovaClinic";
  document.getElementById("clinicPhone").value = state.settings.clinicPhone || "";
  document.getElementById("clinicAddress").value = state.settings.clinicAddress || "";
  document.getElementById("clinicTaxId").value = state.settings.clinicTaxId || "";
  document.getElementById("clinicCurrency").value = state.settings.clinicCurrency || "DOP";
  document.getElementById("ncfFinalPrefix").value = state.settings.ncfSequences.final.prefix;
  document.getElementById("ncfFinalNext").value = state.settings.ncfSequences.final.next;
  document.getElementById("ncfFiscalPrefix").value = state.settings.ncfSequences.fiscal.prefix;
  document.getElementById("ncfFiscalNext").value = state.settings.ncfSequences.fiscal.next;
  document.getElementById("ncfGovPrefix").value = state.settings.ncfSequences.gov.prefix;
  document.getElementById("ncfGovNext").value = state.settings.ncfSequences.gov.next;
  document.getElementById("ncfSpecialPrefix").value = state.settings.ncfSequences.special.prefix;
  document.getElementById("ncfSpecialNext").value = state.settings.ncfSequences.special.next;
}

function nextReceiptNumber() {
  const next = String(state.payments.length + 1).padStart(3, "0");
  return `REC-${todayIso.replaceAll("-", "")}-${next}`;
}

function nextInvoiceNumber() {
  const next = String(state.payments.length + 1).padStart(4, "0");
  return `FAC-${todayIso.replaceAll("-", "")}-${next}`;
}

function readNcfSettingsFromForm() {
  return {
    final: { prefix: value("ncfFinalPrefix") || "B02", next: Number(value("ncfFinalNext")) || 1 },
    fiscal: { prefix: value("ncfFiscalPrefix") || "B01", next: Number(value("ncfFiscalNext")) || 1 },
    gov: { prefix: value("ncfGovPrefix") || "B15", next: Number(value("ncfGovNext")) || 1 },
    special: { prefix: value("ncfSpecialPrefix") || "B14", next: Number(value("ncfSpecialNext")) || 1 }
  };
}

function ncfKeyForInvoiceType(invoiceType) {
  const normalized = normalizeText(invoiceType);
  if (normalized.includes("gubernamental")) return "gov";
  if (normalized.includes("credito") || normalized.includes("comprobante")) return "fiscal";
  if (normalized.includes("regimen")) return "special";
  return "final";
}

function nextNcf(invoiceType) {
  state.settings = normalizeSettings(state.settings);
  const key = ncfKeyForInvoiceType(invoiceType);
  const sequence = state.settings.ncfSequences[key];
  const ncf = `${sequence.prefix}${String(sequence.next).padStart(8, "0")}`;
  sequence.next += 1;
  return ncf;
}

function activeBillingPayments(payments = state.payments) {
  return payments.filter((payment) => payment.invoiceStatus !== "Anulada" && payment.documentKind !== "Cotización");
}

function invoiceNetAmount(payment) {
  return Math.max(0, Number(payment.amount || 0) - Number(payment.discount || 0));
}

function invoicePaidAmount(payment) {
  const historyTotal = (payment.paymentHistory || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  if (historyTotal > 0) return historyTotal;
  if (["Pagada", "Emitida"].includes(payment.invoiceStatus) && payment.amountReceived === undefined) {
    return invoiceNetAmount(payment);
  }
  return Math.min(invoiceNetAmount(payment), Number(payment.amountReceived || 0));
}

function invoiceCreditAmount(payment) {
  return (payment.creditNotes || []).reduce((sum, note) => sum + Number(note.amount || 0), 0);
}

function invoiceBalance(payment) {
  if (payment.invoiceStatus === "Anulada" || payment.documentKind === "Cotización") return 0;
  return Math.max(0, invoiceNetAmount(payment) - invoicePaidAmount(payment) - invoiceCreditAmount(payment));
}

function invoiceAgeBucket(payment) {
  return receivableAgeBucket(payment.date || payment.createdAt?.slice(0, 10) || todayIso);
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

function syncPaymentReceivedRequirement() {
  const receivedInput = document.getElementById("paymentReceived");
  const isCash = value("paymentMethod") === "Efectivo";
  receivedInput.required = isCash;
  receivedInput.placeholder = isCash ? "Monto recibido obligatorio" : "Monto recibido";
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
  return paymentCollections(date).reduce((summary, collection) => {
      summary[collection.method] = (summary[collection.method] || 0) + Number(collection.amount || 0);
      return summary;
    }, {});
}

function cashChangeTotal(date = null) {
  return activeBillingPayments()
    .filter((payment) => payment.method === "Efectivo" && (!date || payment.date === date))
    .reduce((sum, payment) => {
      const received = Number(payment.amountReceived || payment.amount || 0);
      return sum + Math.max(0, received - invoiceNetAmount(payment));
    }, 0);
}

function paymentCollections(date = null) {
  return activeBillingPayments().flatMap((payment) => {
    const history = payment.paymentHistory?.length
      ? payment.paymentHistory
      : invoicePaidAmount(payment) > 0
        ? [{ date: payment.date, amount: invoicePaidAmount(payment), method: payment.method, cashierId: payment.cashierId || payment.createdBy }]
        : [];
    return history
      .filter((item) => !date || item.date === date)
      .map((item) => ({
        paymentId: payment.id,
        invoiceNumber: payment.invoiceNumber,
        patientId: payment.patientId,
        amount: Number(item.amount || 0),
        method: item.method || payment.method,
        cashierId: item.cashierId || payment.cashierId || payment.createdBy,
        date: item.date || payment.date
      }));
  });
}

function cashierMethodTotals(date = null) {
  return paymentCollections(date).reduce((summary, collection) => {
    const cashier = paymentCashierLabel({ cashierId: collection.cashierId });
    summary[cashier] ||= {};
    summary[cashier][collection.method] = (summary[cashier][collection.method] || 0) + collection.amount;
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

function receivableAgeDays(dateValue) {
  if (!dateValue) return 0;
  return Math.max(0, Math.floor((new Date(`${todayIso}T12:00:00`) - new Date(`${dateValue}T12:00:00`)) / 86400000));
}

function topPaymentMethod(methodTotals) {
  const entries = Object.entries(methodTotals).sort((a, b) => b[1] - a[1]);
  return entries[0] ? `${entries[0][0]} · ${currency.format(entries[0][1])}` : "Sin cobros";
}

function openReceipt(paymentId) {
  if (!can("payments:print")) return;
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment) return;
  const title = payment.documentKind === "Cotización" ? "COTIZACION" : "RECIBO DE PAGO";
  document.getElementById("receiptContent").innerHTML = posInvoiceTicketTemplate(payment, title);
  logAudit("print:receipt", `Imprimió ${payment.invoiceNumber || payment.receiptNumber || "documento"}`, payment.cashierId || payment.createdBy);
  document.getElementById("receiptDialog").showModal();
}

function reprintInvoice(paymentId) {
  if (!can("payments:print")) return;
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment) return;
  payment.reprintCount = (Number(payment.reprintCount) || 0) + 1;
  payment.reprints ||= [];
  payment.reprints.unshift({
    at: new Date().toISOString(),
    by: currentUser?.id || "sin-usuario"
  });
  saveState();
  logAudit("print:reprint", `Reimpresió ${payment.invoiceNumber || payment.receiptNumber || "documento"}`, payment.cashierId || payment.createdBy);
  openReceipt(paymentId);
  renderBilling();
}

function annulInvoice(paymentId) {
  if (!can("payments:void")) return;
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment || payment.invoiceStatus === "Anulada") return;
  const reason = prompt("Motivo de anulación de la factura");
  if (!reason) return;
  if (payment.documentKind !== "Cotización") {
    const patient = patientById(payment.patientId);
    patient.balance = Math.max(0, patient.balance - invoiceBalance(payment));
    if (payment.type === "Producto" && payment.productId) {
      applyInventoryMovement({
        productId: payment.productId,
        type: "Entrada",
        quantity: Number(payment.quantity || 1),
        reason: "Reverso por anulacion",
        reference: payment.invoiceNumber || payment.receiptNumber || payment.id
      });
    }
  }
  payment.previousInvoiceStatus = payment.invoiceStatus;
  payment.invoiceStatus = "Anulada";
  payment.voidReason = reason;
  payment.voidedAt = new Date().toISOString();
  payment.voidedBy = currentUser?.id || "sin-usuario";
  logAudit("billing:void", `Anuló ${payment.invoiceNumber || payment.receiptNumber || "factura"}: ${reason}`, payment.patientId);
  saveState();
  renderBilling();
}

function convertQuoteToInvoice(paymentId) {
  if (!can("payments:edit")) return;
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment || payment.documentKind !== "Cotización") return;
  const invoiceType = prompt("Tipo de factura para convertir la cotización", "Consumidor Final");
  if (!invoiceType) return;
  if (payment.type === "Producto" && payment.productId) {
    const product = state.inventory.find((item) => item.id === payment.productId);
    if (!product || product.stock < Number(payment.quantity || 1)) {
      alert(`Stock insuficiente para convertir la cotización. Disponible: ${product?.stock || 0}.`);
      return;
    }
  }
  payment.convertedFromQuoteId = payment.id;
  payment.documentKind = "Factura";
  payment.invoiceType = invoiceType;
  payment.invoiceStatus = "Pendiente";
  payment.invoiceNumber = nextInvoiceNumber();
  payment.receiptNumber = nextReceiptNumber();
  payment.ncf = nextNcf(invoiceType);
  payment.date = todayIso;
  payment.convertedAt = new Date().toISOString();
  payment.convertedBy = currentUser?.id || "sin-usuario";
  if (payment.type === "Producto" && payment.productId) {
    applyInventoryMovement({
      productId: payment.productId,
      type: "Salida",
      quantity: Number(payment.quantity || 1),
      reason: "Cotizacion convertida en factura",
      reference: payment.invoiceNumber || payment.id
    });
  }
  logAudit("billing:convert", `Convirtió cotización a factura ${payment.invoiceNumber}`, payment.patientId);
  saveState();
  renderBilling();
}

function addInvoicePayment(paymentId) {
  if (!can("payments:edit")) return;
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment || invoiceBalance(payment) <= 0) return;
  if (!currentCashOpening()) {
    alert("Debe abrir la caja antes de registrar abonos.");
    return;
  }
  const amount = Number(prompt(`Monto del abono. Balance actual: ${currency.format(invoiceBalance(payment))}`));
  if (!amount || amount <= 0) return;
  if (amount > invoiceBalance(payment)) {
    alert("El abono no puede ser mayor al balance pendiente.");
    return;
  }
  const method = prompt("Método de pago", payment.method || "Efectivo") || payment.method || "Efectivo";
  const reference = prompt("Referencia del abono", "") || "";
  payment.paymentHistory ||= [];
  payment.paymentHistory.unshift({
    id: makeId(),
    date: todayIso,
    amount,
    method,
    reference,
    cashierId: currentUser?.id || payment.cashierId || "sin-usuario",
    createdAt: new Date().toISOString(),
    note: "Abono"
  });
  payment.amountReceived = invoicePaidAmount(payment);
  payment.invoiceStatus = invoiceBalance(payment) <= 0 ? "Pagada" : "Parcialmente pagada";
  payment.updatedAt = new Date().toISOString();
  payment.updatedBy = currentUser?.id || "sin-usuario";
  const patient = patientById(payment.patientId);
  patient.balance = Math.max(0, patient.balance - amount);
  logAudit("billing:payment", `Registró abono ${currency.format(amount)} a ${payment.invoiceNumber || "factura"}`, payment.patientId);
  saveState();
  renderBilling();
}

function createCreditNote(paymentId) {
  if (!can("payments:void")) return;
  const payment = state.payments.find((item) => item.id === paymentId);
  if (!payment || payment.invoiceStatus === "Anulada" || payment.documentKind === "Cotización") return;
  const reason = prompt("Motivo obligatorio de la nota de crédito");
  if (!reason) return;
  const available = Math.max(0, invoiceNetAmount(payment) - invoiceCreditAmount(payment));
  const amount = Number(prompt(`Monto de la nota de crédito. Disponible: ${currency.format(available)}`, String(Math.min(available, invoiceBalance(payment) || available))));
  if (!amount || amount <= 0 || amount > available) {
    alert("Monto de nota de crédito inválido.");
    return;
  }
  payment.creditNotes ||= [];
  payment.creditNotes.unshift({
    id: makeId(),
    number: `NC-${todayIso.replaceAll("-", "")}-${String((payment.creditNotes.length || 0) + 1).padStart(3, "0")}`,
    date: todayIso,
    amount,
    reason,
    createdAt: new Date().toISOString(),
    createdBy: currentUser?.id || "sin-usuario"
  });
  payment.invoiceStatus = invoiceBalance(payment) <= 0 ? "Nota de crédito" : "Parcialmente pagada";
  payment.updatedAt = new Date().toISOString();
  payment.updatedBy = currentUser?.id || "sin-usuario";
  const patient = patientById(payment.patientId);
  patient.balance = Math.max(0, patient.balance - amount);
  logAudit("billing:credit-note", `Creó nota de crédito ${currency.format(amount)}: ${reason}`, payment.patientId);
  saveState();
  renderBilling();
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

function toDateInputValue(date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function sortByDateTime(a, b) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}

function labelStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function className(text) {
  return normalizeText(text).replace(/\s+/g, "-");
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


