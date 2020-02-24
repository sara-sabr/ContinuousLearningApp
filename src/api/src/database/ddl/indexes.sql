/* GIN index for TSVECTOR columns on links and categories tables */
CREATE INDEX IF NOT EXISTS links_ftx_idx ON links USING GIN (ftx_data);
CREATE INDEX IF NOT EXISTS categories_ftx_idx ON categories USING GIN (ftx_data);