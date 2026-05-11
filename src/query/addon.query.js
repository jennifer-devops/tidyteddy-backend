const QUERY = {
  SELECT_ALL_ADDON: "SELECT * FROM addOn ORDER BY addon_id",
  UPDATE_ADDON_PRICE: "UPDATE addOn SET price = ? WHERE addon_id = ?",
  UPDATE_ADDON_QUANTITY: "UPDATE addOn SET max_quantity = ? WHERE addon_id = ?",
  SELECT_ADDON: "SELECT COUNT(*) AS count FROM addOn WHERE addon_id = ?"
}

module.exports = QUERY;