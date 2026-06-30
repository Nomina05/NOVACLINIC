# NovaClinic Dental

Sistema odontologico web de una sola pagina para gestionar pacientes, agenda, expediente clinico, odontograma, tratamientos, facturacion, inventario, reportes, nomina y usuarios por permisos.

## Uso

Abre `index.html` en el navegador. Los datos se guardan localmente en el navegador con `localStorage`.

## Acceso de prueba

- Administrador: PIN `0000`
- Doctor: PIN `1234`
- Recepcion: PIN `1111`
- Recursos Humanos: PIN `2222`
- Contabilidad: PIN `3333`

## Permisos

- Administrador: acceso completo a paneles, usuarios, permisos, pacientes, agenda, expediente, inventario, reportes, facturacion, nomina y configuracion.
- Doctor: acceso al panel de doctores, pacientes, agenda, odontograma, tratamientos, documentos clinicos e inventario.
- Recepcion: acceso al panel de recepcion, pacientes, agenda, facturacion y reportes.
- Recursos Humanos: acceso al panel de personal y nomina.
- Contabilidad: acceso al panel contable, facturacion y reportes.
- Usuarios: panel reservado para administracion de usuarios, roles y permisos.

## Modulos incluidos

- Inicio de sesion por usuario y rol.
- Paneles por area: Doctores, Recepcion, Usuarios, Recursos Humanos y Contabilidad.
- Menu principal solo con paneles; los modulos se muestran agrupados dentro de cada panel.
- Matriz de permisos administrada por el usuario Administrador desde el panel de Usuarios.
- Panel de Usuarios simplificado con busqueda, lista compacta, editor de permisos y boton Nuevo usuario.
- Registro de pacientes con datos personales, tipo de documento, nacionalidad, alergias, historial clinico, fotografia por camara y balance.
- Contacto de emergencia separado por nombre, telefono y parentesco.
- Documento del paciente configurable como cedula, pasaporte o licencia de conducir; en menores de edad el documento no es obligatorio.
- Condicion de menor de edad en pacientes para inhabilitar el tipo de documento y el numero de documento.
- Seguro y tipo de sangre seleccionables desde listas desplegables.
- Edicion de pacientes con codigo visible separado del UUID interno.
- Ficha historica del paciente con datos, alertas, citas, tratamientos, pagos, documentos y odontograma.
- Agenda odontologica con calendario mensual, recordatorios, duracion y estado de citas.
- Edicion rapida de citas desde la agenda.
- Expediente odontologico con diagnosticos, evolucion, tratamientos, documentos clinicos e impresion.
- Odontograma visual por arcada superior e inferior, con marcado persistente por pieza o superficie.
- Historial de cambios del odontograma por paciente, pieza, superficie, fecha y usuario.
- Planes de tratamiento con presupuesto, responsable y progreso.
- Facturacion con cobros, recibos, metodos de pago y balance pendiente.
- Facturacion con numero de factura, abonos, descuentos autorizados, cuentas por cobrar por antiguedad, productos facturables y apertura/cierre de caja.
- Nomina dentro del panel de Recursos Humanos, con personal administrativo por salario fijo y doctores por comision de puntos.
- Inventario de materiales odontologicos con stock minimo, vencimiento y proveedor.
- Reportes de ingresos, cuentas por cobrar, citas, tratamientos y productividad por doctor.
- Administracion de datos de la clinica, exportacion JSON y restauracion de datos demo.
