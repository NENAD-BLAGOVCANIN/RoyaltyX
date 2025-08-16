import useFetch from "../../global/hooks/useFetch";
import useMutation from "../../global/hooks/useMutation";

export const useSources = () => {
  const { data: sources, loading, refetch } = useFetch("/sources/");
  const {
    mutate: createSourceMutation,
    loading: creating,
    error,
  } = useMutation("/sources/", "POST");

  const createSource = async (source) => {
    const createdSource = await createSourceMutation(source);
    await refetch();
    return createdSource;
  };

  if (error) {
    console.log(error.message);
  }

  return {
    sources,
    loading,
    createSource,
    creating,
    error,
    refetch,
  };
};

export const useUserProjectRole = () => {
  const { data: roleData, loading } = useFetch("/sources/user-role/");
  
  return {
    role: roleData?.role,
    canAddSources: roleData?.can_add_sources,
    loading,
  };
};
