import useFetch from "../../global/hooks/useFetch";
import useMutation from "../../global/hooks/useMutation";

export const useExpenses = () => {
  const { data: expenses, loading, refetch } = useFetch("/expenses/");
  const {
    mutate: createExpenseMutation,
    loading: creating,
    error: createError,
  } = useMutation("/expenses/", "POST");

  const createExpense = async (expenseData) => {
    const createdExpense = await createExpenseMutation(expenseData);
    await refetch();
    return createdExpense;
  };

  return {
    expenses,
    loading,
    createExpense,
    creating,
    createError,
    refetch,
  };
};

export const useDeleteExpense = () => {
  const deleteExpense = async (expenseId) => {
    const token = localStorage.getItem("access_token");
    
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/expenses/${expenseId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete expense");
    }

    return true;
  };

  return {
    deleteExpense,
    deleting: false,
    deleteError: null,
  };
};

export const useExpense = (expenseId) => {
  const { data: expense, loading, refetch } = useFetch(`/expenses/${expenseId}/`);
  const {
    mutate: updateExpenseMutation,
    loading: updating,
    error: updateError,
  } = useMutation(`/expenses/${expenseId}/`, "PUT");
  const {
    mutate: deleteExpenseMutation,
    loading: deleting,
    error: deleteError,
  } = useMutation(`/expenses/${expenseId}/`, "DELETE");

  const updateExpense = async (expenseData) => {
    const updatedExpense = await updateExpenseMutation(expenseData);
    await refetch();
    return updatedExpense;
  };

  const deleteExpense = async () => {
    await deleteExpenseMutation();
    return true;
  };

  return {
    expense,
    loading,
    updateExpense,
    updating,
    updateError,
    deleteExpense,
    deleting,
    deleteError,
    refetch,
  };
};

export const useProjectMembers = () => {
  const { data: members, loading, error } = useFetch("/expenses/members/");

  return {
    members,
    loading,
    error,
  };
};

export const useProjectProducts = () => {
  const { data: products, loading, error } = useFetch("/expenses/products/");

  return {
    products,
    loading,
    error,
  };
};

export const useExpenseFormData = () => {
  const { members, loading: membersLoading, error: membersError } = useProjectMembers();
  const { products, loading: productsLoading, error: productsError } = useProjectProducts();

  return {
    members,
    products,
    loading: membersLoading || productsLoading,
    error: membersError || productsError,
  };
};
