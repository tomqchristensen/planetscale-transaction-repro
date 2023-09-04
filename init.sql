CREATE TABLE `foo` (
  `id` int NOT NULL, 
  `n` int NOT NULL, 
  CONSTRAINT `foo_id` PRIMARY KEY(`id`)
);

INSERT INTO `foo` (`id`, `n`) 
VALUES 
  (0, 0), 
  (1, 0), 
  (2, 0);
