/* triggers to updated updated_on timestamp to current timestamp for UPDATE operations*/
CREATE TRIGGER updated_on_links BEFORE UPDATE ON links FOR EACH ROW EXECUTE PROCEDURE update_on_timestamp();
CREATE TRIGGER updated_on_categories BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_on_timestamp();
CREATE TRIGGER updated_on_actions BEFORE UPDATE ON actions FOR EACH ROW EXECUTE PROCEDURE update_on_timestamp();

/* ftx text processing triggers for INSERT OR UPDATE for links and categories table */ 
CREATE TRIGGER process_text_links BEFORE INSERT OR UPDATE ON links FOR EACH ROW EXECUTE PROCEDURE process_text();
CREATE TRIGGER process_text_categories BEFORE INSERT OR UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE process_text();


/* logging triggers for links table */
CREATE TRIGGER log_link_create AFTER INSERT ON links FOR EACH ROW EXECUTE PROCEDURE log_link_create();
CREATE TRIGGER log_link_update AFTER UPDATE ON links FOR EACH ROW EXECUTE PROCEDURE log_link_update();
CREATE TRIGGER log_link_delete AFTER DELETE ON links FOR EACH ROW EXECUTE PROCEDURE log_link_delete();


/* logging trigger for categories table */
CREATE TRIGGER log_category_create AFTER INSERT ON categories FOR EACH ROW EXECUTE PROCEDURE log_category_create();
CREATE TRIGGER log_category_update AFTER UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE log_category_update();
CREATE TRIGGER log_category_delete AFTER DELETE ON categories FOR EACH ROW EXECUTE PROCEDURE log_category_delete(); 