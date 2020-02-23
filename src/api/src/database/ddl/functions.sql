/* function that calaculates the current_timestamp for updated_on fields */
CREATE OR REPLACE FUNCTION update_on_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_on = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql STABLE;


