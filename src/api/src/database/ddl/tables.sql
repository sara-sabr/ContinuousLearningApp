CREATE TABLE links(
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	url TEXT UNIQUE NOT NULL,
	language TEXT NOT NULL,
	title TEXT UNIQUE NOT NULL,
	image_link TEXT,
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
	image_link TEXT,
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
	created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT link_catagory_pkey PRIMARY KEY (link_id, category_id )
);

CREATE TABLE actions (
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	action_name TEXT UNIQUE NOT NULL,
	description TEXT NOT NULL,
	created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_on TIMESTAMP WITH TIME ZONE 
);

CREATE TABLE logs (
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	action_id INTEGER REFERENCES actions (id) ON UPDATE CASCADE ON DELETE CASCADE,
	link_id INTEGER REFERENCES links (id) ON UPDATE CASCADE ON DELETE SET NULL,
	category_id INTEGER REFERENCES categories (id) ON UPDATE CASCADE ON DELETE SET NULL,
	link TEXT,
	category TEXT,
	created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO actions (action_name, description) VALUES ('CREATE_LINK', 'Link added to database');
INSERT INTO actions (action_name, description) VALUES ('UPDATE_LINK', 'Link information updated');
INSERT INTO actions (action_name, description) VALUES ('DELETE_LINK', 'Link has been delete from database');
INSERT INTO actions (action_name, description) VALUES ('READ_LINK', 'Link has been viewed');
INSERT INTO actions (action_name, description) VALUES ('CREATE_CATEGORY', 'Category has been created');
INSERT INTO actions (action_name, description) VALUES ('UPDATE_CATEGORY', 'Category has been updated');
INSERT INTO actions (action_name, description) VALUES ('DELETE_CATEGORY', 'Category has been deleted');
INSERT INTO actions (action_name, description) VALUES ('READ_CATEGORY', 'Category has been viewed');