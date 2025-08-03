import { useEffect, useState } from "react";
import useMutation from "../../global/hooks/useMutation";
import useFetch from "../../global/hooks/useFetch";

export const useSource = (sourceId) => {
  const [source, setSource] = useState(null);

  const {
    data,
    loading,
    error: fetchError,
  } = useFetch(`/sources/${sourceId}/`);

  useEffect(() => {
    if (data) {
      setSource(data);
    }
  }, [data]);
  
  const {
    mutate: updateSourceMutation,
    loading: updating,
    error: updateError,
  } = useMutation(`/sources/${sourceId}/`, "PUT");

  const {
    mutate: deleteSourceMutation,
    loading: deleting,
    error: deleteError,
  } = useMutation(`/sources/${sourceId}/`, "DELETE");

  const updateSource = async (sourceData) => {
    try {
      const updated = await updateSourceMutation(sourceData);
      if (updated) {
        setSource(updated);
      }
      return updated;
    } catch (error) {
      console.error("Error updating source:", error);
      throw error;
    }
  };

  const deleteSource = async () => {
    deleteSourceMutation();
  };

  const error = updateError || deleteError;

  useEffect(() => {
    if (error) {
      console.log(error.message);
    }
  }, [error]);

  return {
    source,
    loading,
    fetchError,
    updateSource,
    updating,
    deleteSource,
    deleting,
    error,
  };
};
