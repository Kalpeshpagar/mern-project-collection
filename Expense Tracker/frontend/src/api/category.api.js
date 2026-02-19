import api from "./axios";

// create category
export const createCategory = (data) => {
  return api.post("/categories", data);
};

// get categories
export const getCategories = () => {
  return api.get("/categories");
};

// update category
export const updateCategory = (id, data) => {
  return api.patch(`/categories/${id}`, data);
};

// delete category
export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};
