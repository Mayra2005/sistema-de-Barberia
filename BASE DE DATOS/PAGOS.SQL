CREATE TABLE Pagos (
    idPagos INT AUTO_INCREMENT,
    idCitas INT,
    monto DECIMAL(10,2),
    metodo_pago VARCHAR(50),
    fecha DATE,
    PRIMARY KEY (idPagos),
    FOREIGN KEY (idCitas) REFERENCES Citas(idCitas)
);

