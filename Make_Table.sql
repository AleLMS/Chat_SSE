CREATE TABLE viestit2 (
	id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	kuva varchar(100) NOT NULL,
	nimi varchar(30) NOT NULL,
	pvm datetime(3) NOT NULL,
	viesti text NOT NULL,
);

INSERT INTO viestit2 (id, kuva, nimi, pvm, viesti) VALUES
(1, 'empty.jpg', 'Test', '2023-11-17 08:59:08.000', 'The quick brown fox jumps over the lazy fox.');