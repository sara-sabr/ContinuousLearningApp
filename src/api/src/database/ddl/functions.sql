/* function that calaculates the current_timestamp for updated_on fields */
CREATE OR REPLACE FUNCTION update_on_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_on = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql STABLE;


/* function that processes text fields into tsvector */
CREATE OR REPLACE FUNCTION process_text()
RETURNS TRIGGER AS $$
BEGIN
	IF OLD.title IS NULL OR NEW.language <> OLD.language OR NEW.title <> OLD.title OR NEW.description <> OLD.description THEN
		IF NEW.language = 'en' THEN
			NEW.ftx_data = to_tsvector('en', NEW.title || '  ' || coalesce(NEW.description, ''));
		ELSEIF NEW.language = 'fr' THEN
			NEW.ftx_data = to_tsvector('fr', NEW.title || '  ' || coalesce(NEW.description, ''));
		END IF;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql STABLE; 


/* create link action logger */
CREATE OR REPLACE FUNCTION log_link_create() 
RETURNS TRIGGER AS $$ 
BEGIN 
	INSERT INTO logs (action_id, link_id, link) VALUES (
		(SELECT id FROM actions WHERE action_name = 'CREATE_LINK'),
		NEW.id,
		NEW.url
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;

/* update link action logger */
CREATE OR REPLACE FUNCTION log_link_update()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO logs (action_id, link_id, link) VALUES (
		(SELECT id FROM actions WHERE action_name = 'UPDATE_LINK'),
		NEW.id,
		NEW.url
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;


/*delete link action logger */
CREATE OR REPLACE FUNCTION log_link_delete()
RETURNS TRIGGER AS $$ 
BEGIN 
	INSERT INTO logs (action_id, link ) VALUES (
		(SELECT id FROM actions WHERE action_name = 'DELETE_LINK'),
		OLD.url 
	);
	UPDATE logs SET link = OLD.url WHERE link_id = OLD.id; 
	RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;


CREATE OR REPLACE FUNCTION log_category_create()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO logs (action_id, category_id, category ) VALUES (
		(SELECT id FROM actions WHERE action_name = 'CREATE_CATEGORY'),
		NEW.id,
		NEW.title
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;


CREATE OR REPLACE FUNCTION log_category_update()
RETURNS TRIGGER AS $$
BEGIN 
	INSERT INTO logs (action_id, category_id, category) VALUES (
		(SELECT id FROM actions WHERE action_name = 'UPDATE_CATEGORY'),
		NEW.id,
		NEW.title
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;


CREATE OR REPLACE FUNCTION log_category_delete()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO logs (action_id, category) VALUES (
		(SELECT id FROM actions WHERE action_name = 'DELETE_CATEGORY'),
		OLD.title
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;