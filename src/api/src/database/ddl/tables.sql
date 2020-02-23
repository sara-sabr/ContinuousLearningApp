CREATE TABLE links(
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	url TEXT UNIQUE NOT NULL,
	language TEXT NOT NULL,
	title TEXT UNIQUE NOT NULL,
	thumb_nail TEXT,
	description TEXT,
	ftx_data TSVECTOR,
	created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_on TIMESTAMP WITH TIME ZONE,
	CONSTRAINT language_english_or_french CHECK (
		language = 'en' OR language = 'fr'
	)
);

CREATE TABLE categories (
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	title TEXT UNIQUE NOT NULL,
	language TEXT NOT NULL,
  	description TEXT,
	thumb_nail TEXT,
	ftx_data TSVECTOR,
	created_on TIMESTAMP WITH TIME ZONE  DEFAULT CURRENT_TIMESTAMP,
	updated_on TIMESTAMP WITH TIME ZONE,
	CONSTRAINT language_english_or_french CHECK (
		language = 'en' OR language = 'fr'
	)
);

CREATE TABLE links_categories_mapper (
	link_id INTEGER REFERENCES links (id) ON UPDATE CASCADE ON DELETE CASCADE, 
	category_id INTEGER REFERENCES categories (id) ON UPDATE CASCADE ON DELETE CASCADE,
	created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);