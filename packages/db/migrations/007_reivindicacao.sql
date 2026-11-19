-- Token da reivindicação do worker: só quem detém a concessão atual grava no lote.
ALTER TABLE lotes ADD COLUMN reivindicacao uuid;
