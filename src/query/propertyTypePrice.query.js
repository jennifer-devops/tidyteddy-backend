const QUERY = {
  SELECT_ALL_PRICES: "SELECT * FROM propertyTypePrice ORDER BY property_type_price_id",
  SELECT_PRICE_BY_ID: "SELECT * FROM propertyTypePrice WHERE property_type_price_id = ?",
  CREATE_TYPE_PRICE: "INSERT INTO propertyTypePrice(property_type_price_id, bedroom_count, bathroom_count, property_type, property_type_description, property_type_price, service_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
  UPDATE_TYPE_PRICE: "UPDATE propertyTypePrice SET property_type_description = ?, property_type_price = ? WHERE property_type_price_id = ?",
  DELETE_TYPE_PRICE: "DELETE FROM propertyTypePrice WHERE property_type_price_id = ?"
};

module.exports = QUERY;