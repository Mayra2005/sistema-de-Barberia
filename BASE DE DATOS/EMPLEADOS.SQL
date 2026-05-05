CREATE TABLE Empleados (
    idEmpleados INT AUTO_INCREMENT,
    nombre VARCHAR(50),
    paterno VARCHAR(50),
    materno VARCHAR(50),
    telefono VARCHAR(15),
    horario TIME,
    estado VARCHAR(20),
    especialidad VARCHAR(50),
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(50) NOT NULL,
    rol VARCHAR(20) DEFAULT 'Barbero',
    PRIMARY KEY (idEmpleados)
);
