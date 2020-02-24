/* triggers to updated updated_on timestamp to current timestamp for UPDATE operations*/
CREATE TRIGGER updated_on_links BEFORE UPDATE ON links FOR EACH ROW EXECUTE PROCEDURE update_on_timestamp();
CREATE TRIGGER updated_on_categories BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_on_timestamp();
CREATE TRIGGER updated_on_actions BEFORE UPDATE ON actions FOR EACH ROW EXECUTE PROCEDURE update_on_timestamp();

CREATE TRIGGER process_text_links BEFORE INSERT OR UPDATE ON links FOR EACH ROW EXECUTE PROCEDURE process_text();
CREATE TRIGGER process_text_categories BEFORE INSERT OR UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE process_text();