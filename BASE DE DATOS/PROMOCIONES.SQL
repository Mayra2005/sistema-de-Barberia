CREATE TABLE Promociones (
    idPromociones INT AUTO_INCREMENT,
    nombre VARCHAR(50),
    descripcion VARCHAR(100),
    descuento DECIMAL(5,2),
    fecha_inicio DATE,
    fecha_fin DATE,
    PRIMARY KEY (idPromociones)
);


