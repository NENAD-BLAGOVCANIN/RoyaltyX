import { apiUrl } from "../../common/api/config";

export const getFiles = async () => {
  const response = await fetch(apiUrl + "/data_imports/files/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }

  return await response.json();
};

export const getFile = async (fileId) => {
  const response = await fetch(apiUrl + `/data_imports/files/${fileId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch file");
  }

  return await response.json();
};

export const uploadFile = async (file, data) => {
  const formData = new FormData();
  formData.append("file", file);
  
  // Add other data fields
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  const response = await fetch(apiUrl + "/data_imports/files/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload file");
  }

  return await response.json();
};

export const deleteFile = async (fileId) => {
  const response = await fetch(apiUrl + `/data_imports/files/${fileId}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete file");
  }

  return await response.json();
};
