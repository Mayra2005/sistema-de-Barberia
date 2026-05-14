CREATE TABLE Estilos (
    idEstilos INT AUTO_INCREMENT,
    idPromociones INT NULL,
    nombre VARCHAR(50),
    descripcion VARCHAR(100),
    precio DECIMAL(10,2),
    PRIMARY KEY (idEstilos),
    FOREIGN KEY (idPromociones) REFERENCES Promociones(idPromociones)
);

