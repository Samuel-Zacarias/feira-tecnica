
-- Remove o schema se existir
DROP SCHEMA IF EXISTS `gestao_rh`;

-- Cria o schema novamente
CREATE SCHEMA IF NOT EXISTS `gestao_rh` DEFAULT CHARACTER SET utf8;
USE `gestao_rh`;

-- Remove tabelas caso existam (ordem importa por causa da FK)
DROP TABLE IF EXISTS `Funcionario`;
DROP TABLE IF EXISTS `Cargo`;

-- Criação da tabela Cargo
CREATE TABLE IF NOT EXISTS `Cargo` (
  `idCargo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nomeCargo` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`idCargo`),
  UNIQUE INDEX `idCargo_UNIQUE` (`idCargo` ASC),
  UNIQUE INDEX `nomeCargo_UNIQUE` (`nomeCargo` ASC)
) ENGINE = InnoDB;

-- Criação da tabela Funcionario
CREATE TABLE IF NOT EXISTS `Funcionario` (
  `idFuncionario` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nomeFuncionario` VARCHAR(128) NULL,
  `email` VARCHAR(64) NULL,
  `senha` VARCHAR(64) NULL,
  `recebeValeTransporte` TINYINT(1) NULL,
  `Cargo_idCargo` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`idFuncionario`),
  UNIQUE INDEX `idFuncionario_UNIQUE` (`idFuncionario` ASC),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  INDEX `fk_Funcionario_Cargo_idx` (`Cargo_idCargo` ASC),
  CONSTRAINT `fk_Funcionario_Cargo`
    FOREIGN KEY (`Cargo_idCargo`)
    REFERENCES `Cargo` (`idCargo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- Inserção de cargos
INSERT INTO `Cargo` (`idCargo`, `nomeCargo`) VALUES (1, 'Administrador');
INSERT INTO `Cargo` (`idCargo`, `nomeCargo`) VALUES (2, 'Técnico em Informática Jr');
INSERT INTO `Cargo` (`idCargo`, `nomeCargo`) VALUES (3, 'Técnico em Informática Pleno');
INSERT INTO `Cargo` (`idCargo`, `nomeCargo`) VALUES (4, 'Analista de Sistemas Jr');

-- Inserção de funcionários
INSERT INTO `Funcionario` (`nomeFuncionario`, `email`, `senha`, `recebeValeTransporte`, `Cargo_idCargo`) 
VALUES 
('adm', 'adm@adm.com', '$2b$12$6ixafy0UKZx.A8ujEEDfnO2QH7IonQ/5/5UCqzQ51YvISdSO4VVle', 1, 1),
('adm1', 'adm1@adm.com', '$2b$12$6ixafy0UKZx.A8ujEEDfnO2QH7IonQ/5/5UCqzQ51YvISdSO4VVle', 1, 1),
('Hélio', 'helioesperidiao@gmail.com', '$2b$12$6ixafy0UKZx.A8ujEEDfnO2QH7IonQ/5/5UCqzQ51YvISdSO4VVle', 1, 1);

