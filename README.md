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
- Registro de pacientes con datos personales, alergias, historial clinico, fotografia y balance.
- Agenda odontologica con calendario mensual, recordatorios, duracion y estado de citas.
- Expediente odontologico con diagnosticos, evolucion, tratamientos, documentos clinicos e impresion.
- Odontograma visual por arcada superior e inferior, con marcado persistente por pieza o superficie.
- Planes de tratamiento con presupuesto, responsable y progreso.
- Facturacion con cobros, recibos, metodos de pago y balance pendiente.
- Nomina dentro del panel de Recursos Humanos, con personal administrativo por salario fijo y doctores por comision de puntos.
- Inventario de materiales odontologicos con stock minimo, vencimiento y proveedor.
- Reportes de ingresos, cuentas por cobrar, citas, tratamientos y productividad por doctor.
- Administracion de datos de la clinica, exportacion JSON y restauracion de datos demo.
